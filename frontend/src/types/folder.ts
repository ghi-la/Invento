export type folderType = {
  id?: string;
  name: string;
  description?: string;
  parentFolderId?: string | null;
  parentWarehouseId: string;
  isActive?: boolean;
  createdBy: string;
};
