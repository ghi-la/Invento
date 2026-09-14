import mongoose, { Schema } from "mongoose";

const EventReturnSchema = new Schema(
  {
    warehouse: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true, index: true },
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    eventItem: { type: Schema.Types.ObjectId, ref: "EventItem", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    quantity: { type: Number, required: true, min: 1 },
    note: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

EventReturnSchema.index({ event: 1, createdAt: -1 });

export default mongoose.models.EventReturn || mongoose.model("EventReturn", EventReturnSchema);
