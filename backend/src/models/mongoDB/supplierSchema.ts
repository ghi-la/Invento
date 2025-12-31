import mongoose from 'mongoose';

const SupplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    contactPerson: { type: String },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      zipCode: { type: String },
    },
    taxId: { type: String },
    paymentTerms: { type: String },
    isActive: { type: Boolean, default: true },
    // TODO: Add reference to User model
    // createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

const Supplier = mongoose.model('Supplier', SupplierSchema);

export default Supplier;