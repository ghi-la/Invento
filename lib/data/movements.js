import { dbConnect } from "@/lib/mongodb";
import StockMovement from "@/lib/models/StockMovement";

export async function listMovements(warehouseId, { productId, limit = 15 } = {}) {
  await dbConnect();
  const filter = { warehouse: warehouseId };
  if (productId) filter.product = productId;

  const movements = await StockMovement.find(filter)
    .sort({ createdAt: -1 })
    .limit(Math.min(50, limit))
    .populate("user", "name image")
    .populate("product", "name")
    .lean();

  return movements.map((m) => ({
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
  }));
}
