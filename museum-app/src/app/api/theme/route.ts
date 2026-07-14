import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureDb } from "@/lib/db/ensure";
import { getProjectTheme } from "@/lib/db/queries";
import { appMeta } from "@/lib/db/schema";
import { parseProjectTheme } from "@/lib/project-theme";

async function requireAuth() {
  const cookieStore = await cookies();
  return verifySession(cookieStore.get(COOKIE_NAME)?.value);
}

export function GET() {
  ensureDb();
  return NextResponse.json(getProjectTheme());
}

export async function PUT(request: Request) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  ensureDb();
  const theme = parseProjectTheme(JSON.stringify(await request.json()));
  const value = JSON.stringify(theme);
  const existing = db
    .select()
    .from(appMeta)
    .where(eq(appMeta.key, "project_theme"))
    .all()[0];

  if (existing) {
    db.update(appMeta)
      .set({ value })
      .where(eq(appMeta.key, "project_theme"))
      .run();
  } else {
    db.insert(appMeta).values({ key: "project_theme", value }).run();
  }

  return NextResponse.json(theme);
}
