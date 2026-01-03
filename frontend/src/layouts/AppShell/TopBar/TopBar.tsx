import { useAppSelector } from '@/hooks/hooks';
import { setSelectedWarehouse } from '@/hooks/slices/appSlice';
import { warehouseType } from '@/types/app';
import { loggedUserType } from '@/types/user';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import {
  AppBar,
  Box,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import NewWarehouseDialog from './NewWarehouseDialog';

type TopBarProps = {
  title: string;
  drawerWidth: number;
  onOpenMobileNav: () => void;
};

export default function TopBar({
  title,
  drawerWidth,
  onOpenMobileNav,
}: Readonly<TopBarProps>) {
  const dispatch = useDispatch();
  const loggedUser: loggedUserType | null = useAppSelector(
    (state) => state.app.loggedUser,
  );
  const selectedWarehouse = useAppSelector(
    (state) => state.app.selectedWarehouse,
  );

  const [newWarehouseDialogOpen, setNewWarehouseDialogOpen] = useState(false);

  function handleSelectedWarehouseChange(
    event: SelectChangeEvent<string>,
    child?: any,
  ): void {
    const selectedWarehouse: warehouseType = {
      _id: child?.key?.toString().split('.$')[1] || '',
      name: event.target.value,
    };
    dispatch(setSelectedWarehouse(selectedWarehouse));
  }

  useEffect(() => {
    if (loggedUser?.preferences?.selectedWarehouse) {
      dispatch(setSelectedWarehouse(loggedUser.preferences.selectedWarehouse));
    } else if (loggedUser?.warehouses && loggedUser.warehouses.length > 0) {
      dispatch(setSelectedWarehouse(loggedUser.warehouses[0]));
    }
  }, [loggedUser, dispatch]);

  return (
    <>
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <IconButton
            edge="start"
            onClick={onOpenMobileNav}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.2 }}>
            {title}
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {loggedUser && (
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search…"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                width: { xs: 140, sm: 220, md: 340 },
                '& .MuiOutlinedInput-root': { bgcolor: 'background.default' },
              }}
            />
          )}

          {loggedUser?.warehouses && loggedUser.warehouses.length > 0 && (
            <FormControl variant="outlined">
              <InputLabel id="warehouse-select-label">Warehouse</InputLabel>
              <Select
                labelId="warehouse-select-label"
                value={selectedWarehouse.name || ''}
                onChange={handleSelectedWarehouseChange}
              >
                {loggedUser.warehouses.map((warehouse: warehouseType) => (
                  <MenuItem key={warehouse._id} value={warehouse.name}>
                    {warehouse.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {loggedUser && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setNewWarehouseDialogOpen(true)}
            >
              Create new Warehouse
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <NewWarehouseDialog
        newWarehouseDialogOpen={newWarehouseDialogOpen}
        setNewWarehouseDialogOpen={setNewWarehouseDialogOpen}
      />
    </>
  );
}
