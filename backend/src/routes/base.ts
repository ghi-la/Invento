import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.ts';
import categoryRoutes from './categoryRoutes.ts';
import dashboardRoutes from './dashboardRoutes.ts';
import orderRoutes from './orderRoutes.ts';
import productRoutes from './productRoutes.ts';
import stockMovementRoutes from './stockMovementRoutes.ts';
import supplierRoutes from './supplierRoutes.ts';
import transactionRoutes from './transactionRoutes.ts';
import userRoutes from './userRoutes.ts';
import warehouseRoutes from './warehouseRoutes.ts';

const router = express.Router();

// Public routes
router.get('/', (_req, res) => {
  res.send('Invento API - Inventory Management System');
});

router.get('/status', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth routes (public - no middleware)
router.use('/auth', userRoutes);

// Protected routes
router.get('/protected', authMiddleware, (req: any, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// TODO: Uncomment and use these routes when ready
// API routes (protected)
// router.use('/user', authMiddleware, userRoutes);
// router.use('/products', authMiddleware, productRoutes);
// router.use('/categories', authMiddleware, categoryRoutes);
// router.use('/suppliers', authMiddleware, supplierRoutes);
// router.use('/transactions', authMiddleware, transactionRoutes);
// router.use('/orders', authMiddleware, orderRoutes);
// router.use('/warehouses', authMiddleware, warehouseRoutes);
// router.use('/stock-movements', authMiddleware, stockMovementRoutes);
// router.use('/dashboard', authMiddleware, dashboardRoutes);

// TODO: dont use this in production
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/transactions', transactionRoutes);
router.use('/orders', orderRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/stock-movements', stockMovementRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
