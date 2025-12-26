import type { Request, Response } from 'express';
import Category from '../models/mongoDB/categorySchema.ts';
import AuditLog from '../models/mongoDB/auditLogSchema.ts';

export const createCategory = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const categoryData = { ...req.body, createdBy: req.user?.id };
    const category = await Category.create(categoryData);

    await AuditLog.create({
      action: 'create',
      entityType: 'category',
      entityId: category._id,
      performedBy: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parentCategory', 'name')
      .sort({ name: 1 });
    res.status(200).json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parentCategory')
      .populate('createdBy', 'username email');
    
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    
    res.status(200).json(category);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCategory = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const oldCategory = await Category.findById(req.params.id);
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    await AuditLog.create({
      action: 'update',
      entityType: 'category',
      entityId: category._id,
      changes: { old: oldCategory, new: category },
      performedBy: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({ message: 'Category updated successfully', category });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteCategory = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    await AuditLog.create({
      action: 'delete',
      entityType: 'category',
      entityId: category._id,
      performedBy: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};