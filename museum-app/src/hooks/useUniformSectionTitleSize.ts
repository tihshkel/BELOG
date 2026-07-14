import { useLayoutEffect, useRef } from "react";

const MIN_FONT_RATIO = 0.07;
const ABSOLUTE_MIN_FONT_PX = 12;

function parseFontSizePx(element: HTMLElement) {
  return parseFloat(getComputedStyle(element).fontSize);
}

function isOverflowing(element: HTMLElement) {
  return (
    element.scrollHeight > element.clientHeight + 1 ||
    element.scrollWidth > element.clientWidth + 1
  );
}

function getMinFontPx(element: HTMLElement) {
  const slot = element.closest(".sections-hub__slot");
  const slotHeight = slot?.clientHeight ?? 0;
  const scaledMin = Math.round(slotHeight * MIN_FONT_RATIO);
  return Math.max(ABSOLUTE_MIN_FONT_PX, scaledMin);
}

function findLargestFittingSize(element: HTMLElement) {
  element.style.removeProperty("--name-font-size");

  const maxPx = parseFontSizePx(element);
  const minPx = getMinFontPx(element);

  let low = minPx;
  let high = maxPx;
  let best = minPx;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    element.style.fontSize = `${mid}px`;

    if (isOverflowing(element)) {
      high = mid - 1;
    } else {
      best = mid;
      low = mid + 1;
    }
  }

  element.style.removeProperty("font-size");
  return best;
}

function getReferenceNameElement(hub: HTMLElement) {
  return hub.querySelector<HTMLElement>(
    ".sections-hub__col--left .sections-hub__slot:first-child .sections-hub__name",
  );
}

export function useUniformSectionTitleSize(titleKey: string) {
  const hubRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const hub = hubRef.current;
    if (!hub) return;

    const applyUniformSize = () => {
      const reference = getReferenceNameElement(hub);
      if (!reference) return;

      const sizePx = findLargestFittingSize(reference);
      hub.style.setProperty("--sections-name-font-size", `${sizePx}px`);
    };

    applyUniformSize();

    const observer = new ResizeObserver(applyUniformSize);
    observer.observe(hub);

    const referenceSlot = getReferenceNameElement(hub)?.closest(".sections-hub__slot");
    if (referenceSlot) observer.observe(referenceSlot);

    return () => observer.disconnect();
  }, [titleKey]);

  return hubRef;
}
