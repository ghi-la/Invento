import mongoose, { Schema } from "mongoose";

const StockMovementSchema = new Schema(
  {
    warehouse: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true, index: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: ["create", "increase", "decrease", "set", "import", "delete"],
      required: true,
    },
    change: { type: Number, default: 0 }, // signed delta
    quantityAfter: { type: Number, required: true },
    reason: { type: String, trim: true, default: "" },
    productNameSnapshot: { type: String, default: "" }, // survives product deletion
  },
  { timestamps: true }
);

StockMovementSchema.index({ warehouse: 1, createdAt: -1 });

export default mongoose.models.StockMovement ||
  mongoose.model("StockMovement", StockMovementSchema);
