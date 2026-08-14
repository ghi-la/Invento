import LowStockWidget from "./widgets/LowStockWidget";
import RecentActivityWidget from "./widgets/RecentActivityWidget";
import TotalValueWidget from "./widgets/TotalValueWidget";
import CategoryBreakdownWidget from "./widgets/CategoryBreakdownWidget";
import QuickUpdateWidget from "./widgets/QuickUpdateWidget";

export const WIDGET_REGISTRY = {
  quickUpdate: {
    titleKey: "dashboard.widgets.quickUpdate.title",
    descriptionKey: "dashboard.widgets.quickUpdate.description",
    component: QuickUpdateWidget,
    defaultSize: { w: 6, h: 4 },
  },
  lowStock: {
    titleKey: "dashboard.widgets.lowStock.title",
    descriptionKey: "dashboard.widgets.lowStock.description",
    component: LowStockWidget,
    defaultSize: { w: 6, h: 4 },
  },
  recentActivity: {
    titleKey: "dashboard.widgets.recentActivity.title",
    descriptionKey: "dashboard.widgets.recentActivity.description",
    component: RecentActivityWidget,
    defaultSize: { w: 6, h: 5 },
  },
  totalValue: {
    titleKey: "dashboard.widgets.totalValue.title",
    descriptionKey: "dashboard.widgets.totalValue.description",
    component: TotalValueWidget,
    defaultSize: { w: 3, h: 3 },
  },
  categoryBreakdown: {
    titleKey: "dashboard.widgets.categoryBreakdown.title",
    descriptionKey: "dashboard.widgets.categoryBreakdown.description",
    component: CategoryBreakdownWidget,
    defaultSize: { w: 3, h: 3 },
  },
};
