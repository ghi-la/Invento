import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import Category from "@/lib/models/Category";
import Product from "@/lib/models/Product";

// Shared by the API route and the categories page's server component, so
// both the client fetch and the SSR prefetch stay byte-for-byte in sync.
export async function listCategories(warehouseId) {
  await dbConnect();
  const categories = await Category.find({ warehouse: warehouseId }).sort({ name: 1 }).lean();

  const counts = await Product.aggregate([
    { $match: { warehouse: new mongoose.Types.ObjectId(warehouseId), category: { $ne: null } } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id?.toString(), c.count]));

  return categories.map((c) => ({
    id: c._id.toString(),
    name: c.name,
    parent: c.parent ? c.parent.toString() : null,
    color: c.color,
    productCount: countMap[c._id.toString()] || 0,
  }));
}
