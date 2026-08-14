import mongoose, { Schema } from "mongoose";

const WarehouseSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    color: { type: String, default: "#F2A93B" }, // used as an accent so users can tell warehouses apart at a glance
  },
  { timestamps: true }
);

export default mongoose.models.Warehouse || mongoose.model("Warehouse", WarehouseSchema);
