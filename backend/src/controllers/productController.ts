import type { Request, Response } from 'express';
import Product from '../models/mongoDB/productSchema.ts';
import AuditLog from '../models/mongoDB/auditLogSchema.ts';

export const createProduct = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const productData = { ...req.body, createdBy: req.user?.id };
    const product = await Product.create(productData);

    // Log the action
    await AuditLog.create({
      action: 'create',
      entityType: 'product',
      entityId: product._id,
      performedBy: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find({ isActive: true })
      .populate('category', 'name')
      .populate('supplier', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category')
      .populate('supplier')
      .populate('createdBy', 'username email');
    
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    
    res.status(200).json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const oldProduct = await Product.findById(req.params.id);
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user?.id },
      { new: true, runValidators: true }
    );

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Log the changes
    await AuditLog.create({
      action: 'update',
      entityType: 'product',
      entityId: product._id,
      changes: { old: oldProduct, new: product },
      performedBy: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteProduct = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedBy: req.user?.id },
      { new: true }
    );

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Log the deletion
    await AuditLog.create({
      action: 'delete',
      entityType: 'product',
      entityId: product._id,
      performedBy: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const searchProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.query;
    
    const products = await Product.find({
      $text: { $search: query as string },
      isActive: true,
    })
      .populate('category', 'name')
      .populate('supplier', 'name');
    
    res.status(200).json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getLowStockProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$quantity', '$minStockLevel'] },
      isActive: true,
    })
      .populate('category', 'name')
      .populate('supplier', 'name');
    
    res.status(200).json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};