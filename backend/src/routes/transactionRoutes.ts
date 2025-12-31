import express from 'express';
import {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  getTransactionsByProduct,
  getTransactionsByType,
} from '../controllers/transactionController.ts';

const router = express.Router();

// Apply auth middleware to all routes
// router.use(authMiddleware);

// Transaction operations
router.post('/', createTransaction);
router.get('/', getAllTransactions);
router.get('/type/:type', getTransactionsByType);
router.get('/product/:productId', getTransactionsByProduct);
router.get('/:id', getTransactionById);

export default router;