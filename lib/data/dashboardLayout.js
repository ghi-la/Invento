import { dbConnect } from "@/lib/mongodb";
import DashboardLayout from "@/lib/models/DashboardLayout";

export const DEFAULT_WIDGETS = [
  { id: "lowStock-1", type: "lowStock", x: 0, y: 0, w: 6, h: 4 },
  { id: "quickUpdate-1", type: "quickUpdate", x: 6, y: 0, w: 6, h: 4 },
  { id: "totalValue-1", type: "totalValue", x: 0, y: 4, w: 3, h: 3 },
  { id: "categoryBreakdown-1", type: "categoryBreakdown", x: 3, y: 4, w: 3, h: 3 },
  { id: "recentActivity-1", type: "recentActivity", x: 6, y: 4, w: 6, h: 5 },
];

export async function getDashboardWidgets(warehouseId, userId) {
  await dbConnect();
  const layout = await DashboardLayout.findOne({ warehouse: warehouseId, user: userId }).lean();
  return layout?.widgets?.length ? layout.widgets : DEFAULT_WIDGETS;
}
