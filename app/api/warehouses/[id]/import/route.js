import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import StockMovement from "@/lib/models/StockMovement";
import { requireRole } from "@/lib/apiAuth";

const rowSchema = z.object({
  name: z.string().trim().min(1),
  sku: z.string().trim().optional().default(""),
  barcode: z.string().trim().optional().default(""),
  category: z.string().trim().optional().default(""),
  unit: z.string().trim().optional().default("pcs"),
  quantity: z.coerce.number().min(0).optional().default(0),
  minStockLevel: z.coerce.number().min(0).optional().default(0),
  costPrice: z.coerce.number().min(0).optional().default(0),
  sellPrice: z.coerce.number().min(0).optional().default(0),
  location: z.string().trim().optional().default(""),
  description: z.string().trim().optional().default(""),
});

const bodySchema = z.object({
  rows: z.array(rowSchema).min(1).max(5000),
  mode: z.enum(["create", "upsert"]).default("upsert"),
});

export async function POST(req, { params }) {
  const auth = await requireRole(params.id, "editor");
  if (auth.error) return auth.error;

  const body = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid file." }, { status: 400 });
  }
  const { rows, mode } = parsed.data;

  await dbConnect();

  // --- Resolve / create categories referenced by name ---
  const existingCategories = await Category.find({ warehouse: params.id }).lean();
  const categoryByName = new Map(existingCategories.map((c) => [c.name.toLowerCase(), c._id]));
  const namesNeeded = [...new Set(rows.map((r) => r.category).filter(Boolean))];
  const namesToCreate = namesNeeded.filter((n) => !categoryByName.has(n.toLowerCase()));
  if (namesToCreate.length) {
    const created = await Category.insertMany(
      namesToCreate.map((name) => ({ warehouse: params.id, name, parent: null }))
    );
    created.forEach((c) => categoryByName.set(c.name.toLowerCase(), c._id));
  }

  // --- Match existing products by SKU / barcode for upsert mode ---
  const existingProducts =
    mode === "upsert" ? await Product.find({ warehouse: params.id }).select("sku barcode quantity").lean() : [];
  const bySku = new Map(existingProducts.filter((p) => p.sku).map((p) => [p.sku.toLowerCase(), p]));
  const byBarcode = new Map(existingProducts.filter((p) => p.barcode).map((p) => [p.barcode.toLowerCase(), p]));

  const ops = [];
  const movementDocs = [];
  let created = 0;
  let updated = 0;

  for (const row of rows) {
    const categoryId = row.category ? categoryByName.get(row.category.toLowerCase()) : null;
    const match =
      mode === "upsert"
        ? (row.sku && bySku.get(row.sku.toLowerCase())) ||
          (row.barcode && byBarcode.get(row.barcode.toLowerCase()))
        : null;

    const doc = {
      name: row.name,
      sku: row.sku,
      barcode: row.barcode,
      category: categoryId || null,
      unit: row.unit,
      quantity: row.quantity,
      minStockLevel: row.minStockLevel,
      costPrice: row.costPrice,
      sellPrice: row.sellPrice,
      location: row.location,
      description: row.description,
    };

    if (match) {
      ops.push({ updateOne: { filter: { _id: match._id }, update: { $set: doc } } });
      movementDocs.push({
        warehouse: params.id,
        product: match._id,
        user: auth.user.id,
        type: "import",
        change: row.quantity - (match.quantity || 0),
        quantityAfter: row.quantity,
        reason: "CSV import (matched existing)",
        productNameSnapshot: row.name,
      });
      updated++;
    } else {
      const newId = new (await import("mongoose")).default.Types.ObjectId();
      ops.push({
        insertOne: { document: { _id: newId, warehouse: params.id, createdBy: auth.user.id, ...doc } },
      });
      movementDocs.push({
        warehouse: params.id,
        product: newId,
        user: auth.user.id,
        type: "import",
        change: row.quantity,
        quantityAfter: row.quantity,
        reason: "CSV import (new product)",
        productNameSnapshot: row.name,
      });
      created++;
    }
  }

  if (ops.length) await Product.bulkWrite(ops, { ordered: false });
  if (movementDocs.length) await StockMovement.insertMany(movementDocs, { ordered: false });

  return NextResponse.json({ created, updated, categoriesCreated: namesToCreate.length });
}
