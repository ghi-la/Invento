import { Box, Collapse, IconButton, List, ListItemButton, ListItemIcon, ListItemText, TextField, Tooltip } from '@mui/material';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import type { ID, InventoryFolder } from '../types';
import { buildFolderChildrenIndex } from '../utils';
import FolderContextMenu from './context/FolderContextMenu';

type Props = {
  canWriteFolders?: boolean;
  canDeleteFolders?: boolean;

  renameRequestId?: ID | null;
  onRenameRequestConsumed?: () => void;
  folders: InventoryFolder[];
  selectedFolderId: ID;
  expanded: Set<ID>;
  onToggleExpand: (id: ID) => void;
  onSelect: (id: ID) => void;

  onCreateFolder: (parentId: ID | null) => void;
  onRenameFolder: (id: ID, name: string) => void;
  onMoveFolder: (id: ID) => void;
  onDeleteFolder: (id: ID) => void;

  // Drag & drop targets
  onDropItems?: (folderId: ID, itemIds: ID[]) => void;
  onDropFolder?: (folderId: ID, draggedFolderId: ID) => void;
};

export default function FolderTree({
  folders,
  selectedFolderId,
  expanded,
  onToggleExpand,
  onSelect,
  onCreateFolder,
  onRenameFolder,
  onMoveFolder,
  onDeleteFolder,
  onDropItems,
  onDropFolder,
  renameRequestId,
  onRenameRequestConsumed,
  canWriteFolders = true,
  canDeleteFolders = true,
}: Props) {
  const [editingId, setEditingId] = useState<ID | null>(null);
  const [draftName, setDraftName] = useState('');

  useEffect(() => {
  if (!renameRequestId) return;
  const folder = folders.find((f) => f.id === renameRequestId);
  if (!folder) return;
  setEditingId(renameRequestId);
  setDraftName(folder.name);
  onRenameRequestConsumed?.();
}, [folders, onRenameRequestConsumed, renameRequestId]);


  const childrenByParent = buildFolderChildrenIndex(folders);

  const renderNode = (folder: InventoryFolder, depth: number) => {
    const children = childrenByParent.get(folder.id) ?? [];
    const isOpen = expanded.has(folder.id);
    const isSelected = folder.id === selectedFolderId;

    return (
      <Box key={folder.id}>
        <FolderRow
          folder={folder}
          depth={depth}
          hasChildren={children.length > 0}
          isOpen={isOpen}
          isSelected={isSelected}
          onToggleExpand={onToggleExpand}
          onSelect={onSelect}
          onCreateFolder={onCreateFolder}
          onRenameFolder={onRenameFolder}
          editingId={editingId}
          setEditingId={setEditingId}
          draftName={draftName}
          setDraftName={setDraftName}
          onMoveFolder={onMoveFolder}
          onDeleteFolder={onDeleteFolder}
          onDropItems={onDropItems}
          onDropFolder={onDropFolder}
        />

        {children.length > 0 ? (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List disablePadding>
              {children.map((child) => renderNode(child, depth + 1))}
            </List>
          </Collapse>
        ) : null}
      </Box>
    );
  };

  const roots = useMemo(() => childrenByParent.get(null) ?? [], [childrenByParent]);

  return <List sx={{ px: 1 }}>{roots.map((r) => renderNode(r, 0))}</List>;
}

function FolderRow({
  folder,
  depth,
  hasChildren,
  isOpen,
  isSelected,
  onToggleExpand,
  onSelect,
  onCreateFolder,
  onRenameFolder,
  editingId,
  setEditingId,
  draftName,
  setDraftName,
  onMoveFolder,
  onDeleteFolder,
  onDropItems,
  onDropFolder,
}: {
  folder: InventoryFolder;
  depth: number;
  hasChildren: boolean;
  isOpen: boolean;
  isSelected: boolean;
  onToggleExpand: (id: ID) => void;
  onSelect: (id: ID) => void;
  onCreateFolder: (parentId: ID | null) => void;
  onRenameFolder: (id: ID, name: string) => void;
  editingId: ID | null;
  setEditingId: (id: ID | null) => void;
  draftName: string;
  setDraftName: (v: string) => void;
  onMoveFolder: (id: ID) => void;
  onDeleteFolder: (id: ID) => void;
  onDropItems?: (folderId: ID, itemIds: ID[]) => void;
  onDropFolder?: (folderId: ID, draggedFolderId: ID) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const isEditing = editingId === folder.id;

  const handleExpandClick: React.MouseEventHandler = (e) => {
    e.stopPropagation();
    onToggleExpand(folder.id);
  };

  const openMenu: React.MouseEventHandler = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget as HTMLElement);
  };

  const closeMenu = () => setAnchorEl(null);

  const startInlineRename = () => {
    setEditingId(folder.id);
    setDraftName(folder.name);
  };

  const commitRename = () => {
    const name = draftName.trim();
    if (name && name !== folder.name) onRenameFolder(folder.id, name);
    setEditingId(null);
    setDraftName('');
  };

  const itemSx = {
    pl: 1 + depth * 2,
    pr: 1,
    borderRadius: 2,
    mb: 0.25,
    ...(isSelected ? { bgcolor: 'action.selected' } : {}),
  };

  return (
    <ListItemButton
      onClick={() => onSelect(folder.id)}
      selected={isSelected}
      sx={itemSx}
      onDoubleClick={() => startInlineRename()}
      onContextMenu={(e) => {
        e.preventDefault();
        setAnchorEl(e.currentTarget as HTMLElement);
      }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/x-invento-folder', folder.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onDragOver={(e) => {
        // allow dropping items/folders here
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }}
      onDrop={(e) => {
        e.preventDefault();

        // Items
        const rawItems = e.dataTransfer.getData('application/x-invento-items');
        if (rawItems) {
          try {
            const ids = JSON.parse(rawItems) as ID[];
            if (Array.isArray(ids) && ids.length) onDropItems?.(folder.id, ids);
          } catch {
            // ignore
          }
          return;
        }

        // Folder
        const draggedFolderId = e.dataTransfer.getData('application/x-invento-folder') as ID;
        if (draggedFolderId) {
          onDropFolder?.(folder.id, draggedFolderId);
        }
      }}
    >
      <ListItemIcon sx={{ minWidth: 34 }}>
        {isOpen ? <FolderOpenOutlinedIcon fontSize="small" /> : <FolderOutlinedIcon fontSize="small" />}
      </ListItemIcon>

      <ListItemText
        primary={
          isEditing ? (
            <TextField
              value={draftName}
              size="small"
              autoFocus
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitRename();
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  setEditingId(null);
                  setDraftName('');
                }
              }}
              inputProps={{ style: { paddingTop: 6, paddingBottom: 6, fontSize: 13, fontWeight: 600 } }}
            />
          ) : (
            folder.name
          )
        }
        primaryTypographyProps={{ noWrap: true, fontWeight: isSelected ? 600 : 500, fontSize: 13 }}
      />

      {hasChildren ? (
        <Tooltip title={isOpen ? 'Collapse' : 'Expand'}>
          <IconButton size="small" onClick={handleExpandClick}>
            {isOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      ) : (
        <Box sx={{ width: 34 }} />
      )}

      <IconButton size="small" onClick={openMenu}>
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <FolderContextMenu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={closeMenu}
        onCreateSubfolder={() => onCreateFolder(folder.id)}
        onRename={startInlineRename}
        onMove={() => onMoveFolder(folder.id)}
        onDelete={() => onDeleteFolder(folder.id)}
      />
    </ListItemButton>
  );
}
