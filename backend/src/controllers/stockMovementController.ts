import type { Request, Response } from 'express';
import StockMovement from '../models/mongoDB/stockMovementSchema.ts';
import AuditLog from '../models/mongoDB/auditLogSchema.ts';

export const createStockMovement = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const movementData = { ...req.body, performedBy: req.user?.id };
    const movement = await StockMovement.create(movementData);

    await AuditLog.create({
      action: 'create',
      entityType: 'warehouse',
      entityId: movement._id,
      performedBy: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ message: 'Stock movement created successfully', movement });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllStockMovements = async (_req: Request, res: Response): Promise<void> => {
  try {
    const movements = await StockMovement.find()
      .populate('product', 'name sku')
      .populate('fromWarehouse', 'name code')
      .populate('toWarehouse', 'name code')
      .populate('performedBy', 'username')
      .sort({ createdAt: -1 });
    res.status(200).json(movements);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getStockMovementById = async (req: Request, res: Response): Promise<void> => {
  try {
    const movement = await StockMovement.findById(req.params.id)
      .populate('product')
      .populate('fromWarehouse')
      .populate('toWarehouse')
      .populate('performedBy', 'username email')
      .populate('approvedBy', 'username email');
    
    if (!movement) {
      res.status(404).json({ message: 'Stock movement not found' });
      return;
    }
    
    res.status(200).json(movement);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateStockMovementStatus = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const movement = await StockMovement.findByIdAndUpdate(
      req.params.id,
      { status, approvedBy: req.user?.id },
      { new: true }
    );

    if (!movement) {
      res.status(404).json({ message: 'Stock movement not found' });
      return;
    }

    res.status(200).json({ message: 'Stock movement status updated successfully', movement });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};