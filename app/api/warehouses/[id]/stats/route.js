import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import { requireRole } from "@/lib/apiAuth";

export async function GET(req, { params }) {
  const auth = await requireRole(params.id, "viewer");
  if (auth.error) return auth.error;

  await dbConnect();
  const warehouseId = new mongoose.Types.ObjectId(params.id);

  const [totals] = await Product.aggregate([
    { $match: { warehouse: warehouseId } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalUnits: { $sum: "$quantity" },
        totalValue: { $sum: { $multiply: ["$quantity", "$costPrice"] } },
        lowStockCount: {
          $sum: { $cond: [{ $lte: ["$quantity", "$minStockLevel"] }, 1, 0] },
        },
      },
    },
  ]);

  const categoryBreakdown = await Product.aggregate([
    { $match: { warehouse: warehouseId } },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        units: { $sum: "$quantity" },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 8 },
    {
      $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "category" },
    },
    {
      $project: {
        name: { $ifNull: [{ $arrayElemAt: ["$category.name", 0] }, "Uncategorized"] },
        color: { $ifNull: [{ $arrayElemAt: ["$category.color", 0] }, "#9AA3AF"] },
        count: 1,
        units: 1,
      },
    },
  ]);

  return NextResponse.json({
    totalProducts: totals?.totalProducts || 0,
    totalUnits: totals?.totalUnits || 0,
    totalValue: totals?.totalValue || 0,
    lowStockCount: totals?.lowStockCount || 0,
    categoryBreakdown,
  });
}
