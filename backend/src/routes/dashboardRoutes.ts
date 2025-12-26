import express from 'express';
import Product from '../models/mongoDB/productSchema.ts';
import Order from '../models/mongoDB/orderSchema.ts';
import Transaction from '../models/mongoDB/transactionSchema.ts';
import authMiddleware from '../middlewares/authMiddleware.ts';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Dashboard statistics
router.get('/stats', async (_req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true });
    const lowStockProducts = await Product.countDocuments({
      $expr: { $lte: ['$quantity', '$minStockLevel'] },
      isActive: true,
    });
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    
    // Calculate total inventory value
    const products = await Product.find({ isActive: true });
    const totalInventoryValue = products.reduce((sum, product) => {
      return sum + (product.quantity * product.costPrice);
    }, 0);

    // Recent transactions
    const recentTransactions = await Transaction.find()
      .populate('product', 'name sku')
      .populate('performedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      totalProducts,
      lowStockProducts,
      totalOrders,
      pendingOrders,
      totalInventoryValue,
      recentTransactions,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Sales analytics
router.get('/sales', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filter: any = { transactionType: 'sale' };
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const sales = await Transaction.find(filter)
      .populate('product', 'name sku')
      .sort({ createdAt: -1 });

    const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);

    res.status(200).json({
      sales,
      totalSales,
      totalQuantity,
      count: sales.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Inventory report
router.get('/inventory-report', async (_req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate('category', 'name')
      .populate('supplier', 'name')
      .sort({ quantity: 1 });

    const report = {
      totalProducts: products.length,
      totalValue: products.reduce((sum, p) => sum + (p.quantity * p.costPrice), 0),
      lowStock: products.filter(p => p.quantity <= p.minStockLevel).length,
      outOfStock: products.filter(p => p.quantity === 0).length,
      products: products.map(p => ({
        id: p._id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        supplier: p.supplier,
        quantity: p.quantity,
        minStockLevel: p.minStockLevel,
        value: p.quantity * p.costPrice,
        status: p.quantity === 0 ? 'out-of-stock' : p.quantity <= p.minStockLevel ? 'low-stock' : 'in-stock',
      })),
    };

    res.status(200).json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;