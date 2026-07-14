import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "museum.db");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

export function initDatabase() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS screens (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS home_content (
      id TEXT PRIMARY KEY,
      screen_id TEXT NOT NULL REFERENCES screens(id),
      hotspot_type TEXT NOT NULL,
      title TEXT,
      content_json TEXT,
      content_html TEXT,
      media_url TEXT,
      updated_at TEXT NOT NULL,
      UNIQUE(screen_id, hotspot_type)
    );

    CREATE TABLE IF NOT EXISTS sections (
      id TEXT PRIMARY KEY,
      screen_id TEXT NOT NULL REFERENCES screens(id),
      title TEXT NOT NULL,
      cover_url TEXT,
      template_type TEXT NOT NULL DEFAULT 'article',
      content_json TEXT,
      content_html TEXT,
      slot_index INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  migrateSectionsV2();
  migrateSlotIndex();
}

function migrateSlotIndex() {
  const columns = sqlite.prepare("PRAGMA table_info(sections)").all() as { name: string }[];
  const hasSlotIndex = columns.some((c) => c.name === "slot_index");
  if (!hasSlotIndex) {
    sqlite.exec(`ALTER TABLE sections ADD COLUMN slot_index INTEGER NOT NULL DEFAULT 0`);
    sqlite.exec(`UPDATE sections SET slot_index = sort_order WHERE slot_index = 0 OR slot_index IS NULL`);
  }
}

function migrateSectionsV2() {
  const columns = sqlite.prepare("PRAGMA table_info(sections)").all() as { name: string }[];
  const hasTemplate = columns.some((c) => c.name === "template_type");
  if (!hasTemplate) {
    sqlite.exec(`ALTER TABLE sections ADD COLUMN template_type TEXT NOT NULL DEFAULT 'article'`);
  }

  const globalScreen = sqlite.prepare("SELECT id FROM screens WHERE id = 'global'").get();
  if (!globalScreen) {
    sqlite.exec(`INSERT INTO screens (id, name) VALUES ('global', 'Общие разделы')`);
  }

  sqlite.exec(`
    UPDATE sections SET screen_id = 'global' WHERE screen_id = 'horizontal'
  `);
  sqlite.exec(`DELETE FROM sections WHERE screen_id = 'vertical'`);
}
