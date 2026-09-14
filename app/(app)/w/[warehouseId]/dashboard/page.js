import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getDashboardWidgets } from "@/lib/data/dashboardLayout";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage({ params }) {
  const session = await getServerSession(authOptions);
  const initialWidgets = await getDashboardWidgets(params.warehouseId, session.user.id);
  return <DashboardClient initialWidgets={initialWidgets} />;
}
