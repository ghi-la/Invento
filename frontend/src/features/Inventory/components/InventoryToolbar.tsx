import type React from 'react';
import { Box, Button, InputAdornment, TextField, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

type ViewMode = 'grid' | 'list';

type Props = {
  query: string;
  onQueryChange: (v: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
  onAddItem: () => void;
  canCreateItem?: boolean;
  filtersSlot?: React.ReactNode;
};

export default function InventoryToolbar({
  query,
  onQueryChange,
  viewMode,
  onViewModeChange,
  onAddItem,
  canCreateItem = true,
  filtersSlot,
}: Props) {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
      <TextField
        size="small"
        placeholder="Search items…"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        sx={{ minWidth: 260, flex: 1 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      {filtersSlot}

      <ToggleButtonGroup
        exclusive
        size="small"
        value={viewMode}
        onChange={(_, v) => v && onViewModeChange(v)}
      >
        <ToggleButton value="grid" aria-label="Grid view">
          <ViewModuleIcon fontSize="small" />
        </ToggleButton>
        <ToggleButton value="list" aria-label="List view">
          <ViewListIcon fontSize="small" />
        </ToggleButton>
      </ToggleButtonGroup>

      <Tooltip title={!canCreateItem ? 'You have read-only access' : ''} disableHoverListener={canCreateItem}>
        <Box component="span">
          <Button startIcon={<AddIcon />} variant="contained" onClick={onAddItem} disabled={!canCreateItem}>
            Add item
          </Button>
        </Box>
      </Tooltip>
    </Box>
  );
}
