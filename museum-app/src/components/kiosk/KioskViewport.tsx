"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import type { ScreenOrientation } from "@/lib/types";
import { getScreenSpec } from "@/lib/screen-specs";

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
  const bgSrc = orientation === "horizontal" ? "/assets/bg-horizontal.jpg" : "/assets/bg-vertical.jpg";

  return (
    <div className="kiosk-shell" data-orientation={orientation}>
      <div
        className="kiosk-canvas @container"
        style={{
          aspectRatio: `${spec.widthMm} / ${spec.heightMm}`,
        }}
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
