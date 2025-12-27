import express from 'express';
import { fakeLogin } from '../controllers/userController.ts';
import authMiddleware from '../middlewares/authMiddleware.ts';
import userRoutes from './userRoutes.ts';
import productRoutes from './productRoutes.ts';
import categoryRoutes from './categoryRoutes.ts';
import supplierRoutes from './supplierRoutes.ts';
import transactionRoutes from './transactionRoutes.ts';
import orderRoutes from './orderRoutes.ts';
import warehouseRoutes from './warehouseRoutes.ts';
import stockMovementRoutes from './stockMovementRoutes.ts';
import dashboardRoutes from './dashboardRoutes.ts';

const router = express.Router();

// Public routes
router.get('/', (_req, res) => {
  res.send('Invento API - Inventory Management System');
});

router.get('/status', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

router.post('/fake-login', fakeLogin);

// Auth routes (public - no middleware)
router.use('/auth', userRoutes);

// Protected routes
router.get('/protected', authMiddleware, (req: any, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// API routes (protected)
router.use('/user', authMiddleware, userRoutes);
router.use('/products', authMiddleware, productRoutes);
router.use('/categories', authMiddleware, categoryRoutes);
router.use('/suppliers', authMiddleware, supplierRoutes);
router.use('/transactions', authMiddleware, transactionRoutes);
router.use('/orders', authMiddleware, orderRoutes);
router.use('/warehouses', authMiddleware, warehouseRoutes);
router.use('/stock-movements', authMiddleware, stockMovementRoutes);
router.use('/dashboard', authMiddleware, dashboardRoutes);

export default router;
