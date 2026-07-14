import type { Section } from "./types";
import { normalizeTemplateType } from "./section-content";
import { parseSlideContent } from "./slide-content";

export const EMPTY_SLOT_TITLE = "Название раздела";
export const SLOT_COUNT = 10;

export function formatSlotNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export function parseSlotParam(param: string): number | null {
  const n = parseInt(param, 10);
  if (Number.isNaN(n) || n < 1 || n > SLOT_COUNT) return null;
  return n - 1;
}

function hasMeaningfulContent(section: Section): boolean {
  const content = parseSlideContent(
    section.contentJson,
    section.contentHtml,
    normalizeTemplateType(section.templateType)
  );

  return content.slides.some((slide) =>
    slide.elements.some((element) => {
      if (element.type === "text") return Boolean(element.text.trim());
      if (element.type === "media") return Boolean(element.media?.url);
      return true;
    })
  );
}

export function isEmptySlot(section: Section): boolean {
  return (
    !section.isPublished &&
    section.title === EMPTY_SLOT_TITLE &&
    !section.coverUrl &&
    !hasMeaningfulContent(section)
  );
}

export type SlotStatus = "published" | "hidden" | "empty";

export function getSlotStatus(section: Section): SlotStatus {
  if (isEmptySlot(section)) return "empty";
  if (section.isPublished) return "published";
  return "hidden";
}

export const SLOT_STATUS_LABELS: Record<SlotStatus, string> = {
  published: "На экране",
  hidden: "Скрыт",
  empty: "Пусто",
};
