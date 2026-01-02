import { paths } from '@/app/paths';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

const Navigation = ({ isLoggedUser }: { isLoggedUser: boolean }) => {
  const navigate = useNavigate();

  const [routes, setRoutes] = useState(paths);

  useEffect(() => {
    // You can add any side effects related to navigation here if needed
    const filteredRoutes = paths.filter(
      (route) => route.isLoggedInRequired === isLoggedUser,
    );
    setRoutes(filteredRoutes);
  }, [isLoggedUser]);

  return (
    <List>
      {routes.map((route) => (
        <ListItem
          key={route.path}
          onClick={() => {
            navigate(route.path);
          }}
        >
          <ListItemIcon>{/* You can add icons here if needed */}</ListItemIcon>
          <ListItemText primary={route.name} />
        </ListItem>
      ))}
    </List>
  );
};

export default Navigation;
