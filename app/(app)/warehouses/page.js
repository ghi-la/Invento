import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import WarehousesClient from "./WarehousesClient";

export default async function WarehousesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  return <WarehousesClient userName={session.user.name} userImage={session.user.image} />;
}
