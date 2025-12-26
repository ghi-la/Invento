import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 },
});

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, required: true },
  orderType: { type: String, enum: ['purchase', 'sale'], required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  customerName: { type: String },
  customerEmail: { type: String },
  customerPhone: { type: String },
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], 
    default: 'draft' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['unpaid', 'partial', 'paid'], 
    default: 'unpaid' 
  },
  paymentMethod: { type: String },
  shippingAddress: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    zipCode: { type: String },
  },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

// Auto-generate order number
OrderSchema.pre('save', async function (next : any) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    const prefix = this.orderType === 'purchase' ? 'PO' : 'SO';
    this.orderNumber = `${prefix}-${Date.now()}-${count + 1}`;
  }
  next();
});

const Order = mongoose.model('Order', OrderSchema);

export default Order;