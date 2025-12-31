import type React from 'react';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import type { ID, InventoryFolder } from '../types';
import { buildFolderPath } from '../utils';

type Props = {
  folders: InventoryFolder[];
  folderId: ID;
  onSelectFolder: (id: ID) => void;
};

export default function BreadcrumbsPath({ folders, folderId, onSelectFolder }: Props) {
  const path = buildFolderPath(folders, folderId);

  return (
    <Breadcrumbs aria-label="folder breadcrumbs" sx={{ mb: 0.5 }}>
      {path.map((f, idx) => {
        const isLast = idx === path.length - 1;
        return isLast ? (
          <Typography key={f.id} color="text.primary" variant="body2" noWrap>
            {f.name}
          </Typography>
        ) : (
          <Link
            key={f.id}
            underline="hover"
            color="inherit"
            href="#"
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              onSelectFolder(f.id);
            }}
            sx={{ cursor: 'pointer', maxWidth: 220 }}
            noWrap
          >
            {f.name}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}
