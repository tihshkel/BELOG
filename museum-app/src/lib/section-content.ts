import type { SectionTemplate } from "./types";
import type { MediaRef } from "./media";
import { inferKindFromUrl, mediaRefFromUrl, normalizeMediaRef } from "./media";

export type { SectionTemplate };
export type { MediaRef, MediaKind, MediaSlide, MediaUploadResult } from "./media";
export { inferKindFromUrl, mediaRefFromUrl, normalizeMediaRef, getMediaThumbnailUrl, parseStoredMediaValue, mediaRefToStorageValue } from "./media";

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
  media?: MediaRef;
  caption: string;
  size?: ImageSize;
  /** legacy */
  url?: string;
}

export interface PhotoStoryItem {
  id: string;
  media?: MediaRef;
  imageSize: ImageSize;
  title: string;
  text: string;
  /** legacy */
  imageUrl?: string;
}

export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  text: string;
  media?: MediaRef;
  /** legacy */
  imageUrl?: string;
}

export interface HighlightCard {
  id: string;
  media?: MediaRef;
  title: string;
  text: string;
  /** legacy */
  imageUrl?: string;
}

export interface SectionContentV2 {
  version: 2;
  /** Статья */
  heroMedia?: MediaRef;
  heroSize?: ImageSize;
  intro?: string;
  body?: string;
  /** legacy */
  heroImage?: string;
  /** Устаревшее — для миграции */
  blocks?: ContentBlock[];
  /** Фото и текст */
  stories?: PhotoStoryItem[];
  /** Галерея */
  gallery?: GalleryItem[];
  /** Хронология */
  events?: TimelineEvent[];
  /** Карточки */
  highlights?: HighlightCard[];
}

export const GLOBAL_SCREEN_ID = "global";

/** Старые значения в БД → новые */
const VALID_TEMPLATES: SectionTemplate[] = [
  "article",
  "photo_story",
  "gallery",
  "timeline",
  "highlights",
];

export function normalizeTemplateType(value: string): SectionTemplate {
  if (value === "blocks") return "photo_story";
  if (value === "text_only") return "timeline";
  if (VALID_TEMPLATES.includes(value as SectionTemplate)) {
    return value as SectionTemplate;
  }
  return "article";
}

export const TEMPLATE_LABELS: Record<SectionTemplate, string> = {
  article: "Статья",
  photo_story: "Фотоистория",
  gallery: "Галерея",
  timeline: "Хронология",
  highlights: "Карточки",
};

export const TEMPLATE_BADGE_CLASS: Record<SectionTemplate, string> = {
  article: "admin-template-badge--article",
  photo_story: "admin-template-badge--photo-story",
  gallery: "admin-template-badge--gallery",
  timeline: "admin-template-badge--timeline",
  highlights: "admin-template-badge--highlights",
};

export const TEMPLATE_ICONS: Record<SectionTemplate, string> = {
  article: "article",
  photo_story: "auto_stories",
  gallery: "photo_library",
  timeline: "timeline",
  highlights: "grid_view",
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
    case "highlights":
      return { version: 2, highlights: [] };
  }
}

export function createEmptyHighlight(): HighlightCard {
  return {
    id: newBlockId(),
    media: undefined,
    title: "",
    text: "",
  };
}

export function createEmptyStory(): PhotoStoryItem {
  return {
    id: newBlockId(),
    media: mediaRefFromUrl(""),
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

function normalizeGalleryItem(item: GalleryItem): GalleryItem {
  const legacyUrl = item.url ?? item.media?.url ?? "";
  const media = normalizeMediaRef(item.media ?? legacyUrl);
  if (!media) {
    return { ...item, media: mediaRefFromUrl(""), caption: item.caption ?? "" };
  }
  return {
    id: item.id,
    media,
    caption: item.caption ?? "",
    size: item.size ?? "medium",
  };
}

function normalizeStoryItem(item: PhotoStoryItem): PhotoStoryItem {
  const legacyUrl = item.imageUrl ?? item.media?.url ?? "";
  const media = normalizeMediaRef(item.media ?? legacyUrl) ?? mediaRefFromUrl("");
  return {
    id: item.id,
    media,
    imageSize: item.imageSize ?? "medium",
    title: item.title ?? "",
    text: item.text ?? "",
  };
}

function normalizeTimelineEvent(event: TimelineEvent): TimelineEvent {
  const legacyUrl = event.imageUrl;
  const media = legacyUrl ? normalizeMediaRef(event.media ?? legacyUrl) ?? undefined : normalizeMediaRef(event.media) ?? undefined;
  return {
    id: event.id,
    year: event.year ?? "",
    title: event.title ?? "",
    text: event.text ?? "",
    media: media ?? undefined,
  };
}

function normalizeHighlightCard(card: HighlightCard): HighlightCard {
  const legacyUrl = card.imageUrl;
  const media = legacyUrl ? normalizeMediaRef(card.media ?? legacyUrl) ?? undefined : normalizeMediaRef(card.media) ?? undefined;
  return {
    id: card.id,
    media: media ?? undefined,
    title: card.title ?? "",
    text: card.text ?? "",
  };
}

function normalizeContent(content: SectionContentV2, template: SectionTemplate): SectionContentV2 {
  const heroMedia =
    normalizeMediaRef(content.heroMedia ?? content.heroImage) ?? undefined;

  const base: SectionContentV2 = {
    version: 2,
    heroMedia,
    heroSize: content.heroSize ?? "large",
    intro: content.intro,
    body: content.body,
    blocks: content.blocks,
    gallery: content.gallery?.map(normalizeGalleryItem),
    stories: content.stories?.map(normalizeStoryItem),
    events: content.events?.map(normalizeTimelineEvent),
    highlights: content.highlights?.map(normalizeHighlightCard),
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
        media: mediaRefFromUrl(img.url),
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
    heroMedia: hero && hero.type === "image" ? mediaRefFromUrl(hero.url) : undefined,
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
    if (current && (current.media?.url || current.title || current.text)) {
      stories.push(current);
    }
    current = null;
  };

  for (const block of blocks) {
    if (block.type === "image") {
      flush();
      current = {
        id: newBlockId(),
        media: mediaRefFromUrl(block.url),
        imageSize: block.size ?? "medium",
        title: block.caption ?? "",
        text: "",
      };
    } else if (block.type === "heading") {
      if (!current) {
        current = { id: newBlockId(), media: mediaRefFromUrl(""), imageSize: "medium", title: "", text: "" };
      }
      current.title = block.text;
    } else {
      if (!current) {
        current = { id: newBlockId(), media: mediaRefFromUrl(""), imageSize: "medium", title: "", text: "" };
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
    if (current && (current.year || current.title || current.text || current.media?.url)) {
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
      current.media = mediaRefFromUrl(block.url);
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
      return "Стартовый макет: медиа и текст — дальше редактируйте как слайды";
    case "photo_story":
      return "Несколько слайдов-сюжетов: медиа слева/справа и текст";
    case "gallery":
      return "Сетка медиа на слайдах — перетаскивайте и меняйте размеры";
    case "timeline":
      return "Слайды по событиям: год, заголовок и описание";
    case "highlights":
      return "Карточки на слайде: фигура, медиа и короткий текст";
  }
}

export function imageSizeClass(size: ImageSize | undefined, prefix: string): string {
  const s = size ?? "medium";
  return `${prefix}--${s}`;
}
