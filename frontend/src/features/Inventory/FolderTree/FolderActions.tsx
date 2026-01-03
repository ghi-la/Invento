import {
  createFolderInWarehouse,
  deleteFolderInWarehouse,
  moveFolderInWarehouse,
  renameFolderInWarehouse,
} from '@/lib/warehouse';
import type { folderType } from '@/types/folder';
import type { DialogMode } from './useFolderTree';

export async function handleAddSubfolder(
  warehouseId: string,
  parentFolderId: string | null,
  folderName: string,
  foldersList: folderType[],
): Promise<folderType[]> {
  const newFolder: folderType = {
    id: `folder-${Date.now()}`,
    name: folderName,
    parentWarehouseId: warehouseId,
    createdBy: 'user',
    parentFolderId: parentFolderId || undefined,
  };

  await createFolderInWarehouse(warehouseId, newFolder);
  return [...foldersList, newFolder];
}

export async function handleRenameFolder(
  warehouseId: string,
  folderId: string,
  newName: string,
  foldersList: folderType[],
): Promise<folderType[]> {
  await renameFolderInWarehouse(warehouseId, folderId, newName);

  return foldersList.map((f) =>
    f.id === folderId ? { ...f, name: newName } : f,
  );
}

export async function handleMoveFolder(
  warehouseId: string,
  folderId: string,
  newParentId: string | null,
  foldersList: folderType[],
): Promise<folderType[]> {
  await moveFolderInWarehouse(warehouseId, folderId, newParentId);

  return foldersList.map((f) =>
    f.id === folderId ? { ...f, parentFolderId: newParentId || undefined } : f,
  );
}

export async function handleDeleteFolder(
  warehouseId: string,
  folderId: string,
  foldersList: folderType[],
): Promise<folderType[]> {
  await deleteFolderInWarehouse(warehouseId, folderId);
  return foldersList.filter((f) => f.id !== folderId);
}

export function getDialogConfig(mode: DialogMode): {
  title: string;
  label: string;
} {
  switch (mode) {
    case 'add':
      return { title: 'Add Subfolder', label: 'Folder Name' };
    case 'rename':
      return { title: 'Rename Folder', label: 'New Name' };
    case 'move':
      return {
        title: 'Move Folder',
        label: 'Parent Folder ID (leave empty for root)',
      };
    default:
      return { title: '', label: '' };
  }
}
