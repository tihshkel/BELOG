import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import { ensureDb } from "@/lib/db/ensure";
import { getSectionById } from "@/lib/db/queries";
import { normalizeTemplateType } from "@/lib/section-content";
import { createSlideContent, serializeSlideContent } from "@/lib/slide-content";
import { EMPTY_SLOT_TITLE } from "@/lib/slot-utils";

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

  const templateType = normalizeTemplateType(body.templateType ?? "article");
  const now = new Date().toISOString();

  db.update(sections)
    .set({
      title: body.title,
      coverUrl: body.coverUrl ?? null,
      templateType,
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
  const section = getSectionById(id);
  if (!section) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { db } = await import("@/lib/db");
  const { sections } = await import("@/lib/db/schema");
  const { eq } = await import("drizzle-orm");

  const now = new Date().toISOString();

  db.update(sections)
    .set({
      title: EMPTY_SLOT_TITLE,
      coverUrl: null,
      templateType: "article",
      contentJson: serializeSlideContent(createSlideContent("article")),
      contentHtml: null,
      isPublished: false,
      updatedAt: now,
    })
    .where(eq(sections.id, id))
    .run();

  return NextResponse.json({ success: true });
}
