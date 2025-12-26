import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  transactionType: { 
    type: String, 
    enum: ['purchase', 'sale', 'adjustment', 'return', 'transfer'], 
    required: true 
  },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  referenceNumber: { type: String, unique: true, required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  notes: { type: String },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'cancelled'], 
    default: 'completed' 
  },
}, {
  timestamps: true,
});

// Auto-generate reference number
TransactionSchema.pre('save', async function (next:any) {
  if (!this.referenceNumber) {
    const count = await mongoose.model('Transaction').countDocuments();
    this.referenceNumber = `TXN-${Date.now()}-${count + 1}`;
  }
  next();
});

const Transaction = mongoose.model('Transaction', TransactionSchema);

export default Transaction;