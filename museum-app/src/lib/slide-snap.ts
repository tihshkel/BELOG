import type { SlideElement } from "./slide-content";

export type ResizeCorner = "nw" | "ne" | "sw" | "se";

const MIN_SIZE = 4;
const SNAP_THRESHOLD = 1.5;
const GRID = 1;

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function snapToTargets(value: number, targets: number[]) {
  let best = value;
  let bestDist = SNAP_THRESHOLD;
  for (const target of targets) {
    const dist = Math.abs(value - target);
    if (dist < bestDist) {
      best = target;
      bestDist = dist;
    }
  }
  const grid = Math.round(best / GRID) * GRID;
  if (Math.abs(best - grid) < SNAP_THRESHOLD) return grid;
  return best;
}

export function snapMove(
  element: Pick<SlideElement, "x" | "y" | "w" | "h">,
  others: Pick<SlideElement, "x" | "y" | "w" | "h">[]
): { x: number; y: number } {
  const xTargets = [0, 50 - element.w / 2, 100 - element.w];
  const yTargets = [0, 50 - element.h / 2, 100 - element.h];
  for (const other of others) {
    xTargets.push(
      other.x,
      other.x + other.w - element.w,
      other.x + other.w / 2 - element.w / 2
    );
    yTargets.push(
      other.y,
      other.y + other.h - element.h,
      other.y + other.h / 2 - element.h / 2
    );
  }
  return {
    x: clamp(snapToTargets(element.x, xTargets), 0, 100 - element.w),
    y: clamp(snapToTargets(element.y, yTargets), 0, 100 - element.h),
  };
}

export function resizeFromCorner(options: {
  initial: Pick<SlideElement, "x" | "y" | "w" | "h">;
  corner: ResizeCorner;
  dx: number;
  dy: number;
  keepAspect: boolean;
}): { x: number; y: number; w: number; h: number } {
  const { initial, corner, dx, dy, keepAspect } = options;
  const aspect = initial.w / Math.max(initial.h, 0.01);

  let x = initial.x;
  let y = initial.y;
  let w = initial.w;
  let h = initial.h;

  if (corner === "se") {
    w = initial.w + dx;
    h = initial.h + dy;
  } else if (corner === "sw") {
    w = initial.w - dx;
    h = initial.h + dy;
    x = initial.x + dx;
  } else if (corner === "ne") {
    w = initial.w + dx;
    h = initial.h - dy;
    y = initial.y + dy;
  } else {
    w = initial.w - dx;
    h = initial.h - dy;
    x = initial.x + dx;
    y = initial.y + dy;
  }

  if (keepAspect) {
    const useWidth = Math.abs(dx) >= Math.abs(dy);
    if (useWidth) {
      h = w / aspect;
      if (corner.includes("n")) y = initial.y + initial.h - h;
    } else {
      w = h * aspect;
      if (corner.includes("w")) x = initial.x + initial.w - w;
    }
  }

  if (w < MIN_SIZE) {
    if (corner.includes("w")) x = initial.x + initial.w - MIN_SIZE;
    w = MIN_SIZE;
  }
  if (h < MIN_SIZE) {
    if (corner.includes("n")) y = initial.y + initial.h - MIN_SIZE;
    h = MIN_SIZE;
  }

  x = clamp(x, 0, 100 - MIN_SIZE);
  y = clamp(y, 0, 100 - MIN_SIZE);
  w = clamp(w, MIN_SIZE, 100 - x);
  h = clamp(h, MIN_SIZE, 100 - y);

  return {
    x: snapToTargets(x, [0, 50 - w / 2, 100 - w]),
    y: snapToTargets(y, [0, 50 - h / 2, 100 - h]),
    w: snapToTargets(w, [25, 33, 50, 66, 75]),
    h: snapToTargets(h, [25, 33, 50, 66, 75]),
  };
}
