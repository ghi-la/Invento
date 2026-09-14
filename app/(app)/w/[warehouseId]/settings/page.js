import { getWarehouseSettings } from "@/lib/data/warehouse";
import RoleGuard from "@/components/RoleGuard";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage({ params }) {
  const initialWarehouse = await getWarehouseSettings(params.warehouseId);
  return (
    <RoleGuard minRole="admin">
      <SettingsClient initialWarehouse={initialWarehouse} />
    </RoleGuard>
  );
}
