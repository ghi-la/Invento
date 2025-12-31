import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type InventoryViewMode = 'grid' | 'list';
export type InventorySortKey = 'updatedDesc' | 'nameAsc' | 'qtyDesc';

export type InventoryUiState = {
  // quick search (name/sku/location/tags/qty)
  query: string;
  viewMode: InventoryViewMode;

  // filters
  tags: string[];
  lowStockOnly: boolean;
  missingSkuOnly: boolean;
  missingPhotoOnly: boolean;
  qtyMin: number | null;
  qtyMax: number | null;
  updatedAfter: string | null; // YYYY-MM-DD
  updatedBefore: string | null; // YYYY-MM-DD
  locationQuery: string;

  // sorting
  sortKey: InventorySortKey;
};

const initialState: InventoryUiState = {
  query: '',
  viewMode: 'grid',
  tags: [],
  lowStockOnly: false,
  missingSkuOnly: false,
  missingPhotoOnly: false,
  qtyMin: null,
  qtyMax: null,
  updatedAfter: null,
  updatedBefore: null,
  locationQuery: '',
  sortKey: 'updatedDesc',
};

export const inventoryUiSlice = createSlice({
  name: 'inventoryUi',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setViewMode: (state, action: PayloadAction<InventoryViewMode>) => {
      state.viewMode = action.payload;
    },
    setTagsFilter: (state, action: PayloadAction<string[]>) => {
      state.tags = action.payload;
    },
    setLowStockOnly: (state, action: PayloadAction<boolean>) => {
      state.lowStockOnly = action.payload;
    },
    setMissingSkuOnly: (state, action: PayloadAction<boolean>) => {
      state.missingSkuOnly = action.payload;
    },
    setMissingPhotoOnly: (state, action: PayloadAction<boolean>) => {
      state.missingPhotoOnly = action.payload;
    },
    setQtyMin: (state, action: PayloadAction<number | null>) => {
      state.qtyMin = action.payload;
    },
    setQtyMax: (state, action: PayloadAction<number | null>) => {
      state.qtyMax = action.payload;
    },
    setUpdatedAfter: (state, action: PayloadAction<string | null>) => {
      state.updatedAfter = action.payload;
    },
    setUpdatedBefore: (state, action: PayloadAction<string | null>) => {
      state.updatedBefore = action.payload;
    },
    setLocationQuery: (state, action: PayloadAction<string>) => {
      state.locationQuery = action.payload;
    },
    setSortKey: (state, action: PayloadAction<InventorySortKey>) => {
      state.sortKey = action.payload;
    },
    clearFilters: (state) => {
      state.query = '';
      state.tags = [];
      state.lowStockOnly = false;
      state.missingSkuOnly = false;
      state.missingPhotoOnly = false;
      state.qtyMin = null;
      state.qtyMax = null;
      state.updatedAfter = null;
      state.updatedBefore = null;
      state.locationQuery = '';
      state.sortKey = 'updatedDesc';
    },
  },
});

export const {
  setQuery,
  setViewMode,
  setTagsFilter,
  setLowStockOnly,
  setMissingSkuOnly,
  setMissingPhotoOnly,
  setQtyMin,
  setQtyMax,
  setUpdatedAfter,
  setUpdatedBefore,
  setLocationQuery,
  setSortKey,
  clearFilters,
} = inventoryUiSlice.actions;

export default inventoryUiSlice.reducer;
