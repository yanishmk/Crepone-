import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";

export const runtime = "nodejs";

const HUB_URL = process.env.CLUSTER_HUB_URL || "";
const HUB_ADMIN_API_KEY = process.env.CLUSTER_HUB_ADMIN_API_KEY || "";

export async function GET(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!HUB_URL || !HUB_ADMIN_API_KEY) {
    return NextResponse.json(
      { error: "CLUSTER_HUB_URL and CLUSTER_HUB_ADMIN_API_KEY are required" },
      { status: 500 }
    );
  }

  const days = new URL(req.url).searchParams.get("days") || "30";
  const hubRes = await fetch(`${HUB_URL}/analytics?days=${encodeURIComponent(days)}`, {
    headers: { "x-api-key": HUB_ADMIN_API_KEY },
    cache: "no-store",
  });
  const text = await hubRes.text();
  if (!hubRes.ok) {
    return NextResponse.json(
      { error: "Le hub commercial a refuse la requete", details: text },
      { status: hubRes.status }
    );
  }

  return new NextResponse(text, {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
