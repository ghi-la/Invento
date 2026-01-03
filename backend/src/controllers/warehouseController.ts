import type { Request, Response } from 'express';
import AuditLog from '../models/mongoDB/auditLogSchema.ts';
import Warehouse from '../models/mongoDB/warehouseSchema.ts';

export const createWarehouse = async (
  req: Request & { user?: any },
  res: Response
): Promise<void> => {
  try {
    const warehouseName = req.body.name.trim();
    const warehouseCode = req.body.code?.trim() ?? 'N/A';
    const createdBy = req.user?._id;

    const warehouseData = {
      name: warehouseName,
      code: warehouseCode,
      createdBy: createdBy,
    };
    const warehouse = await Warehouse.create(warehouseData);

    await AuditLog.create({
      action: 'create',
      entityType: 'warehouse',
      entityId: warehouse._id,
      performedBy: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res
      .status(201)
      .json({ message: 'Warehouse created successfully', warehouse });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllWarehouses = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const warehouses = await Warehouse.find({ isActive: true })
      .populate('manager', 'username email')
      .sort({ name: 1 });
    res.status(200).json(warehouses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getWarehouseById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const warehouse = await Warehouse.findById(req.params.id)
      .populate('manager', 'username email')
      .populate('createdBy', 'username email');

    if (!warehouse) {
      res.status(404).json({ message: 'Warehouse not found' });
      return;
    }

    res.status(200).json(warehouse);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateWarehouse = async (
  req: Request & { user?: any },
  res: Response
): Promise<void> => {
  try {
    const oldWarehouse = await Warehouse.findById(req.params.id);

    const warehouse = await Warehouse.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!warehouse) {
      res.status(404).json({ message: 'Warehouse not found' });
      return;
    }

    await AuditLog.create({
      action: 'update',
      entityType: 'warehouse',
      entityId: warehouse._id,
      changes: { old: oldWarehouse, new: warehouse },
      performedBy: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res
      .status(200)
      .json({ message: 'Warehouse updated successfully', warehouse });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteWarehouse = async (
  req: Request & { user?: any },
  res: Response
): Promise<void> => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!warehouse) {
      res.status(404).json({ message: 'Warehouse not found' });
      return;
    }

    await AuditLog.create({
      action: 'delete',
      entityType: 'warehouse',
      entityId: warehouse._id,
      performedBy: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({ message: 'Warehouse deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
