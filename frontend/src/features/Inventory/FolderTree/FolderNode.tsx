import type { folderType } from '@/types/folder';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Box,
  Collapse,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

interface FolderNodeProps {
  folder: folderType;
  depth: number;
  hasChildren: boolean;
  isOpen: boolean;
  isSelected: boolean;
  onSelect: (folderId: string) => void;
  onToggleExpand: (folderId: string) => void;
  onContextMenu: (e: React.MouseEvent<HTMLElement>, folderId: string) => void;
  folderId: string;
  childrenNodes?: React.ReactNode;
}

export function FolderNode({
  folder,
  depth,
  hasChildren,
  isOpen,
  isSelected,
  onSelect,
  onToggleExpand,
  onContextMenu,
  folderId,
  childrenNodes,
}: FolderNodeProps) {
  return (
    <Box>
      <ListItemButton
        onClick={() => onSelect(folderId)}
        selected={isSelected}
        onContextMenu={(e) => onContextMenu(e, folderId)}
        sx={{
          pl: 1 + depth * 2,
          pr: 1,
          borderRadius: 1,
          mb: 0.25,
          ...(isSelected ? { bgcolor: 'action.selected' } : {}),
        }}
      >
        <ListItemIcon sx={{ minWidth: 36 }}>
          {hasChildren && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(folderId);
              }}
              sx={{ p: 0 }}
            >
              {isOpen ? (
                <ExpandLessIcon fontSize="small" />
              ) : (
                <ExpandMoreIcon fontSize="small" />
              )}
            </IconButton>
          )}
        </ListItemIcon>
        <ListItemIcon sx={{ minWidth: 36 }}>
          {isOpen ? (
            <FolderOpenOutlinedIcon fontSize="small" />
          ) : (
            <FolderOutlinedIcon fontSize="small" />
          )}
        </ListItemIcon>
        <ListItemText primary={folder.name} />
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onContextMenu(e, folderId);
          }}
          sx={{ ml: 'auto' }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </ListItemButton>

      {hasChildren && (
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <List disablePadding>{childrenNodes}</List>
        </Collapse>
      )}
    </Box>
  );
}
