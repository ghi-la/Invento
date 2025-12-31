import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { ID, InventoryFolder, InventoryItem } from '@/features/Inventory/types';
import { replaceAll, createFolder as createFolderLocal, renameFolder as renameFolderLocal, moveFolder as moveFolderLocal, deleteFolder as deleteFolderLocal,
  createItem as createItemLocal, updateItem as updateItemLocal, moveItem as moveItemLocal, moveItems as moveItemsLocal, deleteItem as deleteItemLocal, deleteItems as deleteItemsLocal } from '../slices/inventorySlice';

import * as catApi from '@/api/categories';
import * as prodApi from '@/api/products';

function nowIso() {
  return new Date().toISOString();
}


function getId(value: any): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value._id ?? value.id ?? null;
  }
  return null;
}


function mapCategoryToFolder(c: catApi.CategoryDto): InventoryFolder {
  return {
    id: c._id,
    name: c.name,
    parentId: getId(c.parentCategory) ?? null,
  };
}

function mapProductToItem(p: prodApi.ProductDto): InventoryItem {
  return {
    id: p._id,
    folderId: getId(p.category) ?? 'root',
    name: p.name,
    sku: p.sku,
    barcode: p.barcode,
    serialNumber: undefined,
    quantity: p.quantity ?? 0,
    unit: p.unit,
    tags: [],
    location: p.location,
    cost: p.costPrice,
    value: p.sellingPrice,
    imageUrl: p.imageUrl,
    attachments: [],
    customFields: [],
    updatedAtIso: p.updatedAt ?? nowIso(),
  };
}

/**
 * Load categories + products and normalize into the UI model.
 */
export const fetchInventory = createAsyncThunk<void, void, { state: RootState }>(
  'inventory/fetchAll',
  async (_arg, thunkApi) => {
    const [cats, prods] = await Promise.all([catApi.getCategories(), prodApi.getProducts()]);

    // Ensure root folder exists (frontend expects it)
    const folders: InventoryFolder[] = [{ id: 'root', name: 'All Items', parentId: null }, ...cats.map(mapCategoryToFolder)];
    const items: InventoryItem[] = prods.map(mapProductToItem);

    thunkApi.dispatch(replaceAll({ folders, items }));
  }
);

export const createFolder = createAsyncThunk<void, { name: string; parentId: ID | null }, { state: RootState }>(
  'inventory/createFolder',
  async ({ name, parentId }, thunkApi) => {
    // Optimistic: create temp locally so UI is snappy
    const tempId = `tmp_${Math.random().toString(36).slice(2)}`;
    thunkApi.dispatch(createFolderLocal({ name, parentId, id: tempId }));

    try {
      const created = await catApi.createCategory({ name, parentCategory: parentId === 'root' ? null : parentId });
      // Replace temp
      const state = thunkApi.getState();
      const folders = state.inventory.folders.map((f) => (f.id === tempId ? mapCategoryToFolder(created) : f));
      thunkApi.dispatch(replaceAll({ folders, items: state.inventory.items }));
    } catch (e) {
      // Rollback temp folder
      thunkApi.dispatch(deleteFolderLocal({ id: tempId }));
      throw e;
    }
  }
);

export const renameFolder = createAsyncThunk<void, { id: ID; name: string }, { state: RootState }>(
  'inventory/renameFolder',
  async ({ id, name }, thunkApi) => {
    thunkApi.dispatch(renameFolderLocal({ id, name }));
    await catApi.updateCategory(id, { name });
  }
);

export const moveFolder = createAsyncThunk<void, { id: ID; parentId: ID | null }, { state: RootState }>(
  'inventory/moveFolder',
  async ({ id, parentId }, thunkApi) => {
    thunkApi.dispatch(moveFolderLocal({ id, parentId }));
    await catApi.updateCategory(id, { parentCategory: parentId === 'root' ? null : parentId });
  }
);

export const deleteFolder = createAsyncThunk<void, { id: ID }, { state: RootState }>(
  'inventory/deleteFolder',
  async ({ id }, thunkApi) => {
    thunkApi.dispatch(deleteFolderLocal({ id }));
    await catApi.deleteCategory(id);
  }
);

export const createItem = createAsyncThunk<void, { folderId: ID; patch: Partial<InventoryItem> }, { state: RootState }>(
  'inventory/createItem',
  async ({ folderId, patch }, thunkApi) => {
    // create locally temp
    const tempId = `tmp_${Math.random().toString(36).slice(2)}`;
    thunkApi.dispatch(createItemLocal({ folderId, patch, id: tempId }));

    const input: Partial<prodApi.ProductDto> = {
      name: patch.name ?? 'Untitled',
      sku: patch.sku ?? `SKU-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      barcode: patch.barcode,
      category: folderId === 'root' ? null : folderId,
      quantity: patch.quantity ?? 0,
      unit: patch.unit,
      location: patch.location,
      costPrice: patch.cost ?? 0,
      sellingPrice: patch.value ?? 0,
      imageUrl: patch.imageUrl,
    };

    try {
      const created = await prodApi.createProduct(input);
      const state = thunkApi.getState();
      const items = state.inventory.items.map((it) => (it.id === tempId ? mapProductToItem(created) : it));
      thunkApi.dispatch(replaceAll({ folders: state.inventory.folders, items }));
    } catch (e) {
      thunkApi.dispatch(deleteItemLocal({ id: tempId }));
      throw e;
    }
  }
);

export const updateItem = createAsyncThunk<void, { id: ID; patch: Partial<InventoryItem> }, { state: RootState }>(
  'inventory/updateItem',
  async ({ id, patch }, thunkApi) => {
    thunkApi.dispatch(updateItemLocal({ id, patch }));

    const input: Partial<prodApi.ProductDto> = {
      name: patch.name,
      sku: patch.sku,
      barcode: patch.barcode,
      quantity: patch.quantity,
      unit: patch.unit,
      location: patch.location,
      costPrice: patch.cost,
      sellingPrice: patch.value,
      imageUrl: patch.imageUrl,
    };
    await prodApi.updateProduct(id, input);
  }
);

export const moveItem = createAsyncThunk<void, { id: ID; folderId: ID }, { state: RootState }>(
  'inventory/moveItem',
  async ({ id, folderId }, thunkApi) => {
    thunkApi.dispatch(moveItemLocal({ id, folderId }));
    await prodApi.updateProduct(id, { category: folderId === 'root' ? null : folderId });
  }
);

export const moveItems = createAsyncThunk<void, { ids: ID[]; folderId: ID }, { state: RootState }>(
  'inventory/moveItems',
  async ({ ids, folderId }, thunkApi) => {
    thunkApi.dispatch(moveItemsLocal({ ids, folderId }));
    // sequential updates (simple)
    for (const id of ids) {
      // eslint-disable-next-line no-await-in-loop
      await prodApi.updateProduct(id, { category: folderId === 'root' ? null : folderId });
    }
  }
);

export const deleteItem = createAsyncThunk<void, { id: ID }, { state: RootState }>(
  'inventory/deleteItem',
  async ({ id }, thunkApi) => {
    thunkApi.dispatch(deleteItemLocal({ id }));
    await prodApi.deleteProduct(id);
  }
);

export const deleteItems = createAsyncThunk<void, { ids: ID[] }, { state: RootState }>(
  'inventory/deleteItems',
  async ({ ids }, thunkApi) => {
    thunkApi.dispatch(deleteItemsLocal({ ids }));
    for (const id of ids) {
      // eslint-disable-next-line no-await-in-loop
      await prodApi.deleteProduct(id);
    }
  }
);
