import express from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.ts';
import authMiddleware from '../middlewares/authMiddleware.ts';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Category CRUD operations
router.post('/', createCategory);
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;