import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema(
  {
    warehouse: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true, index: true },
    name: { type: String, required: true, trim: true },
    sku: { type: String, trim: true, default: "" },
    barcode: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    category: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    unit: { type: String, trim: true, default: "pcs" },
    itemsPerBox: { type: Number, default: 0 }, // when unit is "box": how many individual items each box holds
    quantity: { type: Number, required: true, default: 0 },
    minStockLevel: { type: Number, default: 0 }, // triggers "low stock" once quantity <= this
    costPrice: { type: Number, default: 0 },
    sellPrice: { type: Number, default: 0 },
    location: { type: String, trim: true, default: "" }, // shelf / bin / aisle
    imageUrl: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

ProductSchema.index({ warehouse: 1, name: "text", sku: "text", barcode: "text" });
ProductSchema.index({ warehouse: 1, barcode: 1 });
ProductSchema.index({ warehouse: 1, sku: 1 });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
