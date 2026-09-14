import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import Supplier from "@/lib/models/Supplier";
import EventItem from "@/lib/models/EventItem";

export async function listSuppliers(warehouseId) {
  await dbConnect();
  const suppliers = await Supplier.find({ warehouse: warehouseId }).sort({ name: 1 }).lean();

  const counts = await EventItem.aggregate([
    { $match: { warehouse: new mongoose.Types.ObjectId(warehouseId), supplier: { $ne: null } } },
    { $group: { _id: "$supplier", count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id?.toString(), c.count]));

  return suppliers.map((s) => ({
    id: s._id.toString(),
    name: s.name,
    contactName: s.contactName,
    email: s.email,
    phone: s.phone,
    notes: s.notes,
    eventItemCount: countMap[s._id.toString()] || 0,
  }));
}
