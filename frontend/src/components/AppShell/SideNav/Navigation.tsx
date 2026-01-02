import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { paths } from '@/app/paths';

type NavigationProps = {
  isLoggedUser: boolean;
  onNavigate?: () => void; // ✅ used to close drawer on mobile after click
};

export default function Navigation({
  isLoggedUser,
  onNavigate,
}: NavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [routes, setRoutes] = useState(paths);

  useEffect(() => {
    const filteredRoutes = paths.filter(
      (route) => route.isLoggedInRequired === isLoggedUser,
    );
    setRoutes(filteredRoutes);
  }, [isLoggedUser]);

  const currentPath = useMemo(() => location.pathname, [location.pathname]);

  return (
    <List dense sx={{ px: 0.5 }}>
      {routes.map((route) => {
        const selected = currentPath === route.path;

        return (
          <ListItemButton
            key={route.path}
            selected={selected}
            onClick={() => {
              navigate(route.path);
              onNavigate?.();
            }}
            sx={{ borderRadius: 1.5, my: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 34 }}>
              {/* Keep as-is: you can add icons later */}
            </ListItemIcon>
            <ListItemText
              primary={route.name}
              primaryTypographyProps={{
                fontSize: 14,
                fontWeight: selected ? 800 : 500,
              }}
            />
          </ListItemButton>
        );
      })}
    </List>
  );
}
