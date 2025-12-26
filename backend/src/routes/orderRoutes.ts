import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  getOrdersByType,
} from '../controllers/orderController.ts';
import authMiddleware from '../middlewares/authMiddleware.ts';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Order operations
router.post('/', createOrder);
router.get('/', getAllOrders);
router.get('/type/:type', getOrdersByType);
router.get('/:id', getOrderById);
router.put('/:id', updateOrder);
router.patch('/:id/status', updateOrderStatus);

export default router;