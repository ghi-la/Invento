import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { dbConnect } from "@/lib/mongodb";
import Warehouse from "@/lib/models/Warehouse";
import Membership from "@/lib/models/Membership";
import { WarehouseProvider } from "@/components/WarehouseContext";
import AppShell from "@/components/AppShell";

export default async function WarehouseLayout({ children, params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  await dbConnect();
  const membership = await Membership.findOne({
    warehouse: params.warehouseId,
    user: session.user.id,
  }).lean();
  if (!membership) notFound();

  const warehouseDoc = await Warehouse.findById(params.warehouseId).lean();
  if (!warehouseDoc) notFound();

  const warehouse = {
    id: warehouseDoc._id.toString(),
    name: warehouseDoc.name,
    description: warehouseDoc.description,
    location: warehouseDoc.location,
    color: warehouseDoc.color,
    role: membership.role,
  };

  return (
    <WarehouseProvider warehouse={warehouse}>
      <AppShell>{children}</AppShell>
    </WarehouseProvider>
  );
}
