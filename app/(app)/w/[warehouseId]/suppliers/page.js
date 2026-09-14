import { listSuppliers } from "@/lib/data/suppliers";
import SuppliersClient from "./SuppliersClient";

export default async function SuppliersPage({ params }) {
  const initialSuppliers = await listSuppliers(params.warehouseId);
  return <SuppliersClient initialSuppliers={initialSuppliers} />;
}
