import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import InventoryBrowser from '@/features/Inventory/components/InventoryBrowser';
import { useAppSelector } from '@/hooks/hooks';

export default function InventoryPage() {
  const { folderId } = useParams();
  const navigate = useNavigate();

  const folders = useAppSelector((s) => s.inventory.folders);

  const selectedFolderId = useMemo(() => {
    const requested = folderId ?? 'root';
    return folders.some((f) => f.id === requested) ? requested : 'root';
  }, [folderId, folders]);

  return <InventoryBrowser selectedFolderId={selectedFolderId} onSelectFolder={(id) => navigate(`/inventory/${id}`)} />;
}
