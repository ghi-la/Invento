import { warehouseType } from '@/types/app';
import { folderType } from '@/types/folder';
import axios from 'axios';

const warehouseEndpoint =
  (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/warehouses';

export const getWarehouses = async () => {
  try {
    const response = await axios.get(`${warehouseEndpoint}/`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching warehouses:', error);
    throw error;
  }
};

export const createWarehouse = async (warehouse: warehouseType) => {
  try {
    const response = await axios.post(
      `${warehouseEndpoint}/`,
      { name: warehouse.name, code: warehouse.code },
      { withCredentials: true },
    );
    return response.data;
  } catch (error: any) {
    console.error('Error creating warehouse:', error);
    throw error;
  }
};

// Mock folder data and functions for demonstration purposes
// TODO: Replace with real API calls when backend is implemented
let mockFolders: folderType[] = [
  {
    id: 'folder-electronics',
    name: 'Electronics',
    description: 'All electronic items',
    parentWarehouseId: 'warehouse123',
    createdBy: 'user456',
  },
  {
    id: 'folder-furniture',
    name: 'Furniture',
    description: 'Home and office furniture',
    parentWarehouseId: 'warehouse123',
    createdBy: 'user789',
  },
  {
    id: 'folder-laptops',
    name: 'Laptops',
    description: 'All kinds of laptops',
    parentWarehouseId: 'warehouse123',
    createdBy: 'user456',
    parentFolderId: 'folder-electronics',
  },
  {
    id: 'folder-smartphones',
    name: 'Smartphones',
    description: 'Mobile phones and accessories',
    parentWarehouseId: 'warehouse123',
    createdBy: 'user456',
    parentFolderId: 'folder-electronics',
  },
  {
    id: 'folder-chairs',
    name: 'Chairs',
    description: 'Office and home chairs',
    parentWarehouseId: 'warehouse123',
    createdBy: 'user789',
    parentFolderId: 'folder-furniture',
  },
  {
    id: 'folder-tables',
    name: 'Tables',
    description: 'Office and home tables',
    parentWarehouseId: 'warehouse123',
    createdBy: 'user789',
    parentFolderId: 'folder-furniture',
  },
  {
    id: 'folder-gaming-laptops',
    name: 'Gaming Laptops',
    description: 'High performance laptops for gaming',
    parentWarehouseId: 'warehouse123',
    createdBy: 'user456',
    parentFolderId: 'folder-laptops',
  },
  {
    id: 'folder-dining-tables',
    name: 'Dining Tables',
    description: 'Tables for dining rooms',
    parentWarehouseId: 'warehouse123',
    createdBy: 'user789',
    parentFolderId: 'folder-tables',
  },
  {
    id: 'folder-sofas',
    name: 'Sofas',
    description: 'Living room sofas',
    parentWarehouseId: 'warehouse123',
    createdBy: 'user789',
    parentFolderId: 'folder-furniture',
  },
  {
    id: 'folder-headphones',
    name: 'Headphones',
    description: 'Audio devices',
    parentWarehouseId: 'warehouse123',
    createdBy: 'user456',
    parentFolderId: 'folder-electronics',
  },
];

export const getFoldersInWarehouse = async (warehouseId: string) => {
  return mockFolders;
};

export const createFolderInWarehouse = async (
  warehouseId: string,
  folder: folderType,
) => {
  mockFolders.push(folder);
  return folder;
};

export const deleteFolderInWarehouse = async (
  warehouseId: string,
  folderId: string,
) => {
  mockFolders = mockFolders.filter((f) => f.id !== folderId);
  return;
};

export const renameFolderInWarehouse = async (
  warehouseId: string,
  folderId: string,
  newName: string,
) => {
  const folder = mockFolders.find((f) => f.id === folderId);
  if (folder) {
    folder.name = newName;
  }
  return folder;
};

export const moveFolderInWarehouse = async (
  warehouseId: string,
  folderId: string,
  newParentFolderId: string | null,
) => {
  const folder = mockFolders.find((f) => f.id === folderId);
  if (folder) {
    folder.parentFolderId = newParentFolderId;
  }
  return folder;
};
