import express from 'express';
import {
  createSupplier,
  deleteSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
} from '../controllers/supplierController.ts';

const router = express.Router();

// Apply auth middleware to all routes
// router.use(authMiddleware);

// Supplier CRUD operations
router.post('/', createSupplier);
router.get('/', getAllSuppliers);
router.get('/:id', getSupplierById);
router.put('/:id', updateSupplier);
router.delete('/:id', deleteSupplier);

export default router;