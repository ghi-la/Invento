import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Card, Divider, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import type { ID } from '../types';
import BreadcrumbsPath from './BreadcrumbsPath';
import BulkActionsBar from './BulkActionsBar';
import BulkTagDialog from './BulkTagDialog';
import ConfirmDialog from './ConfirmDialog';
import CreateNameDialog from './CreateNameDialog';
import EmptyState from './EmptyState';
import FolderTree from './FolderTree';
import InventoryFiltersPopover from './InventoryFiltersPopover';
import InventoryToolbar from './InventoryToolbar';
import ItemCard from './ItemCard';
import ItemUpsertDrawer from './ItemUpsertDrawer';
import MoveFolderDialog from './MoveFolderDialog';
import MoveItemDialog from './MoveItemDialog';
import VirtualizedItemsList from './VirtualizedItemsList';

import { usePermissions } from '@/auth/usePermissions';
import { useAppSelector } from '@/hooks/hooks';
import { addTagsToItems, removeTagsFromItems } from '@/hooks/slices/inventorySlice';
import {
  clearFilters,
  setLocationQuery,
  setLowStockOnly,
  setMissingPhotoOnly,
  setMissingSkuOnly,
  setQtyMax,
  setQtyMin,
  setQuery,
  setSortKey,
  setTagsFilter,
  setUpdatedAfter,
  setUpdatedBefore,
  setViewMode,
} from '@/hooks/slices/inventoryUiSlice';
import { createFolder, createItem, deleteFolder, deleteItem, deleteItems, moveFolder, moveItem, moveItems, renameFolder, updateItem } from '@/hooks/thunks/inventoryThunks';
import { useDispatch } from 'react-redux';
// buildFolderPath previously used for breadcrumbs; kept in BreadcrumbsPath component

const LOW_STOCK_THRESHOLD = 2;


function isDescendant(folders: { id: ID; parentId: ID | null }[], nodeId: ID, maybeAncestorId: ID): boolean {
  let cur = folders.find((f) => f.id === nodeId);
  while (cur?.parentId) {
    if (cur.parentId === maybeAncestorId) return true;
    cur = folders.find((f) => f.id === cur!.parentId);
  }
  return false;
}

function normalizeParentId(id: ID | null | undefined): ID | null {
  if (!id) return null;
  return id === 'root' ? null : id;
}


type Props = {
  selectedFolderId: ID;
  onSelectFolder: (id: ID) => void;
};

export default function InventoryBrowser({ selectedFolderId, onSelectFolder }: Props) {
  const { has } = usePermissions();
  const dispatch = useDispatch();
  const canWriteItems = has('items.write');
  const canDeleteItems = has('items.delete');
  const canWriteFolders = has('folders.write');
  const canDeleteFolders = has('folders.delete');
  const navigate = useNavigate();

  const folders = useAppSelector((s) => s.inventory.folders);
  const items = useAppSelector((s) => s.inventory.items);
  const ui = useAppSelector((s) => s.inventoryUi);

  const [expanded, setExpanded] = useState<Set<ID>>(() => new Set(['root', 'f-lab', 'f-field']));

  const [selectedItemIds, setSelectedItemIds] = useState<ID[]>([]);
  const [hotkeyRenameFolderId, setHotkeyRenameFolderId] = useState<ID | null>(null);

  // Folder dialogs state
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [createFolderParent, setCreateFolderParent] = useState<ID | null>('root');
  const [moveFolderOpen, setMoveFolderOpen] = useState(false);
  const [moveFolderId, setMoveFolderId] = useState<ID | null>(null);
  const [deleteFolderOpen, setDeleteFolderOpen] = useState(false);
  const [deleteFolderId, setDeleteFolderId] = useState<ID | null>(null);

  // Item dialogs state
  const [itemDrawerOpen, setItemDrawerOpen] = useState(false);
  const [itemDrawerMode, setItemDrawerMode] = useState<'create' | 'edit'>('create');
  const [activeItemId, setActiveItemId] = useState<ID | null>(null);
  const [moveItemOpen, setMoveItemOpen] = useState(false);
  const [moveItemIds, setMoveItemIds] = useState<ID[]>([]);
  const [deleteItemOpen, setDeleteItemOpen] = useState(false);
  const [deleteItemIds, setDeleteItemIds] = useState<ID[]>([]);
  const [bulkTagOpen, setBulkTagOpen] = useState(false);

  const selectedFolder = useMemo(() => folders.find((f) => f.id === selectedFolderId), [folders, selectedFolderId]);

  const filteredItems = useMemo(() => {
    const q = ui.query.trim().toLowerCase();
    const requiredTags = new Set(ui.tags);

    const withinFolder = items.filter((it) => it.folderId === selectedFolderId);

    const filtered = withinFolder.filter((it) => {
      if (ui.lowStockOnly && it.quantity > LOW_STOCK_THRESHOLD) return false;

      if (ui.missingSkuOnly && !!it.sku?.trim()) return false;
      if (ui.missingPhotoOnly && !!it.imageUrl) return false;

      if (ui.qtyMin != null && (it.quantity ?? 0) < ui.qtyMin) return false;
      if (ui.qtyMax != null && (it.quantity ?? 0) > ui.qtyMax) return false;

      if (ui.locationQuery.trim()) {
        const hayLoc = (it.location ?? '').toLowerCase();
        if (!hayLoc.includes(ui.locationQuery.trim().toLowerCase())) return false;
      }

      // updatedAfter/updatedBefore are YYYY-MM-DD; compare as dates
      if (ui.updatedAfter) {
        const after = new Date(`${ui.updatedAfter}T00:00:00.000Z`).getTime();
        const t = new Date(it.updatedAtIso).getTime();
        if (Number.isFinite(after) && Number.isFinite(t) && t < after) return false;
      }
      if (ui.updatedBefore) {
        // before end of day
        const before = new Date(`${ui.updatedBefore}T23:59:59.999Z`).getTime();
        const t = new Date(it.updatedAtIso).getTime();
        if (Number.isFinite(before) && Number.isFinite(t) && t > before) return false;
      }

      if (requiredTags.size) {
        const itemTags = new Set(it.tags ?? []);
        for (const t of requiredTags) if (!itemTags.has(t)) return false;
      }

      if (!q) return true;
      const hay = [it.name, it.sku ?? '', it.location ?? '', ...(it.tags ?? [])].join(' ').toLowerCase();
      return hay.includes(q);
    });

    const sorted = [...filtered];
    if (ui.sortKey === 'nameAsc') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (ui.sortKey === 'qtyDesc') {
      sorted.sort((a, b) => (b.quantity ?? 0) - (a.quantity ?? 0));
    } else {
      // updatedDesc
      sorted.sort((a, b) => b.updatedAtIso.localeCompare(a.updatedAtIso));
    }
    return sorted;
  }, [
    items,
    selectedFolderId,
    ui.query,
    ui.tags,
    ui.lowStockOnly,
    ui.missingSkuOnly,
    ui.missingPhotoOnly,
    ui.qtyMin,
    ui.qtyMax,
    ui.updatedAfter,
    ui.updatedBefore,
    ui.locationQuery,
    ui.sortKey,
  ]);

  const allTagOptions = useMemo(() => Array.from(new Set(items.flatMap((i) => i.tags))).sort(), [items]);

  const activeItem = useMemo(() => items.find((x) => x.id === activeItemId) ?? null, [items, activeItemId]);

  
const location = useLocation();
const [searchParams, setSearchParams] = useSearchParams();

useEffect(() => {
  const action = searchParams.get('action');
  if (!action) return;

  if (action === 'newItem') {
    setItemDrawerMode('create');
    setActiveItemId(null);
    setItemDrawerOpen(true);
  } else if (action === 'newFolder') {
    openCreateFolder(selectedFolderId);
  }

  // consume
  searchParams.delete('action');
  setSearchParams(searchParams, { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [location.key]);
useEffect(() => {
    // Folder change resets selection
    setSelectedItemIds([]);
  }, [selectedFolderId]);

useEffect(() => {
  const isEditable = (el: EventTarget | null) => {
    const node = el as HTMLElement | null;
    if (!node) return false;
    const tag = node.tagName?.toLowerCase();
    const editable = (node as any).isContentEditable;
    return editable || tag === 'input' || tag === 'textarea' || tag === 'select';
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (isEditable(e.target)) return;

    // Esc: close dialogs first, else clear selection
    if (e.key === 'Escape') {
      if (deleteItemOpen) return setDeleteItemOpen(false);
      if (moveItemOpen) return setMoveItemOpen(false);
      if (bulkTagOpen) return setBulkTagOpen(false);
      if (itemDrawerOpen) return setItemDrawerOpen(false);
      if (deleteFolderOpen) return setDeleteFolderOpen(false);
      if (moveFolderOpen) return setMoveFolderOpen(false);

      if (selectedItemIds.length) setSelectedItemIds([]);
      return;
    }

    // Delete / Backspace: delete selection
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedItemIds.length) {
      e.preventDefault();
      openBulkDelete();
      return;
    }

    // F2: rename folder (if no items selected) or edit item (if one selected)
    if (e.key === 'F2') {
      e.preventDefault();
      if (selectedItemIds.length === 1) {
        openEditItem(selectedItemIds[0]);
        return;
      }
      if (selectedItemIds.length === 0) {
        setHotkeyRenameFolderId(selectedFolderId);
      }
    }
  };

  document.addEventListener('keydown', onKeyDown);
  return () => document.removeEventListener('keydown', onKeyDown);
}, [
  bulkTagOpen,
  deleteFolderOpen,
  deleteItemOpen,
  itemDrawerOpen,
  moveFolderOpen,
  moveItemOpen,
  selectedFolderId,
  selectedItemIds,
]);


  const selectedSet = useMemo(() => new Set(selectedItemIds), [selectedItemIds]);
  const toggleSelectItem = (id: ID) => {
    setSelectedItemIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const selectAll = (checked: boolean) => {
    setSelectedItemIds(checked ? filteredItems.map((x) => x.id) : []);
  };
  const getDragIds = (id: ID): ID[] => {
    return selectedSet.has(id) && selectedItemIds.length > 0 ? selectedItemIds : [id];
  };

  const toggleExpand = (id: ID) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCreateFolder = (parentId?: ID) => {
    if (!canWriteFolders) return;
    setCreateFolderParent(parentId ?? 'root');
    setCreateFolderOpen(true);
  };

  const openMoveFolder = (id: ID) => {
    if (!canWriteFolders) return;
    setMoveFolderId(id);
    setMoveFolderOpen(true);
  };

  const openDeleteFolder = (id: ID) => {
    if (!canDeleteFolders) return;
    setDeleteFolderId(id);
    setDeleteFolderOpen(true);
  };

  const openCreateItem = () => {
    if (!canWriteItems) return;
    setActiveItemId(null);
    setItemDrawerMode('create');
    setItemDrawerOpen(true);
  };

  const openEditItem = (id: ID) => {
    if (!canWriteItems) return;
    setActiveItemId(id);
    setItemDrawerMode('edit');
    setItemDrawerOpen(true);
  };

  const openMoveItem = (id: ID) => {
    if (!canWriteItems) return;
    setMoveItemIds([id]);
    setMoveItemOpen(true);
  };

  const openDeleteItem = (id: ID) => {
    if (!canDeleteItems) return;
    setDeleteItemIds([id]);
    setDeleteItemOpen(true);
  };

  const openBulkMove = () => {
    if (!canWriteItems) return;
    if (selectedItemIds.length === 0) return;
    setMoveItemIds(selectedItemIds);
    setMoveItemOpen(true);
  };

  const openBulkDelete = () => {
    if (selectedItemIds.length === 0) return;
    setDeleteItemIds(selectedItemIds);
    setDeleteItemOpen(true);
  };

  const openBulkTags = () => {
    if (selectedItemIds.length === 0) return;
    setBulkTagOpen(true);
  };

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ p: 2 }}>
      {/* Left panel: folders */}
      <Card variant="outlined" sx={{ width: { xs: '100%', md: 320 }, borderRadius: 3, overflow: 'hidden' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Folders
          </Typography>
          <Button startIcon={<AddIcon />} size="small" variant="outlined" onClick={() => openCreateFolder(selectedFolderId)}>
            Add
          </Button>
        </Stack>
        <Divider />
        <Box sx={{ maxHeight: { md: 'calc(100vh - 200px)' }, overflow: 'auto' }}>
          <FolderTree canWriteFolders={canWriteFolders} canDeleteFolders={canDeleteFolders}
            folders={folders}
            selectedFolderId={selectedFolderId}
            expanded={expanded}
            onToggleExpand={toggleExpand}
            onSelect={(id) => onSelectFolder(id)}
            onCreateFolder={(parentId) => openCreateFolder(parentId)}
            onRenameFolder={(id, name) => dispatch(renameFolder({ id, name }))}
            onMoveFolder={(id) => openMoveFolder(id)}
            onDeleteFolder={(id) => openDeleteFolder(id)}
            onDropItems={(folderId, itemIds) => {
              // move dragged items (could include items from other folders)
              dispatch(moveItems({ ids: itemIds, folderId }));
              setSelectedItemIds([]);
              onSelectFolder(folderId);
            }}
            renameRequestId={hotkeyRenameFolderId}
            onRenameRequestConsumed={() => setHotkeyRenameFolderId(null)}
            onDropFolder={(destFolderId, draggedFolderId) => {
              // drop folder onto folder = make it a child
              if (draggedFolderId !== destFolderId && !isDescendant(folders, destFolderId, draggedFolderId)) {
              dispatch(moveFolder({ id: draggedFolderId, parentId: normalizeParentId(destFolderId) }));
            }
              // auto expand destination
              if (destFolderId !== 'root') setExpanded((prev) => new Set(prev).add(destFolderId));
            }}
          />
        </Box>
      </Card>

      {/* Right panel: items */}
      <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
        <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              {selectedFolder?.name ?? 'Inventory'}
            </Typography>
            <BreadcrumbsPath folders={folders} folderId={selectedFolderId} onSelectFolder={onSelectFolder} />
          </Box>
          <Divider />
          <Box sx={{ p: 2 }}>
            <InventoryToolbar canCreateItem={canWriteItems}
              query={ui.query}
              onQueryChange={(v) => dispatch(setQuery(v))}
              viewMode={ui.viewMode}
              onViewModeChange={(v) => dispatch(setViewMode(v))}
              onAddItem={openCreateItem}
              filtersSlot={
                <InventoryFiltersPopover
                  allTagOptions={allTagOptions}
                  tags={ui.tags}
                  lowStockOnly={ui.lowStockOnly}
                  sortKey={ui.sortKey}
                  onChangeTags={(tags) => dispatch(setTagsFilter(tags))}
                  onChangeLowStockOnly={(v) => dispatch(setLowStockOnly(v))}
                  missingSkuOnly={ui.missingSkuOnly}
                  missingPhotoOnly={ui.missingPhotoOnly}
                  qtyMin={ui.qtyMin}
                  qtyMax={ui.qtyMax}
                  updatedAfter={ui.updatedAfter}
                  updatedBefore={ui.updatedBefore}
                  locationQuery={ui.locationQuery}
                  onChangeSortKey={(k) => dispatch(setSortKey(k))}
                  onChangeMissingSkuOnly={(v) => dispatch(setMissingSkuOnly(v))}
                  onChangeMissingPhotoOnly={(v) => dispatch(setMissingPhotoOnly(v))}
                  onChangeQtyMin={(v) => dispatch(setQtyMin(v))}
                  onChangeQtyMax={(v) => dispatch(setQtyMax(v))}
                  onChangeUpdatedAfter={(v) => dispatch(setUpdatedAfter(v))}
                  onChangeUpdatedBefore={(v) => dispatch(setUpdatedBefore(v))}
                  onChangeLocationQuery={(v) => dispatch(setLocationQuery(v))}
                  onClear={() => dispatch(clearFilters())}
                />
              }
            />
          </Box>
        </Card>

        {selectedItemIds.length > 0 ? (
          <BulkActionsBar
            count={selectedItemIds.length}
            onClear={() => setSelectedItemIds([])}
            onMove={openBulkMove}
            onTags={openBulkTags}
            onDelete={openBulkDelete}
          />
        ) : null}

        {filteredItems.length === 0 ? (
          <EmptyState
            title="No items here yet"
            subtitle={`Create your first item inside ${selectedFolder?.name ?? 'this folder'}.`}
            actionLabel="Add item"
            onAction={openCreateItem}
          />
        ) : ui.viewMode === 'grid' ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              gap: 2,
            }}
          >
            {filteredItems.map((it) => (
              <ItemCard canWriteItems={canWriteItems} canDeleteItems={canDeleteItems}
                key={it.id}
                item={it}
                selected={selectedSet.has(it.id)}
                onToggleSelect={toggleSelectItem}
                getDragIds={getDragIds}
                onOpen={(id) => navigate(`/items/${id}`)}
                onEdit={openEditItem}
                onMove={openMoveItem}
                onDelete={openDeleteItem}
              />
            ))}
          </Box>
        ) : (
          <VirtualizedItemsList canWriteItems={canWriteItems} canDeleteItems={canDeleteItems}
            items={filteredItems}
            selectedIds={selectedItemIds}
            onToggleSelect={toggleSelectItem}
            onToggleSelectAll={selectAll}
            getDragIds={getDragIds}
            onOpen={(id) => navigate(`/items/${id}`)}
            onEdit={openEditItem}
            onMove={openMoveItem}
            onDelete={openDeleteItem}
            onQuickUpdate={(id, patch) => dispatch(updateItem({ id, patch }))}
          />
        )}
      </Stack>

      {/* Folder dialogs */}
      <CreateNameDialog
        open={createFolderOpen}
        title="Create folder"
        nameLabel="Folder name"
        confirmText="Create"
        onClose={() => setCreateFolderOpen(false)}
        onSubmit={(name) => {
          dispatch(createFolder({ name, parentId: normalizeParentId(createFolderParent) }));
          setCreateFolderOpen(false);
          // auto expand parent so it becomes visible
          if (createFolderParent && createFolderParent !== 'root') setExpanded((prev) => new Set(prev).add(createFolderParent));
        }}
      />

      <MoveFolderDialog
        open={moveFolderOpen}
        folders={folders}
        folderId={moveFolderId}
        onClose={() => setMoveFolderOpen(false)}
        onMove={(parentId) => {
          if (moveFolderId) dispatch(moveFolder({ id: moveFolderId, parentId: normalizeParentId(parentId) }));
          setMoveFolderOpen(false);
        }}
      />

      <ConfirmDialog
        open={deleteFolderOpen}
        title="Delete folder?"
        description="This will delete the folder, all subfolders, and all items inside."
        confirmText="Delete"
        danger
        onClose={() => setDeleteFolderOpen(false)}
        onConfirm={() => {
          if (deleteFolderId) {
            dispatch(deleteFolder({ id: deleteFolderId }));
            // if selected folder is deleted (or a descendant), go back to root
            if (deleteFolderId === selectedFolderId || isDescendant(folders, selectedFolderId, deleteFolderId)) onSelectFolder('root');
          }
          setDeleteFolderOpen(false);
        }}
      />

      {/* Item drawer */}
      <ItemUpsertDrawer
        open={itemDrawerOpen}
        mode={itemDrawerMode}
        folderId={selectedFolderId}
        item={activeItem}
        allTagOptions={allTagOptions}
        onClose={() => setItemDrawerOpen(false)}
        onSubmit={(draft) => {
          if (itemDrawerMode === 'create') {
            dispatch(createItem({ ...draft, folderId: selectedFolderId }));
          } else if (activeItemId) {
            dispatch(updateItem({ id: activeItemId, patch: draft }));
          }
          setItemDrawerOpen(false);
        }}
      />

      <MoveItemDialog
        open={moveItemOpen}
        folders={folders}
        currentFolderId={selectedFolderId}
        count={moveItemIds.length || 1}
        onClose={() => setMoveItemOpen(false)}
        onMove={(folderId) => {
          if (moveItemIds.length <= 1) {
            const id = moveItemIds[0];
            if (id) dispatch(moveItem({ id, folderId }));
          } else {
            dispatch(moveItems({ ids: moveItemIds, folderId }));
          }
          setMoveItemOpen(false);
          setMoveItemIds([]);
          setSelectedItemIds([]);
          onSelectFolder(folderId);
        }}
      />

      <BulkTagDialog
        open={bulkTagOpen}
        count={selectedItemIds.length}
        allTagOptions={allTagOptions}
        onClose={() => setBulkTagOpen(false)}
        onConfirm={(mode, tags) => {
          if (selectedItemIds.length === 0) return;
          if (mode === 'add') dispatch(addTagsToItems({ ids: selectedItemIds, tags }));
          else dispatch(removeTagsFromItems({ ids: selectedItemIds, tags }));
          setBulkTagOpen(false);
        }}
      />

      <ConfirmDialog
        open={deleteItemOpen}
        title={deleteItemIds.length > 1 ? `Delete items (${deleteItemIds.length})?` : 'Delete item?'}
        description={deleteItemIds.length > 1 ? 'This will permanently remove the selected items.' : 'This will permanently remove the item.'}
        confirmText="Delete"
        danger
        onClose={() => setDeleteItemOpen(false)}
        onConfirm={() => {
          if (deleteItemIds.length <= 1) {
            const id = deleteItemIds[0];
            if (id) dispatch(deleteItem({ id }));
          } else {
            dispatch(deleteItems({ ids: deleteItemIds }));
          }
          setDeleteItemOpen(false);
          setDeleteItemIds([]);
          setSelectedItemIds([]);
        }}
      />
    </Stack>
  );
}
