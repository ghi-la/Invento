import AuditLog from '../models/mongoDB/auditLogSchema.ts';
import Folder from '../models/mongoDB/folderSchema.ts';

type folderDataType = {
  name: string;
  description?: string;
  parentFolder?: string;
  parentWarehouse: string;
  isActive?: boolean;
  createdBy: string;
};

export const createFolder = async (req, res) => {
  const folder: folderDataType = {
    name: req.body.name,
    description: req.body.description,
    parentFolder: req.body.parentFolder,
    parentWarehouse: req.body.parentWarehouse,
    isActive: req.body.isActive || true,
    createdBy: req.user?.id,
  };
  if (!folder.name || !folder.parentWarehouse || !folder.createdBy) {
    res
      .status(400)
      .json({ message: 'Name, Parent Warehouse, and Created By are required' });
    return;
  }

  try {
    const newFolder = new Folder(folder);
    await newFolder.save();

    await AuditLog.create({
      action: 'create',
      entityType: 'folder',
      entityId: newFolder._id,
      performedBy: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res
      .status(201)
      .json({ message: 'Folder created successfully', folder: newFolder });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
