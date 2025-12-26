import type { Request, Response } from 'express';
import Order from '../models/mongoDB/orderSchema.ts';
import AuditLog from '../models/mongoDB/auditLogSchema.ts';

export const createOrder = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const orderData = { ...req.body, createdBy: req.user?.id };
    const order = await Order.create(orderData);

    await AuditLog.create({
      action: 'create',
      entityType: 'order',
      entityId: order._id,
      performedBy: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllOrders = async (_req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find()
      .populate('items.product', 'name sku')
      .populate('supplier', 'name')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('supplier')
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email');
    
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    
    res.status(200).json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrder = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const oldOrder = await Order.findById(req.params.id);
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user?.id },
      { new: true, runValidators: true }
    );

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    await AuditLog.create({
      action: 'update',
      entityType: 'order',
      entityId: order._id,
      changes: { old: oldOrder, new: order },
      performedBy: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({ message: 'Order updated successfully', order });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedBy: req.user?.id },
      { new: true }
    );

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    res.status(200).json({ message: 'Order status updated successfully', order });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getOrdersByType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.params;
    const orders = await Order.find({ orderType: type })
      .populate('items.product', 'name sku')
      .populate('supplier', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};