import mongoose, { Schema } from "mongoose";

export const EVENT_ITEM_SOURCES = ["warehouse", "supplier"];

const EventItemSchema = new Schema(
  {
    warehouse: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true, index: true },
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    source: { type: String, enum: EVENT_ITEM_SOURCES, required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", default: null }, // set when source === "warehouse"
    supplier: { type: Schema.Types.ObjectId, ref: "Supplier", default: null }, // set when source === "supplier"
    nameSnapshot: { type: String, required: true, trim: true }, // survives product/supplier deletion
    quantityTaken: { type: Number, required: true, min: 0 },
    quantityReturned: { type: Number, default: 0 }, // kept in sync with the sum of its EventReturn entries
    // Snapshotted at checkout (Product.costPrice, or the entered purchase cost)
    // rather than looked up live, so later edits to the source record don't
    // retroactively change a past event's cost report.
    unitCost: { type: Number, default: 0 },
    shortageQuantity: { type: Number, default: 0 }, // set once, at event close
    reconciledAt: { type: Date, default: null },
    notes: { type: String, trim: true, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

EventItemSchema.index({ event: 1, createdAt: 1 });
EventItemSchema.index({ warehouse: 1, product: 1 });
EventItemSchema.index({ warehouse: 1, supplier: 1 });

export default mongoose.models.EventItem || mongoose.model("EventItem", EventItemSchema);
