import mongoose from 'mongoose';

const WarehouseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    // address: {
    //   street: { type: String },
    //   city: { type: String },
    //   state: { type: String },
    //   country: { type: String },
    //   zipCode: { type: String },
    // },
    // manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // capacity: { type: Number },
    // isActive: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Warehouse = mongoose.model('Warehouse', WarehouseSchema);

export default Warehouse;
