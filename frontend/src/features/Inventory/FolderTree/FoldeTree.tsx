import type { folderType } from '@/types/folder';
import AddIcon from '@mui/icons-material/Add';
import { Button, List, Paper, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import {
  handleAddSubfolder,
  handleDeleteFolder,
  handleMoveFolder,
  handleRenameFolder,
} from './FolderActions';
import { FolderContextMenu } from './FolderContextMenu';
import { FolderDialog } from './FolderDialog';
import { FolderNode } from './FolderNode';
import {
  buildFolderChildrenIndex,
  getFolderId,
  getRootFolders,
} from './folderUtils';
import { useFolderTree } from './useFolderTree';

type Props = {
  folders: folderType[];
  selectedFolderId?: string;
  onSelect?: (folderId: string) => void;
  onFoldersChange?: (folders: folderType[]) => void;
  warehouseId?: string;
};

export default function FolderTree({
  folders,
  selectedFolderId,
  onSelect,
  onFoldersChange,
  warehouseId = 'warehouse123',
}: Readonly<Props>) {
  const {
    expanded,
    contextMenu,
    dialogMode,
    dialogFolderId,
    dialogValue,
    foldersList,
    setFoldersList,
    setDialogValue,
    handleToggleExpand,
    handleContextMenu,
    closeContextMenu,
    openDialog,
    closeDialog,
  } = useFolderTree(folders);

  const childrenByParent = useMemo(
    () => buildFolderChildrenIndex(foldersList),
    [foldersList],
  );

  const handleMenuAddSubfolder = () => {
    closeContextMenu();
    openDialog('add', contextMenu?.folderId || null);
  };

  const handleMenuRename = () => {
    closeContextMenu();
    const folder = foldersList.find((f) => f.id === contextMenu?.folderId);
    openDialog('rename', contextMenu?.folderId || null, folder?.name || '');
  };

  const handleMenuMove = () => {
    closeContextMenu();
    openDialog('move', contextMenu?.folderId || null);
  };

  const handleMenuDelete = async () => {
    closeContextMenu();
    if (!contextMenu?.folderId) return;
    const updated = await handleDeleteFolder(
      warehouseId,
      contextMenu.folderId,
      foldersList,
    );
    setFoldersList(updated);
    onFoldersChange?.(updated);
  };

  const handleDialogConfirm = async () => {
    if (!dialogFolderId) return;

    try {
      let updated: folderType[];

      if (dialogMode === 'add') {
        updated = await handleAddSubfolder(
          warehouseId,
          dialogFolderId,
          dialogValue,
          foldersList,
        );
      } else if (dialogMode === 'rename') {
        updated = await handleRenameFolder(
          warehouseId,
          dialogFolderId,
          dialogValue,
          foldersList,
        );
      } else if (dialogMode === 'move') {
        updated = await handleMoveFolder(
          warehouseId,
          dialogFolderId,
          dialogValue || null,
          foldersList,
        );
      } else {
        return;
      }

      setFoldersList(updated);
      onFoldersChange?.(updated);
    } catch (error) {
      console.error('Error:', error);
    }

    closeDialog();
  };

  const handleAddRootFolder = () => {
    openDialog('add', null);
  };

  const renderNode = (folder: folderType, depth: number) => {
    const folderId = getFolderId(folder);
    const children = childrenByParent.get(folderId) ?? [];
    const isOpen = expanded.has(folderId);
    const isSelected = folderId === selectedFolderId;

    return (
      <FolderNode
        key={folderId}
        folder={folder}
        depth={depth}
        hasChildren={children.length > 0}
        isOpen={isOpen}
        isSelected={isSelected}
        folderId={folderId}
        onSelect={(id) => onSelect?.(id)}
        onToggleExpand={handleToggleExpand}
        onContextMenu={handleContextMenu}
        childrenNodes={children.map((child) => renderNode(child, depth + 1))}
      />
    );
  };

  const roots = useMemo(
    () => getRootFolders(childrenByParent),
    [childrenByParent],
  );

  return (
    <Paper sx={{ p: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Folders</Typography>
        <Button
          startIcon={<AddIcon />}
          size="small"
          onClick={handleAddRootFolder}
          variant="outlined"
        >
          ADD
        </Button>
      </Stack>

      <List sx={{ px: 0 }}>{roots.map((r) => renderNode(r, 0))}</List>

      <FolderContextMenu
        contextMenu={contextMenu}
        onClose={closeContextMenu}
        onAddSubfolder={handleMenuAddSubfolder}
        onRename={handleMenuRename}
        onMove={handleMenuMove}
        onDelete={handleMenuDelete}
      />

      <FolderDialog
        mode={dialogMode}
        value={dialogValue}
        onValueChange={setDialogValue}
        onConfirm={handleDialogConfirm}
        onCancel={closeDialog}
      />
    </Paper>
  );
}
