import mongoose, { Schema } from "mongoose";

const WidgetSchema = new Schema(
  {
    id: { type: String, required: true }, // unique instance id, e.g. "lowStock-1"
    type: { type: String, required: true }, // widget component key, e.g. "lowStock"
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    w: { type: Number, default: 4 },
    h: { type: Number, default: 3 },
  },
  { _id: false }
);

const DashboardLayoutSchema = new Schema(
  {
    warehouse: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    widgets: { type: [WidgetSchema], default: [] },
  },
  { timestamps: true }
);

DashboardLayoutSchema.index({ warehouse: 1, user: 1 }, { unique: true });

export default mongoose.models.DashboardLayout ||
  mongoose.model("DashboardLayout", DashboardLayoutSchema);
