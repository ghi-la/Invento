export type ID = string;

export type InventoryFolder = {
  id: ID;
  name: string;
  parentId: ID | null;
};

export type InventoryAttachment = {
  id: ID;
  name: string;
  url: string;
};

export type CustomFieldType = 'text' | 'number' | 'date' | 'select';

export type InventoryCustomField = {
  id: ID;
  name: string;
  type: CustomFieldType;
  // For 'select'
  options?: string[];
  // Stored value (ISO for date)
  value: string;
};

export type InventoryItem = {
  id: ID;
  folderId: ID; // items live inside folders
  name: string;

  // Common identifiers
  sku?: string;
  barcode?: string;
  serialNumber?: string;

  // Stock
  quantity: number;
  unit?: string;

  // Organisation
  tags: string[];
  location?: string;

  // Pricing
  cost?: number;
  value?: number;

  // Media & docs
  imageUrl?: string;
  attachments: InventoryAttachment[];

  // Flexible metadata
  customFields: InventoryCustomField[];

  updatedAtIso: string; // ISO date-time
};

export type InventoryData = {
  folders: InventoryFolder[];
  items: InventoryItem[];
};
