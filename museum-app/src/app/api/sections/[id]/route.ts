import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import { ensureDb } from "@/lib/db/ensure";

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifySession(token);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  ensureDb();
  const { db } = await import("@/lib/db");
  const { sections } = await import("@/lib/db/schema");
  const { eq } = await import("drizzle-orm");

  const now = new Date().toISOString();

  db.update(sections)
    .set({
      title: body.title,
      coverUrl: body.coverUrl ?? null,
      templateType: body.templateType ?? "article",
      contentJson: body.contentJson ?? null,
      contentHtml: body.contentHtml ?? null,
      isPublished: body.isPublished ?? false,
      updatedAt: now,
    })
    .where(eq(sections.id, id))
    .run();

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  ensureDb();
  const { db } = await import("@/lib/db");
  const { sections } = await import("@/lib/db/schema");
  const { eq } = await import("drizzle-orm");

  db.delete(sections).where(eq(sections.id, id)).run();

  return NextResponse.json({ success: true });
}
