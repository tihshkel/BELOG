"use client";

import Image from "next/image";
import { useState } from "react";
import type { HomeContent, ScreenOrientation, StateSymbolType } from "@/lib/types";
import { HotspotOverlay } from "./HotspotOverlay";

interface StateSymbolsPageProps {
  orientation: ScreenOrientation;
  homeContent: HomeContent[];
}

const defaultAssets: Record<StateSymbolType, string> = {
  flag: "/assets/flag-rb.png",
  emblem: "/assets/emblem-rb.png",
  anthem: "/assets/anthem-rb.jpg",
};

const symbols: { type: StateSymbolType; label: string; sub: string }[] = [
  { type: "flag", label: "Государственный флаг", sub: "Символика Республики Беларусь" },
  { type: "emblem", label: "Государственный герб", sub: "Символика Республики Беларусь" },
  { type: "anthem", label: "Государственный гимн", sub: "Символика Республики Беларусь" },
];

export function StateSymbolsPage({ orientation, homeContent }: StateSymbolsPageProps) {
  const [activeSymbol, setActiveSymbol] = useState<StateSymbolType | null>(null);
  const isHorizontal = orientation === "horizontal";

  const getContent = (type: StateSymbolType) =>
    homeContent.find((h) => h.hotspotType === type) ?? null;

  const imageSize = isHorizontal
    ? "clamp(120px, 24cqw, 200px)"
    : "clamp(100px, 28cqw, 180px)";

  return (
    <div className="symbols-scene">
      <header className="symbols-scene__header">
        <h1 className="symbols-scene__title">Государственные символы</h1>
        <p className="symbols-scene__sub">Республика Беларусь</p>
      </header>

      <div
        className={`symbols-items ${isHorizontal ? "symbols-items--row" : "symbols-items--col"}`}
      >
        {symbols.map((symbol) => (
          <button
            key={symbol.type}
            type="button"
            onClick={() => setActiveSymbol(symbol.type)}
            className="symbols-item"
            aria-label={symbol.label}
          >
            <div
              className="symbols-item__img"
              style={{ width: imageSize, height: imageSize }}
            >
              <Image
                src={getContent(symbol.type)?.mediaUrl ?? defaultAssets[symbol.type]}
                alt=""
                width={200}
                height={200}
                className="h-full w-full object-contain"
              />
            </div>
            <p className="symbols-item__label">{symbol.label}</p>
            <p className="symbols-item__sub">{symbol.sub}</p>
          </button>
        ))}
      </div>

      {activeSymbol && (
        <HotspotOverlay
          orientation={orientation}
          content={getContent(activeSymbol)}
          onClose={() => setActiveSymbol(null)}
          simple
        />
      )}
    </div>
  );
}
