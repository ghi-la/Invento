import mongoose, { Schema } from "mongoose";

export const EVENT_STATUSES = ["planning", "active", "completed"];

const EventSchema = new Schema(
  {
    warehouse: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    // "completed" is one-way and only reachable through the /close action route,
    // since closing an event writes off any outstanding quantity as a shortage.
    status: { type: String, enum: EVENT_STATUSES, default: "planning" },
    closedAt: { type: Date, default: null },
    closedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

EventSchema.index({ warehouse: 1, startDate: -1 });
EventSchema.index({ warehouse: 1, status: 1 });

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
