import type { ScreenOrientation } from "./types";

/** Фактические физические размеры тач-экранов в миллиметрах */
export const SCREEN_SPECS = {
  horizontal: {
    widthMm: 952,
    heightMm: 535,
    aspectRatio: 952 / 535,
    label: "952 × 535 мм",
  },
  vertical: {
    widthMm: 616,
    heightMm: 1096,
    aspectRatio: 616 / 1096,
    label: "616 × 1096 мм",
  },
} as const satisfies Record<
  ScreenOrientation,
  { widthMm: number; heightMm: number; aspectRatio: number; label: string }
>;

export function getScreenSpec(orientation: ScreenOrientation) {
  return SCREEN_SPECS[orientation];
}

export function getDisplayBgSrc(orientation: ScreenOrientation) {
  return orientation === "horizontal" ? "/assets/bg-horizontal.jpg" : "/assets/bg-vertical.jpg";
}
