import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import { ensureDb } from "@/lib/db/ensure";
import { getHomeContent } from "@/lib/db/queries";
import type { ScreenOrientation } from "@/lib/types";

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!(await verifySession(token))) {
    return false;
  }
  return true;
}

export async function GET(request: Request) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const screenId = searchParams.get("screenId") as ScreenOrientation;

  if (screenId !== "horizontal" && screenId !== "vertical") {
    return NextResponse.json({ error: "Invalid screenId" }, { status: 400 });
  }

  ensureDb();
  const data = getHomeContent(screenId);
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { screenId, hotspotType, title, contentJson, contentHtml, mediaUrl } = body;

  if (!screenId || !hotspotType) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  ensureDb();
  const { db } = await import("@/lib/db");
  const { homeContent } = await import("@/lib/db/schema");
  const { eq, and } = await import("drizzle-orm");

  const now = new Date().toISOString();

  db.update(homeContent)
    .set({
      title: title ?? null,
      contentJson: contentJson ?? null,
      contentHtml: contentHtml ?? null,
      mediaUrl: mediaUrl ?? null,
      updatedAt: now,
    })
    .where(and(eq(homeContent.screenId, screenId), eq(homeContent.hotspotType, hotspotType)))
    .run();

  return NextResponse.json({ success: true });
}
