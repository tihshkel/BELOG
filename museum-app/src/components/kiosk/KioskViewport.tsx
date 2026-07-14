"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { ScreenOrientation } from "@/lib/types";
import { getScreenSpec } from "@/lib/screen-specs";
import { DEFAULT_PROJECT_THEME, type ProjectTheme } from "@/lib/project-theme";

interface KioskViewportProps {
  orientation: ScreenOrientation;
  children: ReactNode;
}

/**
 * Контейнер киоска с пропорциями реального экрана (мм).
 * На тач-экране в музее — на весь viewport.
 * На ПК для разработки — вписывается в окно с сохранением пропорций.
 */
export function KioskViewport({ orientation, children }: KioskViewportProps) {
  const spec = getScreenSpec(orientation);
  const [theme, setTheme] = useState<ProjectTheme>(DEFAULT_PROJECT_THEME);
  const bgSrc =
    orientation === "horizontal"
      ? theme.backgroundHorizontal
      : theme.backgroundVertical;

  useEffect(() => {
    void fetch("/api/theme")
      .then((response) => (response.ok ? response.json() : DEFAULT_PROJECT_THEME))
      .then((nextTheme: ProjectTheme) => setTheme(nextTheme))
      .catch(() => setTheme(DEFAULT_PROJECT_THEME));
  }, []);

  const canvasStyle = {
    "--kiosk-aspect": spec.aspectRatio,
    "--theme-font-body": theme.fontBody,
    "--theme-font-display": theme.fontDisplay,
    aspectRatio: `${spec.widthMm} / ${spec.heightMm}`,
  } as CSSProperties;

  return (
    <div className="kiosk-shell" data-orientation={orientation}>
      <div
        className="kiosk-canvas @container"
        style={canvasStyle}
        data-orientation={orientation}
      >
        {/* Единый фон для всех страниц киоска */}
        <div className="absolute inset-0">
          <Image src={bgSrc} alt="" fill priority sizes="100vw" className="object-cover" />
        </div>

        <div className="relative z-10 h-full w-full">{children}</div>
      </div>
    </div>
  );
}
