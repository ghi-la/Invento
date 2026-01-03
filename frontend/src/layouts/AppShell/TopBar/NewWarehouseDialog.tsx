import { sendNotification, triggerAppReload } from '@/hooks/slices/appSlice';
import { createWarehouse } from '@/lib/warehouse';
import { Box, Button, Dialog, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

const NewWarehouseDialog = ({
  newWarehouseDialogOpen,
  setNewWarehouseDialogOpen,
}: {
  newWarehouseDialogOpen: boolean;
  setNewWarehouseDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const dispatch = useDispatch();
  const [warehouseName, setWarehouseName] = useState('');
  const [warehouseCode, setWarehouseCode] = useState('');
  const [nameTFError, setNameTFError] = useState<string | null>(null);
  const [codeTFError, setCodeTFError] = useState<string | null>(null);

  function handleCloseDialog() {
    setNewWarehouseDialogOpen(false);
    setWarehouseName('');
    setNameTFError(null);
    setWarehouseCode('');
    setCodeTFError(null);
  }

  function handleCreateNewWarehouse(
    e: React.MouseEvent<HTMLButtonElement>,
  ): void {
    e.preventDefault();
    const newWarehouse = {
      name: warehouseName.trim(),
      code: warehouseCode.trim(),
    };
    createWarehouse(newWarehouse)
      .then((response) => {
        console.log('Warehouse created successfully:', response.data);
        // You might want to dispatch an action to update the warehouse list in the store
        dispatch(triggerAppReload());
        handleCloseDialog();
        dispatch(
          sendNotification({
            message: 'Warehouse created successfully',
            severity: 'success',
          }),
        );
      })
      .catch((error) => {
        if (error.response.data.error.includes('duplicate key error')) {
          dispatch(
            sendNotification({
              message: 'Warehouse Name or Code already exists',
              severity: 'error',
            }),
          );
          return;
        } else {
          dispatch(
            sendNotification({
              message: 'Error creating warehouse',
              severity: 'error',
            }),
          );
        }
        console.error('Error creating warehouse:', error);
      });
    // Dispatch action to create new warehouse
    // Example: dispatch(createWarehouseAction(warehouseName));
    // For now, just close the dialog
  }

  return (
    <Dialog open={newWarehouseDialogOpen} onClose={handleCloseDialog}>
      <Box sx={{ p: 4, minWidth: 300 }}>
        <Typography variant="h6" gutterBottom>
          Create New Warehouse
        </Typography>
        <TextField
          label="Warehouse Name"
          autoComplete="off"
          fullWidth
          error={!!nameTFError}
          helperText={nameTFError}
          margin="normal"
          variant="outlined"
          value={warehouseName}
          required
          onChange={(e) => setWarehouseName(e.target.value)}
          onKeyUp={(e) => {
            if (warehouseName.trim() === '') {
              setNameTFError('Warehouse name is required');
            } else {
              setNameTFError(null);
            }
            if (e.key === 'Enter') {
              handleCreateNewWarehouse(e as any);
            }
          }}
        />
        <TextField
          label="Warehouse Code"
          autoComplete="off"
          fullWidth
          error={!!codeTFError}
          helperText={codeTFError}
          margin="normal"
          variant="outlined"
          value={warehouseCode}
          required
          onChange={(e) => setWarehouseCode(e.target.value)}
          onKeyUp={(e) => {
            if (warehouseCode.trim() === '') {
              setCodeTFError('Warehouse code is required');
            } else {
              setCodeTFError(null);
            }
            if (e.key === 'Enter') {
              handleCreateNewWarehouse(e as any);
            }
          }}
        />
        <Box
          sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}
        >
          <Button
            onClick={() => setNewWarehouseDialogOpen(false)}
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateNewWarehouse}
            disabled={
              !!nameTFError ||
              !!codeTFError ||
              warehouseName.trim() === '' ||
              warehouseCode.trim() === ''
            }
          >
            Create
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};
export default NewWarehouseDialog;
