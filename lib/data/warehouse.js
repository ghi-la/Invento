import { dbConnect } from "@/lib/mongodb";
import Warehouse from "@/lib/models/Warehouse";

export async function getWarehouseSettings(warehouseId) {
  await dbConnect();
  const warehouse = await Warehouse.findById(warehouseId).lean();
  if (!warehouse) return null;

  return {
    id: warehouse._id.toString(),
    name: warehouse.name,
    description: warehouse.description,
    location: warehouse.location,
    color: warehouse.color,
    currency: warehouse.currency || "USD",
  };
}
