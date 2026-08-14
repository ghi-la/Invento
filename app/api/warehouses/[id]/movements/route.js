import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import StockMovement from "@/lib/models/StockMovement";
import { requireRole } from "@/lib/apiAuth";

export async function GET(req, { params }) {
  const auth = await requireRole(params.id, "viewer");
  if (auth.error) return auth.error;

  const url = new URL(req.url);
  const limit = Math.min(50, parseInt(url.searchParams.get("limit") || "15", 10));
  const productId = url.searchParams.get("product");

  await dbConnect();
  const filter = { warehouse: params.id };
  if (productId) filter.product = productId;

  const movements = await StockMovement.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("user", "name image")
    .populate("product", "name")
    .lean();

  return NextResponse.json({
    movements: movements.map((m) => ({
      id: m._id.toString(),
      type: m.type,
      change: m.change,
      quantityAfter: m.quantityAfter,
      reason: m.reason,
      productName: m.product?.name || m.productNameSnapshot,
      productId: m.product?._id?.toString() || null,
      userName: m.user?.name || "Someone",
      userImage: m.user?.image || null,
      createdAt: m.createdAt,
    })),
  });
}
