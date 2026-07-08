import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const screens = sqliteTable("screens", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});

export const homeContent = sqliteTable("home_content", {
  id: text("id").primaryKey(),
  screenId: text("screen_id")
    .notNull()
    .references(() => screens.id),
  hotspotType: text("hotspot_type").notNull(),
  title: text("title"),
  contentJson: text("content_json"),
  contentHtml: text("content_html"),
  mediaUrl: text("media_url"),
  updatedAt: text("updated_at").notNull(),
});

export const sections = sqliteTable("sections", {
  id: text("id").primaryKey(),
  screenId: text("screen_id")
    .notNull()
    .references(() => screens.id),
  title: text("title").notNull(),
  coverUrl: text("cover_url"),
  templateType: text("template_type").notNull().default("article"),
  contentJson: text("content_json"),
  contentHtml: text("content_html"),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const appMeta = sqliteTable("app_meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
