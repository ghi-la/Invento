import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';
import type { ID, InventoryFolder, InventoryItem } from '../../features/Inventory/types';
import { mockInventory } from '../../features/Inventory/mock';

export type InventoryState = {
  folders: InventoryFolder[];
  items: InventoryItem[];
};

const initialState: InventoryState = {
  folders: mockInventory.folders,
  items: mockInventory.items,
};

type CreateFolderPayload = { name: string; parentId: ID | null; id?: ID };
type RenameFolderPayload = { id: ID; name: string };
type MoveFolderPayload = { id: ID; parentId: ID | null };
type DeleteFolderPayload = { id: ID };

type CreateItemPayload = Omit<InventoryItem, 'id' | 'updatedAtIso'> & { id?: ID };
type UpdateItemPayload = { id: ID; patch: Partial<Omit<InventoryItem, 'id' | 'updatedAtIso'>> };
type DeleteItemPayload = { id: ID };
type MoveItemPayload = { id: ID; folderId: ID };
type MoveItemsPayload = { ids: ID[]; folderId: ID };
type DeleteItemsPayload = { ids: ID[] };
type AddTagsPayload = { ids: ID[]; tags: string[] };
type RemoveTagsPayload = { ids: ID[]; tags: string[] };

function nowIso() {
  return new Date().toISOString();
}

function isDescendant(folders: InventoryFolder[], nodeId: ID, maybeAncestorId: ID): boolean {
  // returns true if maybeAncestorId is in the parent chain of nodeId
  let cur = folders.find((f) => f.id === nodeId);
  while (cur?.parentId) {
    if (cur.parentId === maybeAncestorId) return true;
    cur = folders.find((f) => f.id === cur!.parentId);
  }
  return false;
}

export const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    createFolder: (state, action: PayloadAction<CreateFolderPayload>) => {
      const id = action.payload.id ?? nanoid();
      state.folders.push({ id, name: action.payload.name.trim(), parentId: action.payload.parentId });
    },
    renameFolder: (state, action: PayloadAction<RenameFolderPayload>) => {
      const f = state.folders.find((x) => x.id === action.payload.id);
      if (f) f.name = action.payload.name.trim();
    },
    moveFolder: (state, action: PayloadAction<MoveFolderPayload>) => {
      const { id, parentId } = action.payload;
      const f = state.folders.find((x) => x.id === id);
      if (!f) return;

      // prevent moving a folder into itself or its descendants
      if (parentId === id) return;
      if (parentId && isDescendant(state.folders, parentId, id)) return;

      f.parentId = parentId;
    },
    deleteFolder: (state, action: PayloadAction<DeleteFolderPayload>) => {
      const { id } = action.payload;

      // Collect folder subtree
      const toDelete = new Set<ID>();
      const stack: ID[] = [id];
      while (stack.length) {
        const cur = stack.pop()!;
        toDelete.add(cur);
        state.folders
          .filter((f) => f.parentId === cur)
          .forEach((child) => stack.push(child.id));
      }

      // Remove folders
      state.folders = state.folders.filter((f) => !toDelete.has(f.id));
      // Remove items in deleted folders
      state.items = state.items.filter((it) => !toDelete.has(it.folderId));
    },

    createItem: (state, action: PayloadAction<CreateItemPayload>) => {
      const id = action.payload.id ?? nanoid();
      state.items.push({
        id,
        folderId: action.payload.folderId,
        name: action.payload.name.trim(),

        sku: action.payload.sku?.trim() || undefined,
        barcode: action.payload.barcode?.trim() || undefined,
        serialNumber: action.payload.serialNumber?.trim() || undefined,

        quantity: Number.isFinite(action.payload.quantity) ? action.payload.quantity : 0,
        unit: action.payload.unit?.trim() || undefined,

        tags: action.payload.tags ?? [],
        location: action.payload.location?.trim() || undefined,

        supplier: action.payload.supplier?.trim() || undefined,
        purchaseDateIso: action.payload.purchaseDateIso?.trim() || undefined,
        cost: Number.isFinite(action.payload.cost as any) ? (action.payload.cost as any) : undefined,
        value: Number.isFinite(action.payload.value as any) ? (action.payload.value as any) : undefined,

        imageUrl: action.payload.imageUrl?.trim() || undefined,
        attachments: action.payload.attachments ?? [],
        customFields: action.payload.customFields ?? [],

        updatedAtIso: nowIso(),
      });
    },
    updateItem: (state, action: PayloadAction<UpdateItemPayload>) => {
      const it = state.items.find((x) => x.id === action.payload.id);
      if (!it) return;
      Object.assign(it, action.payload.patch);
      if (it.name) it.name = it.name.trim();
      if (it.sku) it.sku = it.sku.trim();
      if (it.barcode) it.barcode = it.barcode.trim();
      if (it.serialNumber) it.serialNumber = it.serialNumber.trim();
      if (it.supplier) it.supplier = it.supplier.trim();
      if (it.purchaseDateIso) it.purchaseDateIso = it.purchaseDateIso.trim();
      if (it.unit) it.unit = it.unit.trim();
      if (it.location) it.location = it.location.trim();
      if (it.imageUrl) it.imageUrl = it.imageUrl.trim();
      it.updatedAtIso = nowIso();
    },
    moveItem: (state, action: PayloadAction<MoveItemPayload>) => {
      const it = state.items.find((x) => x.id === action.payload.id);
      if (!it) return;
      it.folderId = action.payload.folderId;
      it.updatedAtIso = nowIso();
    },
    moveItems: (state, action: PayloadAction<MoveItemsPayload>) => {
      const ids = new Set(action.payload.ids);
      state.items.forEach((it) => {
        if (ids.has(it.id)) {
          it.folderId = action.payload.folderId;
          it.updatedAtIso = nowIso();
        }
      });
    },
    deleteItem: (state, action: PayloadAction<DeleteItemPayload>) => {
      state.items = state.items.filter((x) => x.id !== action.payload.id);
    },
    deleteItems: (state, action: PayloadAction<DeleteItemsPayload>) => {
      const ids = new Set(action.payload.ids);
      state.items = state.items.filter((x) => !ids.has(x.id));
    },

    addTagsToItems: (state, action: PayloadAction<AddTagsPayload>) => {
      const ids = new Set(action.payload.ids);
      const tags = action.payload.tags.map((t) => t.trim()).filter(Boolean);
      if (tags.length === 0) return;
      state.items.forEach((it) => {
        if (!ids.has(it.id)) return;
        const cur = new Set(it.tags ?? []);
        tags.forEach((t) => cur.add(t));
        it.tags = Array.from(cur);
        it.updatedAtIso = nowIso();
      });
    },
    removeTagsFromItems: (state, action: PayloadAction<RemoveTagsPayload>) => {
      const ids = new Set(action.payload.ids);
      const remove = new Set(action.payload.tags.map((t) => t.trim()).filter(Boolean));
      if (remove.size === 0) return;
      state.items.forEach((it) => {
        if (!ids.has(it.id)) return;
        it.tags = (it.tags ?? []).filter((t) => !remove.has(t));
        it.updatedAtIso = nowIso();
      });
    },

    // useful for future: server sync
    replaceAll: (state, action: PayloadAction<InventoryState>) => {
      state.folders = action.payload.folders;
      state.items = action.payload.items;
    },
  },
});

export const {
  createFolder,
  renameFolder,
  moveFolder,
  deleteFolder,
  createItem,
  updateItem,
  moveItem,
  moveItems,
  deleteItem,
  deleteItems,
  addTagsToItems,
  removeTagsFromItems,
  replaceAll,
} = inventorySlice.actions;

export default inventorySlice.reducer;
