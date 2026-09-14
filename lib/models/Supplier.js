import mongoose, { Schema } from "mongoose";

const SupplierSchema = new Schema(
  {
    warehouse: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true, index: true },
    name: { type: String, required: true, trim: true },
    contactName: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

SupplierSchema.index({ warehouse: 1, name: 1 });

export default mongoose.models.Supplier || mongoose.model("Supplier", SupplierSchema);
