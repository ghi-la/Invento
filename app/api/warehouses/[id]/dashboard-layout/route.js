import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import DashboardLayout from "@/lib/models/DashboardLayout";
import { requireRole } from "@/lib/apiAuth";

const DEFAULT_WIDGETS = [
  { id: "lowStock-1", type: "lowStock", x: 0, y: 0, w: 6, h: 4 },
  { id: "quickUpdate-1", type: "quickUpdate", x: 6, y: 0, w: 6, h: 4 },
  { id: "totalValue-1", type: "totalValue", x: 0, y: 4, w: 3, h: 3 },
  { id: "categoryBreakdown-1", type: "categoryBreakdown", x: 3, y: 4, w: 3, h: 3 },
  { id: "recentActivity-1", type: "recentActivity", x: 6, y: 4, w: 6, h: 5 },
];

const widgetSchema = z.object({
  id: z.string(),
  type: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
});
const putSchema = z.object({ widgets: z.array(widgetSchema).max(30) });

export async function GET(req, { params }) {
  const auth = await requireRole(params.id, "viewer");
  if (auth.error) return auth.error;

  await dbConnect();
  const layout = await DashboardLayout.findOne({ warehouse: params.id, user: auth.user.id }).lean();
  return NextResponse.json({ widgets: layout?.widgets?.length ? layout.widgets : DEFAULT_WIDGETS });
}

export async function PUT(req, { params }) {
  const auth = await requireRole(params.id, "viewer");
  if (auth.error) return auth.error;

  const body = await req.json().catch(() => ({}));
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid layout." }, { status: 400 });
  }

  await dbConnect();
  await DashboardLayout.findOneAndUpdate(
    { warehouse: params.id, user: auth.user.id },
    { widgets: parsed.data.widgets },
    { upsert: true }
  );
  return NextResponse.json({ ok: true });
}
