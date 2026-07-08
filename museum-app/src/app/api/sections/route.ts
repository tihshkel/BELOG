import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import { ensureDb } from "@/lib/db/ensure";
import { getAllSections } from "@/lib/db/queries";
import { GLOBAL_SCREEN_ID, createEmptyContent, normalizeTemplateType, serializeContent } from "@/lib/section-content";
import type { SectionTemplate } from "@/lib/types";

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifySession(token);
}

export async function GET() {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  ensureDb();
  return NextResponse.json(getAllSections());
}

export async function POST(request: Request) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, templateType, coverUrl, contentJson, isPublished } = body;

  if (!title || !templateType) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const tpl = normalizeTemplateType(templateType as string);
  if (!["article", "photo_story", "gallery", "timeline"].includes(tpl)) {
    return NextResponse.json({ error: "Invalid template" }, { status: 400 });
  }

  ensureDb();
  const { db } = await import("@/lib/db");
  const { sections } = await import("@/lib/db/schema");

  const existing = getAllSections();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const content = contentJson ?? serializeContent(createEmptyContent(tpl));

  db.insert(sections)
    .values({
      id,
      screenId: GLOBAL_SCREEN_ID,
      title,
      templateType: tpl,
      coverUrl: coverUrl ?? null,
      contentJson: content,
      contentHtml: null,
      sortOrder: existing.length,
      isPublished: isPublished ?? false,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  return NextResponse.json({ id });
}

export async function PUT(request: Request) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { sections: orderedIds } = body as { sections: string[] };

  if (!orderedIds) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  ensureDb();
  const { db } = await import("@/lib/db");
  const { sections: sectionsTable } = await import("@/lib/db/schema");
  const { eq } = await import("drizzle-orm");

  const now = new Date().toISOString();
  orderedIds.forEach((id, index) => {
    db.update(sectionsTable)
      .set({ sortOrder: index, updatedAt: now })
      .where(eq(sectionsTable.id, id))
      .run();
  });

  return NextResponse.json({ success: true });
}
