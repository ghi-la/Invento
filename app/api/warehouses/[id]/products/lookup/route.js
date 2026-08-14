import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import { requireRole } from "@/lib/apiAuth";

export async function GET(req, { params }) {
  const auth = await requireRole(params.id, "viewer");
  if (auth.error) return auth.error;

  const barcode = new URL(req.url).searchParams.get("barcode")?.trim();
  if (!barcode) return NextResponse.json({ error: "Missing barcode." }, { status: 400 });

  await dbConnect();
  const product = await Product.findOne({ warehouse: params.id, barcode }).populate("category", "name color").lean();

  if (!product) return NextResponse.json({ found: false });

  return NextResponse.json({
    found: true,
    product: {
      id: product._id.toString(),
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      quantity: product.quantity,
      unit: product.unit,
      itemsPerBox: product.itemsPerBox,
      minStockLevel: product.minStockLevel,
      category: product.category ? { name: product.category.name, color: product.category.color } : null,
      lowStock: product.quantity <= product.minStockLevel,
    },
  });
}
