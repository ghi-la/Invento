import mongoose from 'mongoose';

const StockMovementSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  fromWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  toWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  quantity: { type: Number, required: true, min: 1 },
  movementType: { 
    type: String, 
    enum: ['transfer', 'adjustment', 'return'], 
    required: true 
  },
  reason: { type: String },
  referenceNumber: { type: String, unique: true },
  status: { 
    type: String, 
    enum: ['pending', 'in-transit', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

const StockMovement = mongoose.model('StockMovement', StockMovementSchema);

export default StockMovement;