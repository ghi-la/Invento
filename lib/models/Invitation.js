import mongoose, { Schema } from "mongoose";
import crypto from "crypto";

const InvitationSchema = new Schema(
  {
    warehouse: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true, index: true },
    role: { type: String, enum: ["admin", "editor", "viewer"], required: true },
    token: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomBytes(24).toString("hex"),
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Invitation || mongoose.model("Invitation", InvitationSchema);
