import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { usePermissions } from '@/auth/usePermissions';
import type { ID } from '@/features/Inventory/types';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import {
  clearFilters,
  setLowStockOnly,
  setQuery,
  setTagsFilter,
  setViewMode,
} from '@/hooks/slices/inventoryUiSlice';

export type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
};

type ResultKind = 'header' | 'command' | 'folder' | 'item' | 'tag';

type Result = {
  kind: ResultKind;
  id: string;
  title: string;
  subtitle?: string;
  keywords?: string;
  icon?: ReactNode;
  run?: () => void;
};

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function matches(q: string, ...fields: string[]) {
  const hay = normalize(fields.join(' '));
  return hay.includes(q);
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
const { has } = usePermissions();
  const canWriteItems = has('items.write');
  const canWriteFolders = has('folders.write');
  const canManageWorkspace = has('workspace.manage');

  const [query, setLocalQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const folders = useAppSelector((s) => s.inventory.folders);
  const items = useAppSelector((s) => s.inventory.items);
  const ui = useAppSelector((s) => s.inventoryUi);

  const selectedFolderId = useMemo(() => {
    const m = location.pathname.match(/^\/inventory\/(.+)$/);
    return (m?.[1] as ID | undefined) ?? 'root';
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    setLocalQuery('');
    setActiveIndex(0);
  }, [open]);

  const q = useMemo(() => normalize(query), [query]);

  const baseCommands = useMemo((): Result[] => {
    return [
      {
        kind: 'command' as const,
        id: 'nav-dashboard',
        title: 'Go to Dashboard',
        keywords: 'dashboard home',
        icon: <BoltOutlinedIcon fontSize="small" />,
        run: () => navigate('/dashboard'),
      },
      {
        kind: 'command' as const,
        id: 'nav-inventory',
        title: 'Go to Inventory',
        keywords: 'inventory folders items',
        icon: <Inventory2OutlinedIcon fontSize="small" />,
        run: () => navigate('/inventory/root'),
      },
      ...(canManageWorkspace
        ? [
            {
              kind: 'command' as const,
              id: 'nav-settings',
              title: 'Settings',
              subtitle: 'Manage workspace members and roles',
              keywords: 'settings workspace members roles',
              icon: <BoltOutlinedIcon fontSize="small" />,
              run: () => navigate('/settings'),
            },
          ]
        : []),

      {
        kind: 'command' as const,
        id: 'search-items',
        title: q ? `Search items for “${query.trim()}”` : 'Search items',
        subtitle: 'Applies the search box in the current folder',
        keywords: 'search find query',
        icon: <BoltOutlinedIcon fontSize="small" />,
        run: () => {
          dispatch(setQuery(query.trim()));
          navigate(`/inventory/${selectedFolderId}`);
        },
      },
      ...(canWriteItems ? [{
        kind: 'command' as const,
        id: 'new-item',
        title: 'New item',
        subtitle: 'Create an item in the current folder',
        keywords: 'add create item',
        icon: <BoltOutlinedIcon fontSize="small" />,
        run: () => navigate(`/inventory/${selectedFolderId}?action=newItem`),
      }] : []),
      ...(canWriteFolders ? [{
        kind: 'command' as const,
        id: 'new-folder',
        title: 'New folder',
        subtitle: 'Create a subfolder in the current folder',
        keywords: 'add create folder',
        icon: <BoltOutlinedIcon fontSize="small" />,
        run: () => navigate(`/inventory/${selectedFolderId}?action=newFolder`),
      }] : []),
      {
        kind: 'command' as const,
        id: 'toggle-view',
        title: ui.viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view',
        keywords: 'toggle view grid list',
        icon: <BoltOutlinedIcon fontSize="small" />,
        run: () => dispatch(setViewMode(ui.viewMode === 'grid' ? 'list' : 'grid')),
      },
      {
        kind: 'command' as const,
        id: 'toggle-lowstock',
        title: ui.lowStockOnly ? 'Show all items' : 'Show low stock only',
        keywords: 'low stock filter',
        icon: <BoltOutlinedIcon fontSize="small" />,
        run: () => dispatch(setLowStockOnly(!ui.lowStockOnly)),
      },
      {
        kind: 'command' as const,
        id: 'clear-filters',
        title: 'Clear filters',
        subtitle: 'Reset search + filters',
        keywords: 'reset clear filters search tags sort',
        icon: <BoltOutlinedIcon fontSize="small" />,
        run: () => dispatch(clearFilters()),
      },
    ];
  }, [dispatch, navigate, q, query, selectedFolderId, ui.lowStockOnly, ui.viewMode]);

  const folderResults = useMemo((): Result[] => {
    return folders.map((f) => ({
      kind: 'folder' as const,
      id: `folder-${f.id}`,
      title: f.name,
      subtitle: f.id,
      keywords: `folder ${f.name} ${f.id}`,
      icon: <FolderOutlinedIcon fontSize="small" />,
      run: () => navigate(`/inventory/${f.id}`),
    }));
  }, [folders, navigate]);

  const itemResults = useMemo((): Result[] => {
    // keep it light: flatten and search by name/sku/location/tags
    return items.map((it) => ({
      kind: 'item' as const,
      id: `item-${it.id}`,
      title: it.name,
      subtitle: [it.sku ? `SKU ${it.sku}` : null, it.location ? it.location : null].filter(Boolean).join(' • ') || it.id,
      keywords: `item ${it.name} ${it.sku ?? ''} ${it.location ?? ''} ${it.tags.join(' ')}`,
      icon: <Inventory2OutlinedIcon fontSize="small" />,
      run: () => navigate(`/items/${it.id}`),
    }));
  }, [items, navigate]);

  const tagResults = useMemo((): Result[] => {
    const tags = Array.from(new Set(items.flatMap((i) => i.tags))).sort((a, b) => a.localeCompare(b));
    return tags.map((t) => ({
      kind: 'tag' as const,
      id: `tag-${t}`,
      title: t,
      subtitle: 'Filter items by tag',
      keywords: `tag ${t}`,
      icon: <LocalOfferOutlinedIcon fontSize="small" />,
      run: () => {
        dispatch(setTagsFilter([t]));
        navigate(`/inventory/${selectedFolderId}`);
      },
    }));
  }, [dispatch, items, navigate, selectedFolderId]);

  const results = useMemo((): Result[] => {
    const out: Result[] = [];

    const addSection = (title: string, list: Result[]) => {
      if (!list.length) return;
      out.push({ kind: 'header' as const, id: `h-${title}`, title });
      out.push(...list);
    };

    const filterList = (list: Result[]) => {
      if (!q) return list;
      return list.filter((r) => matches(q, r.title, r.subtitle ?? '', r.keywords ?? ''));
    };

    addSection('Commands', filterList(baseCommands));
    addSection('Folders', filterList(folderResults).slice(0, 10));
    addSection('Items', filterList(itemResults).slice(0, 12));
    addSection('Tags', filterList(tagResults).slice(0, 12));

    return out;
  }, [baseCommands, folderResults, itemResults, q, tagResults]);

  const actionable = useMemo(() => results.filter((r) => r.kind !== 'header'), [results]);

  useEffect(() => {
    // reset active index when query changes
    setActiveIndex(0);
  }, [q]);

  const run = (r: Result) => {
    if (!r.run) return;
    r.run();
    onClose();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, actionable.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const r = actionable[activeIndex];
      if (r) run(r);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 1 }}>
        Command palette
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Search commands, folders, items and tags. Use ↑/↓ and Enter.
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <TextField
          autoFocus
          fullWidth
          value={query}
          onChange={(e) => setLocalQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search anything…"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <List
          dense
          sx={{
            mt: 1,
            maxHeight: 460,
            overflow: 'auto',
            border: (t) => `1px solid ${t.palette.divider}`,
            borderRadius: 2,
          }}
        >
          {results.length ? (
            results.map((r) => {
              if (r.kind === 'header') {
                return (
                  <Box key={r.id} sx={{ px: 1.5, py: 1, bgcolor: 'action.hover' }}>
                    <Typography variant="overline" color="text.secondary">
                      {r.title}
                    </Typography>
                  </Box>
                );
              }

              const idx = actionable.findIndex((x) => x.id === r.id);
              const selected = idx === activeIndex;

              return (
                <ListItemButton key={r.id} selected={selected} onClick={() => run(r)}>
                  {r.icon ? <Box sx={{ mr: 1.25, display: 'flex' }}>{r.icon}</Box> : null}
                  <ListItemText
                    primary={r.title}
                    secondary={r.subtitle}
                    primaryTypographyProps={{ fontWeight: 700 }}
                  />
                </ListItemButton>
              );
            })
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
              No matches.
            </Typography>
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
}
