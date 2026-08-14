import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { getSessionUser } from "@/lib/apiAuth";

export async function GET(req) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ users: [] });

  await dbConnect();
  const matches = await User.find({
    $or: [{ email: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") }, { name: new RegExp(q, "i") }],
  })
    .limit(5)
    .select("name email image")
    .lean();

  return NextResponse.json({
    users: matches.map((m) => ({ id: m._id.toString(), name: m.name, email: m.email, image: m.image })),
  });
}
