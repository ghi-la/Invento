import type { Request, Response } from 'express';
import Supplier from '../models/mongoDB/supplierSchema.ts';
import AuditLog from '../models/mongoDB/auditLogSchema.ts';

export const createSupplier = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const supplierData = { ...req.body, createdBy: req.user?.id };
    const supplier = await Supplier.create(supplierData);

    await AuditLog.create({
      action: 'create',
      entityType: 'supplier',
      entityId: supplier._id,
      performedBy: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ message: 'Supplier created successfully', supplier });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllSuppliers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const suppliers = await Supplier.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json(suppliers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSupplierById = async (req: Request, res: Response): Promise<void> => {
  try {
    const supplier = await Supplier.findById(req.params.id)
      .populate('createdBy', 'username email');
    
    if (!supplier) {
      res.status(404).json({ message: 'Supplier not found' });
      return;
    }
    
    res.status(200).json(supplier);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSupplier = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const oldSupplier = await Supplier.findById(req.params.id);
    
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!supplier) {
      res.status(404).json({ message: 'Supplier not found' });
      return;
    }

    await AuditLog.create({
      action: 'update',
      entityType: 'supplier',
      entityId: supplier._id,
      changes: { old: oldSupplier, new: supplier },
      performedBy: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({ message: 'Supplier updated successfully', supplier });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteSupplier = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!supplier) {
      res.status(404).json({ message: 'Supplier not found' });
      return;
    }

    await AuditLog.create({
      action: 'delete',
      entityType: 'supplier',
      entityId: supplier._id,
      performedBy: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({ message: 'Supplier deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};