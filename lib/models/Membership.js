import mongoose, { Schema } from "mongoose";

export const ROLES = ["owner", "admin", "editor", "viewer"];

const MembershipSchema = new Schema(
  {
    warehouse: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role: { type: String, enum: ROLES, required: true, default: "viewer" },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

MembershipSchema.index({ warehouse: 1, user: 1 }, { unique: true });

export default mongoose.models.Membership || mongoose.model("Membership", MembershipSchema);
