import type { folderType } from '@/types/folder';
import { useEffect, useState } from 'react';

export type DialogMode = 'add' | 'rename' | 'move' | null;

interface ContextMenuState {
  mouseX: number;
  mouseY: number;
  folderId: string;
}

export function useFolderTree(initialFolders: folderType[]) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [dialogFolderId, setDialogFolderId] = useState<string | null>(null);
  const [dialogValue, setDialogValue] = useState('');
  const [foldersList, setFoldersList] = useState(initialFolders);

  useEffect(() => {
    setFoldersList(initialFolders);
  }, [initialFolders]);

  const handleToggleExpand = (folderId: string) => {
    setExpanded((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(folderId)) {
        newExpanded.delete(folderId);
      } else {
        newExpanded.add(folderId);
      }
      return newExpanded;
    });
  };

  const handleContextMenu = (
    e: React.MouseEvent<HTMLElement>,
    folderId: string,
  ) => {
    e.preventDefault();
    setContextMenu({
      mouseX: e.clientX - 2,
      mouseY: e.clientY - 4,
      folderId,
    });
  };

  const closeContextMenu = () => setContextMenu(null);

  const openDialog = (
    mode: DialogMode,
    folderId: string | null = null,
    initialValue: string = '',
  ) => {
    setDialogMode(mode);
    setDialogFolderId(folderId);
    setDialogValue(initialValue);
  };

  const closeDialog = () => {
    setDialogMode(null);
    setDialogFolderId(null);
    setDialogValue('');
  };

  return {
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
  };
}
