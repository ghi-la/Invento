import type { Request, Response } from 'express';
import Transaction from '../models/mongoDB/transactionSchema.ts';
import Product from '../models/mongoDB/productSchema.ts';
import AuditLog from '../models/mongoDB/auditLogSchema.ts';

export const createTransaction = async (req: Request & { user?: any }, res: Response): Promise<void> => {
  try {
    const transactionData = { ...req.body, performedBy: req.user?.id };
    const transaction = await Transaction.create(transactionData);

    // Update product quantity based on transaction type
    const product = await Product.findById(transaction.product);
    if (product) {
      if (transaction.transactionType === 'purchase') {
        product.quantity += transaction.quantity;
      } else if (transaction.transactionType === 'sale') {
        product.quantity -= transaction.quantity;
      } else if (transaction.transactionType === 'adjustment') {
        product.quantity = transaction.quantity;
      }
      await product.save();
    }

    await AuditLog.create({
      action: 'create',
      entityType: 'transaction',
      entityId: transaction._id,
      performedBy: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({ message: 'Transaction created successfully', transaction });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllTransactions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await Transaction.find()
      .populate('product', 'name sku')
      .populate('supplier', 'name')
      .populate('performedBy', 'username')
      .sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTransactionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('product')
      .populate('supplier')
      .populate('performedBy', 'username email');
    
    if (!transaction) {
      res.status(404).json({ message: 'Transaction not found' });
      return;
    }
    
    res.status(200).json(transaction);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTransactionsByProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await Transaction.find({ product: req.params.productId })
      .populate('supplier', 'name')
      .populate('performedBy', 'username')
      .sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTransactionsByType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.params;
    const transactions = await Transaction.find({ transactionType: type })
      .populate('product', 'name sku')
      .populate('supplier', 'name')
      .populate('performedBy', 'username')
      .sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};