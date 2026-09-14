import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import DashboardLayout from "@/lib/models/DashboardLayout";
import { requireRole } from "@/lib/apiAuth";
import { getDashboardWidgets } from "@/lib/data/dashboardLayout";

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

  const widgets = await getDashboardWidgets(params.id, auth.user.id);
  return NextResponse.json({ widgets });
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
