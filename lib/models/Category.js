import mongoose, { Schema } from "mongoose";

const CategorySchema = new Schema(
  {
    warehouse: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true, index: true },
    name: { type: String, required: true, trim: true },
    parent: { type: Schema.Types.ObjectId, ref: "Category", default: null }, // null = top-level category
    color: { type: String, default: "#5B7FDB" },
  },
  { timestamps: true }
);

CategorySchema.index({ warehouse: 1, parent: 1, name: 1 });

export default mongoose.models.Category || mongoose.model("Category", CategorySchema);
