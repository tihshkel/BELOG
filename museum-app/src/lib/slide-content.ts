import type { MediaRef } from "./media";
import {
  createEmptyContent,
  parseContent,
  type SectionContentV2,
} from "./section-content";
import type { ScreenOrientation, SectionTemplate } from "./types";

export type SlideTextAlign = "left" | "center" | "right";

interface SlideElementBase {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SlideTextElement extends SlideElementBase {
  type: "text";
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  align: SlideTextAlign;
  bold?: boolean;
  italic?: boolean;
}

export interface SlideMediaElement extends SlideElementBase {
  type: "media";
  media?: MediaRef;
}

export interface SlideRectElement extends SlideElementBase {
  type: "rect";
  fill: string;
  opacity?: number;
}

export type SlideElement =
  | SlideTextElement
  | SlideMediaElement
  | SlideRectElement;

export interface Slide {
  id: string;
  elements: SlideElement[];
}

export interface SectionContentV3 {
  version: 3;
  slides: Slide[];
  sourceTemplate?: SectionTemplate;
}

const elementId = () => crypto.randomUUID();

function textElement(
  text: string,
  options: Partial<SlideTextElement> = {}
): SlideTextElement {
  return {
    id: elementId(),
    type: "text",
    x: 52,
    y: 18,
    w: 40,
    h: 18,
    text,
    fontFamily: "var(--theme-font-body)",
    fontSize: 3.4,
    color: "#111827",
    align: "left",
    ...options,
  };
}

function mediaElement(
  media: MediaRef | undefined,
  options: Partial<SlideMediaElement> = {}
): SlideMediaElement {
  return {
    id: elementId(),
    type: "media",
    x: 5,
    y: 10,
    w: 42,
    h: 80,
    media,
    ...options,
  };
}

function rectElement(
  options: Partial<SlideRectElement> = {}
): SlideRectElement {
  return {
    id: elementId(),
    type: "rect",
    x: 4,
    y: 6,
    w: 92,
    h: 88,
    fill: "#ffffff",
    opacity: 0.82,
    ...options,
  };
}

function slide(elements: SlideElement[]): Slide {
  return { id: crypto.randomUUID(), elements };
}

function articleSlides(
  content: SectionContentV2,
  orientation: ScreenOrientation
): Slide[] {
  if (orientation === "vertical") {
    return [
      slide([
        mediaElement(content.heroMedia, { x: 8, y: 6, w: 84, h: 40 }),
        textElement(content.intro || "Заголовок раздела", {
          x: 8,
          y: 50,
          w: 84,
          h: 12,
          fontFamily: "var(--theme-font-display)",
          fontSize: 4.2,
          bold: true,
        }),
        textElement(content.body || "Добавьте основной текст", {
          x: 8,
          y: 64,
          w: 84,
          h: 28,
          fontSize: 2.2,
        }),
      ]),
    ];
  }

  return [
    slide([
      mediaElement(content.heroMedia),
      textElement(content.intro || "Заголовок раздела", {
        y: 15,
        h: 22,
        fontFamily: "var(--theme-font-display)",
        fontSize: 5,
        bold: true,
      }),
      textElement(content.body || "Добавьте основной текст", {
        y: 42,
        h: 42,
        fontSize: 2.5,
      }),
    ]),
  ];
}

function photoStorySlides(
  content: SectionContentV2,
  orientation: ScreenOrientation
): Slide[] {
  const stories = content.stories?.length
    ? content.stories
    : [{ id: elementId(), title: "Новый сюжет", text: "Добавьте текст", imageSize: "large" as const }];

  return stories.map((story, index) => {
    if (orientation === "vertical") {
      return slide([
        mediaElement(story.media, { x: 8, y: 5, w: 84, h: 46 }),
        textElement(story.title, {
          x: 8,
          y: 55,
          w: 84,
          h: 12,
          fontFamily: "var(--theme-font-display)",
          fontSize: 3.8,
          bold: true,
        }),
        textElement(story.text, {
          x: 8,
          y: 70,
          w: 84,
          h: 24,
          fontSize: 2.2,
        }),
      ]);
    }

    const mediaX = index % 2 === 0 ? 5 : 53;
    const textX = index % 2 === 0 ? 52 : 6;
    return slide([
      mediaElement(story.media, { x: mediaX, w: 42 }),
      textElement(story.title, {
        x: textX,
        y: 18,
        w: 40,
        fontFamily: "var(--theme-font-display)",
        fontSize: 4.5,
        bold: true,
      }),
      textElement(story.text, { x: textX, y: 42, w: 40, h: 40, fontSize: 2.5 }),
    ]);
  });
}

function gallerySlides(
  content: SectionContentV2,
  orientation: ScreenOrientation
): Slide[] {
  const items = content.gallery ?? [];
  const isVertical = orientation === "vertical";
  const cellW = isVertical ? 44 : 42;
  const cellH = isVertical ? 40 : 36;
  const leftX = 5;
  const rightX = isVertical ? 51 : 53;
  const topY = isVertical ? 6 : 8;
  const bottomY = isVertical ? 52 : 53;

  if (!items.length) {
    return [
      slide([
        mediaElement(undefined, { x: leftX, y: topY, w: cellW, h: cellH }),
        mediaElement(undefined, { x: rightX, y: topY, w: cellW, h: cellH }),
        mediaElement(undefined, { x: leftX, y: bottomY, w: cellW, h: cellH }),
        mediaElement(undefined, { x: rightX, y: bottomY, w: cellW, h: cellH }),
      ]),
    ];
  }

  const pages: Slide[] = [];
  for (let offset = 0; offset < items.length; offset += 4) {
    const pageItems = items.slice(offset, offset + 4);
    pages.push(
      slide(
        pageItems.flatMap((item, index) => {
          const x = index % 2 === 0 ? leftX : rightX;
          const y = index < 2 ? topY : bottomY;
          return [
            mediaElement(item.media, { x, y, w: cellW, h: cellH }),
            textElement(item.caption, {
              x,
              y: y + cellH,
              w: cellW,
              h: isVertical ? 5 : 7,
              fontSize: 1.5,
              align: "center",
            }),
          ];
        })
      )
    );
  }
  return pages;
}

function timelineSlides(
  content: SectionContentV2,
  orientation: ScreenOrientation
): Slide[] {
  const events = content.events?.length
    ? content.events
    : [{ id: elementId(), year: "2026", title: "Новое событие", text: "Добавьте описание" }];

  return events.map((event) => {
    if (orientation === "vertical") {
      return slide([
        textElement(event.year, {
          x: 8,
          y: 6,
          w: 84,
          h: 12,
          fontFamily: "var(--theme-font-display)",
          fontSize: 5.5,
          bold: true,
          color: "#17549b",
        }),
        textElement(event.title, {
          x: 8,
          y: 20,
          w: 84,
          h: 10,
          fontSize: 3.2,
          bold: true,
        }),
        ...(event.media
          ? [mediaElement(event.media, { x: 8, y: 34, w: 84, h: 32 })]
          : [mediaElement(undefined, { x: 8, y: 34, w: 84, h: 32 })]),
        textElement(event.text, {
          x: 8,
          y: 70,
          w: 84,
          h: 24,
          fontSize: 2.2,
        }),
      ]);
    }

    return slide([
      textElement(event.year, {
        x: 6,
        y: 16,
        w: 25,
        h: 24,
        fontFamily: "var(--theme-font-display)",
        fontSize: 7,
        bold: true,
        color: "#17549b",
      }),
      textElement(event.title, {
        x: 34,
        y: 18,
        w: 58,
        h: 18,
        fontSize: 4,
        bold: true,
      }),
      textElement(event.text, { x: 34, y: 40, w: 58, h: 38, fontSize: 2.5 }),
      ...(event.media
        ? [mediaElement(event.media, { x: 6, y: 46, w: 24, h: 35 })]
        : []),
    ]);
  });
}

function highlightSlides(
  content: SectionContentV2,
  orientation: ScreenOrientation
): Slide[] {
  const cards =
    content.highlights?.length
      ? content.highlights
      : Array.from({ length: 4 }, () => ({
          id: elementId(),
          title: "Карточка",
          text: "Краткое описание",
          media: undefined as MediaRef | undefined,
        }));

  const isVertical = orientation === "vertical";
  const cardW = isVertical ? 44 : 43;
  const cardH = isVertical ? 42 : 40;
  const leftX = 5;
  const rightX = isVertical ? 51 : 52;
  const topY = isVertical ? 5 : 7;
  const bottomY = isVertical ? 52 : 52;

  return [
    slide(
      cards.slice(0, 4).flatMap((card, index) => {
        const x = index % 2 === 0 ? leftX : rightX;
        const y = index < 2 ? topY : bottomY;
        const hasMedia = Boolean(card.media?.url);

        if (isVertical) {
          return [
            rectElement({ x, y, w: cardW, h: cardH }),
            ...(hasMedia && card.media
              ? [mediaElement(card.media, { x: x + 3, y: y + 3, w: cardW - 6, h: 18 })]
              : []),
            textElement(card.title, {
              x: x + 3,
              y: hasMedia ? y + 23 : y + 8,
              w: cardW - 6,
              h: 8,
              fontSize: 2.2,
              bold: true,
            }),
            textElement(card.text, {
              x: x + 3,
              y: hasMedia ? y + 32 : y + 20,
              w: cardW - 6,
              h: hasMedia ? 8 : 16,
              fontSize: 1.5,
            }),
          ];
        }

        return [
          rectElement({ x, y, w: cardW, h: cardH }),
          ...(hasMedia && card.media
            ? [mediaElement(card.media, { x: x + 2, y: y + 3, w: 15, h: 34 })]
            : []),
          textElement(card.title, {
            x: hasMedia ? x + 19 : x + 3,
            y: y + 7,
            w: hasMedia ? 21 : 37,
            h: 10,
            fontSize: 2.6,
            bold: true,
          }),
          textElement(card.text, {
            x: hasMedia ? x + 19 : x + 3,
            y: y + 20,
            w: hasMedia ? 21 : 37,
            h: 15,
            fontSize: 1.7,
          }),
        ];
      })
    ),
  ];
}

export function createSlideContent(
  template: SectionTemplate,
  content: SectionContentV2 = createEmptyContent(template),
  orientation: ScreenOrientation = "horizontal"
): SectionContentV3 {
  const factories: Record<
    SectionTemplate,
    (value: SectionContentV2, orientation: ScreenOrientation) => Slide[]
  > = {
    article: articleSlides,
    photo_story: photoStorySlides,
    gallery: gallerySlides,
    timeline: timelineSlides,
    highlights: highlightSlides,
  };
  return {
    version: 3,
    sourceTemplate: template,
    slides: factories[template](content, orientation),
  };
}

export function parseSlideContent(
  contentJson: string | null,
  contentHtml: string | null,
  template: SectionTemplate
): SectionContentV3 {
  if (contentJson) {
    try {
      const parsed = JSON.parse(contentJson) as SectionContentV3;
      if (parsed.version === 3 && Array.isArray(parsed.slides)) return parsed;
    } catch {
      // Continue with the V2 migration.
    }
  }
  return createSlideContent(
    template,
    parseContent(contentJson, contentHtml, template)
  );
}

export function serializeSlideContent(content: SectionContentV3) {
  return JSON.stringify(content);
}

export function createBlankSlide(): Slide {
  return slide([]);
}

export type SlideLayoutId = SectionTemplate | "blank";

export interface SlideLayoutOption {
  id: SlideLayoutId;
  label: string;
  description: string;
}

export const SLIDE_LAYOUTS: SlideLayoutOption[] = [
  {
    id: "blank",
    label: "Пустой",
    description: "Чистый слайд без элементов",
  },
  {
    id: "article",
    label: "Статья",
    description: "Медиа и текст — рядом или сверху вниз",
  },
  {
    id: "photo_story",
    label: "Фотоистория",
    description: "Крупное медиа и текстовый блок",
  },
  {
    id: "gallery",
    label: "Галерея",
    description: "Сетка из четырёх медиа",
  },
  {
    id: "timeline",
    label: "Хронология",
    description: "Год, заголовок и описание события",
  },
  {
    id: "highlights",
    label: "Карточки",
    description: "Четыре карточки на одном слайде",
  },
];

/** One starter slide from a layout (for «+ Слайд»), without wiping the deck. */
export function createSlideFromLayout(
  layoutId: SlideLayoutId,
  orientation: ScreenOrientation = "horizontal"
): Slide {
  if (layoutId === "blank") return createBlankSlide();
  const generated = createSlideContent(layoutId, undefined, orientation).slides[0];
  if (!generated) return createBlankSlide();
  return {
    id: crypto.randomUUID(),
    elements: generated.elements.map((element) => ({
      ...element,
      id: crypto.randomUUID(),
    })),
  };
}

export function duplicateSlideElement(element: SlideElement): SlideElement {
  return {
    ...element,
    id: crypto.randomUUID(),
    x: clampPercent(element.x + 3, 0, 100 - element.w),
    y: clampPercent(element.y + 3, 0, 100 - element.h),
  };
}

function clampPercent(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function createTextElement(): SlideTextElement {
  return textElement("Новый текст", { x: 20, y: 25, w: 60, h: 18 });
}

export function createMediaElement(): SlideMediaElement {
  return mediaElement(undefined, { x: 25, y: 20, w: 50, h: 60 });
}

export function createRectElement(): SlideRectElement {
  return rectElement({ x: 20, y: 20, w: 60, h: 45 });
}
