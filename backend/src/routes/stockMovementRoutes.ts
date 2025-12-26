import express from 'express';
import {
  createStockMovement,
  getAllStockMovements,
  getStockMovementById,
  updateStockMovementStatus,
} from '../controllers/stockMovementController.ts';
import authMiddleware from '../middlewares/authMiddleware.ts';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Stock movement operations
router.post('/', createStockMovement);
router.get('/', getAllStockMovements);
router.get('/:id', getStockMovementById);
router.patch('/:id/status', updateStockMovementStatus);

export default router;