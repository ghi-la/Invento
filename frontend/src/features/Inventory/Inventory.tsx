import { useAppSelector } from '@/hooks/hooks';
import { getFoldersInWarehouse } from '@/lib/warehouse';
import { folderType } from '@/types/folder';
import { Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import FolderTree from './FolderTree/FoldeTree';
import ItemsView from './ItemsView/ItemsView';

const Inventory = () => {
  const selectedWarehouse = useAppSelector(
    (state) => state.app.selectedWarehouse,
  );
  const [folders, setFolders] = useState<folderType[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>();

  useEffect(() => {
    getFoldersInWarehouse(selectedWarehouse.id || '').then((data) => {
      setFolders(data);
      console.log('Fetched folders:', data);
    });
  }, [selectedWarehouse.id]);

  const handleFoldersChange = (updatedFolders: folderType[]) => {
    setFolders(updatedFolders);
  };

  return (
    <div>
      <Grid container spacing={2}>
        <Grid size={3}>
          <FolderTree
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSelect={(folderId) => setSelectedFolderId(folderId)}
            onFoldersChange={handleFoldersChange}
            warehouseId={selectedWarehouse.id}
          />
        </Grid>
        <Grid size={9}>
          <ItemsView />
        </Grid>
      </Grid>
    </div>
  );
};

export default Inventory;
