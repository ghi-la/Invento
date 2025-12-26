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

// Protected routes
router.get('/protected', authMiddleware, (req: any, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// API routes
router.use('/user', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/transactions', transactionRoutes);
router.use('/orders', orderRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/stock-movements', stockMovementRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
