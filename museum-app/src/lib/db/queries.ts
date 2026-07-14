import { eq, asc, and } from "drizzle-orm";
import { db } from "./index";
import { appMeta, homeContent, sections } from "./schema";
import type { ScreenOrientation, Section, SectionTemplate } from "../types";
import { GLOBAL_SCREEN_ID, normalizeTemplateType } from "../section-content";
import { parseProjectTheme } from "../project-theme";

function mapSection(s: typeof sections.$inferSelect): Section {
  return {
    id: s.id,
    title: s.title,
    coverUrl: s.coverUrl,
    templateType: normalizeTemplateType(s.templateType ?? "article"),
    contentJson: s.contentJson,
    contentHtml: s.contentHtml,
    slotIndex: s.slotIndex ?? s.sortOrder ?? 0,
    sortOrder: s.sortOrder,
    isPublished: s.isPublished,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

export function getKioskData(screenId: ScreenOrientation) {
  const home = db
    .select()
    .from(homeContent)
    .where(eq(homeContent.screenId, screenId))
    .all();

  const publishedSections = db
    .select()
    .from(sections)
    .where(and(eq(sections.screenId, GLOBAL_SCREEN_ID), eq(sections.isPublished, true)))
    .orderBy(asc(sections.slotIndex))
    .all();

  const latestUpdate = [
    ...home.map((h) => h.updatedAt),
    ...publishedSections.map((s) => s.updatedAt),
  ].sort().reverse()[0] ?? new Date().toISOString();

  return {
    homeContent: home.map((h) => ({
      id: h.id,
      screenId: h.screenId as ScreenOrientation,
      hotspotType: h.hotspotType as "flag" | "emblem" | "logo",
      title: h.title,
      contentJson: h.contentJson,
      contentHtml: h.contentHtml,
      mediaUrl: h.mediaUrl,
      updatedAt: h.updatedAt,
    })),
    sections: publishedSections.map(mapSection),
    updatedAt: latestUpdate,
  };
}

export function getAllSections() {
  return db
    .select()
    .from(sections)
    .where(eq(sections.screenId, GLOBAL_SCREEN_ID))
    .orderBy(asc(sections.slotIndex))
    .all()
    .map(mapSection);
}

export function getSectionById(id: string) {
  const row = db.select().from(sections).where(eq(sections.id, id)).all()[0];
  return row ? mapSection(row) : null;
}

export function getSectionBySlotIndex(slotIndex: number) {
  const row = db
    .select()
    .from(sections)
    .where(and(eq(sections.screenId, GLOBAL_SCREEN_ID), eq(sections.slotIndex, slotIndex)))
    .all()[0];
  return row ? mapSection(row) : null;
}

export function getHomeContent(screenId: ScreenOrientation) {
  return db
    .select()
    .from(homeContent)
    .where(eq(homeContent.screenId, screenId))
    .all();
}

export function getProjectTheme() {
  const row = db
    .select()
    .from(appMeta)
    .where(eq(appMeta.key, "project_theme"))
    .all()[0];
  return parseProjectTheme(row?.value);
}
