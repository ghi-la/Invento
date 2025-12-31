import express from 'express';
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getLowStockProducts,
  getProductById,
  searchProducts,
  updateProduct,
} from '../controllers/productController.ts';

const router = express.Router();

// Apply auth middleware to all routes
// router.use(authMiddleware);

// Product CRUD operations
router.post('/', createProduct);
router.get('/', getAllProducts);
router.get('/low-stock', getLowStockProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;