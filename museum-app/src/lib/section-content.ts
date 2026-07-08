import type { SectionTemplate } from "./types";

export type { SectionTemplate };

/** Размер фото на экране */
export type ImageSize = "small" | "medium" | "large" | "full";

export const IMAGE_SIZE_LABELS: Record<ImageSize, string> = {
  small: "Маленькое",
  medium: "Среднее",
  large: "Большое",
  full: "На весь экран",
};

export type ContentBlock =
  | { id: string; type: "heading"; text: string }
  | { id: string; type: "paragraph"; text: string }
  | { id: string; type: "image"; url: string; caption?: string; size?: ImageSize }
  | { id: string; type: "quote"; text: string };

export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
  size?: ImageSize;
}

export interface PhotoStoryItem {
  id: string;
  imageUrl: string;
  imageSize: ImageSize;
  title: string;
  text: string;
}

export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  text: string;
  imageUrl?: string;
}

export interface SectionContentV2 {
  version: 2;
  /** Статья */
  heroImage?: string;
  heroSize?: ImageSize;
  intro?: string;
  body?: string;
  /** Устаревшее — для миграции */
  blocks?: ContentBlock[];
  /** Фото и текст */
  stories?: PhotoStoryItem[];
  /** Галерея */
  gallery?: GalleryItem[];
  /** Хронология */
  events?: TimelineEvent[];
}

export const GLOBAL_SCREEN_ID = "global";

/** Старые значения в БД → новые */
export function normalizeTemplateType(value: string): SectionTemplate {
  if (value === "blocks") return "photo_story";
  if (value === "text_only") return "timeline";
  return value as SectionTemplate;
}

export const TEMPLATE_LABELS: Record<SectionTemplate, string> = {
  article: "Статья",
  photo_story: "Фото и текст",
  gallery: "Галерея",
  timeline: "Хронология",
};

export function newBlockId() {
  return crypto.randomUUID();
}

export function defaultImageSize(): ImageSize {
  return "medium";
}

export function createEmptyContent(template: SectionTemplate): SectionContentV2 {
  switch (template) {
    case "gallery":
      return { version: 2, gallery: [] };
    case "article":
      return { version: 2, heroSize: "large", intro: "", body: "" };
    case "photo_story":
      return { version: 2, stories: [] };
    case "timeline":
      return { version: 2, events: [] };
  }
}

export function createEmptyStory(): PhotoStoryItem {
  return {
    id: newBlockId(),
    imageUrl: "",
    imageSize: "medium",
    title: "",
    text: "",
  };
}

export function createEmptyEvent(): TimelineEvent {
  return {
    id: newBlockId(),
    year: "",
    title: "",
    text: "",
  };
}

export function serializeContent(content: SectionContentV2): string {
  return JSON.stringify(content);
}

export function parseContent(
  contentJson: string | null,
  contentHtml: string | null,
  templateType: SectionTemplate
): SectionContentV2 {
  const tpl = normalizeTemplateType(templateType);

  if (contentJson) {
    try {
      const parsed = JSON.parse(contentJson) as SectionContentV2;
      if (parsed.version === 2) {
        return normalizeContent(parsed, tpl);
      }
    } catch {
      /* fallback below */
    }
  }

  if (contentHtml) {
    return normalizeContent(migrateHtmlToContent(contentHtml, tpl), tpl);
  }

  return createEmptyContent(tpl);
}

function normalizeContent(content: SectionContentV2, template: SectionTemplate): SectionContentV2 {
  const base: SectionContentV2 = {
    version: 2,
    heroImage: content.heroImage,
    heroSize: content.heroSize ?? "large",
    intro: content.intro,
    body: content.body,
    blocks: content.blocks,
    gallery: content.gallery?.map((g) => ({ ...g, size: g.size ?? "medium" })),
    stories: content.stories,
    events: content.events,
  };

  if (template === "article" && !base.intro && !base.body && base.blocks?.length) {
    const migrated = blocksToArticle(base.blocks);
    base.intro = migrated.intro;
    base.body = migrated.body;
  }

  if (template === "photo_story" && (!base.stories || base.stories.length === 0) && base.blocks?.length) {
    base.stories = blocksToStories(base.blocks);
  }

  if (template === "timeline" && (!base.events || base.events.length === 0) && base.blocks?.length) {
    base.events = blocksToTimeline(base.blocks);
  }

  return base;
}

export function migrateHtmlToContent(html: string, templateType: SectionTemplate): SectionContentV2 {
  const tpl = normalizeTemplateType(templateType);
  const blocks: ContentBlock[] = [];

  html
    .replace(/<img[^>]+src="([^"]+)"[^>]*>/gi, (_, src) => {
      blocks.push({ id: newBlockId(), type: "image", url: src, size: "medium" });
      return "";
    })
    .replace(/<strong>(.*?)<\/strong>/gi, (_, text) => {
      blocks.push({ id: newBlockId(), type: "heading", text: stripTags(text) });
      return "";
    })
    .replace(/<p>([\s\S]*?)<\/p>/gi, (_, text) => {
      const clean = stripTags(text).trim();
      if (clean) blocks.push({ id: newBlockId(), type: "paragraph", text: clean });
      return "";
    });

  if (blocks.length === 0 && html.trim()) {
    blocks.push({ id: newBlockId(), type: "paragraph", text: stripTags(html) });
  }

  if (tpl === "gallery") {
    const images = blocks.filter((b) => b.type === "image") as Extract<ContentBlock, { type: "image" }>[];
    return {
      version: 2,
      gallery: images.map((img) => ({
        id: img.id,
        url: img.url,
        caption: img.caption ?? "",
        size: img.size ?? "medium",
      })),
    };
  }

  if (tpl === "photo_story") {
    return { version: 2, stories: blocksToStories(blocks) };
  }

  if (tpl === "timeline") {
    return { version: 2, events: blocksToTimeline(blocks) };
  }

  const hero = blocks.find((b) => b.type === "image");
  const article = blocksToArticle(blocks.filter((b) => b.type !== "image"));

  return {
    version: 2,
    heroImage: hero && hero.type === "image" ? hero.url : undefined,
    heroSize: hero && hero.type === "image" ? (hero.size ?? "large") : "large",
    intro: article.intro,
    body: article.body,
    blocks: blocks.filter((b) => b.type !== "image"),
  };
}

function blocksToArticle(blocks: ContentBlock[]): { intro?: string; body?: string } {
  const texts = blocks
    .filter((b) => b.type === "paragraph" || b.type === "quote")
    .map((b) => b.text);
  if (texts.length === 0) return {};
  return { intro: texts[0], body: texts.slice(1).join("\n\n") };
}

function blocksToStories(blocks: ContentBlock[]): PhotoStoryItem[] {
  const stories: PhotoStoryItem[] = [];
  let current: PhotoStoryItem | null = null;

  const flush = () => {
    if (current && (current.imageUrl || current.title || current.text)) {
      stories.push(current);
    }
    current = null;
  };

  for (const block of blocks) {
    if (block.type === "image") {
      flush();
      current = {
        id: newBlockId(),
        imageUrl: block.url,
        imageSize: block.size ?? "medium",
        title: block.caption ?? "",
        text: "",
      };
    } else if (block.type === "heading") {
      if (!current) {
        current = { id: newBlockId(), imageUrl: "", imageSize: "medium", title: "", text: "" };
      }
      current.title = block.text;
    } else {
      if (!current) {
        current = { id: newBlockId(), imageUrl: "", imageSize: "medium", title: "", text: "" };
      }
      current.text = current.text ? `${current.text}\n\n${block.text}` : block.text;
    }
  }
  flush();
  return stories;
}

function blocksToTimeline(blocks: ContentBlock[]): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  let current: TimelineEvent | null = null;

  const flush = () => {
    if (current && (current.year || current.title || current.text || current.imageUrl)) {
      events.push(current);
    }
    current = null;
  };

  for (const block of blocks) {
    if (block.type === "heading") {
      flush();
      const yearMatch = block.text.match(/\b(1[89]\d{2}|20\d{2})\b/);
      current = {
        id: newBlockId(),
        year: yearMatch?.[1] ?? "",
        title: block.text,
        text: "",
      };
    } else if (block.type === "image") {
      if (!current) {
        current = { id: newBlockId(), year: "", title: "", text: "" };
      }
      current.imageUrl = block.url;
    } else {
      if (!current) {
        current = { id: newBlockId(), year: "", title: "", text: "" };
      }
      current.text = current.text ? `${current.text}\n\n${block.text}` : block.text;
    }
  }
  flush();
  return events;
}

function stripTags(s: string) {
  return s.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
}

export function getTemplateDescription(template: SectionTemplate): string {
  switch (template) {
    case "article":
      return "Большое фото и текст — для историй и статей об экспонатах";
    case "photo_story":
      return "Несколько сюжетов: фото с подписью и текстом, чередуются на экране";
    case "gallery":
      return "Коллекция снимков — размер каждого настраивается, нажатие увеличивает";
    case "timeline":
      return "События по годам — удобно для истории музея и организации";
  }
}

export function imageSizeClass(size: ImageSize | undefined, prefix: string): string {
  const s = size ?? "medium";
  return `${prefix}--${s}`;
}
