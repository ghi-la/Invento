import express from 'express';
import {
  createWarehouse,
  getAllWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse,
} from '../controllers/warehouseController.ts';
import authMiddleware from '../middlewares/authMiddleware.ts';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Warehouse CRUD operations
router.post('/', createWarehouse);
router.get('/', getAllWarehouses);
router.get('/:id', getWarehouseById);
router.put('/:id', updateWarehouse);
router.delete('/:id', deleteWarehouse);

export default router;