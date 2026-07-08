"use client";

import Image from "next/image";
import { useState } from "react";
import type { HomeContent, ScreenOrientation } from "@/lib/types";
import { HotspotOverlay } from "./HotspotOverlay";
import { MuseumLogo } from "./MuseumLogo";

interface HomePageProps {
  orientation: ScreenOrientation;
  homeContent: HomeContent[];
}

const defaultAssets = {
  flag: "/assets/flag-rb.png",
  emblem: "/assets/emblem-rb.png",
  logo: "/assets/logo-belog.png",
};

const hotspots = [
  { type: "flag" as const, label: "Флаг и гимн", sub: "Государственные символы" },
  { type: "logo" as const, label: "История музея", sub: "О нашей организации" },
  { type: "emblem" as const, label: "Законы и указы", sub: "Нормативные акты" },
];

export function HomePage({ orientation, homeContent }: HomePageProps) {
  const [activeHotspot, setActiveHotspot] = useState<"flag" | "emblem" | "logo" | null>(null);
  const isHorizontal = orientation === "horizontal";

  const getContent = (type: "flag" | "emblem" | "logo") =>
    homeContent.find((h) => h.hotspotType === type) ?? null;

  const imageSize = isHorizontal
    ? "clamp(130px, 30cqw, 240px)"
    : "clamp(120px, 34cqw, 200px)";

  return (
    <div className="home-scene">
      <header
        className={`home-top ${isHorizontal ? "home-top--row" : "home-top--col"}`}
      >
        <MuseumLogo size={isHorizontal ? 44 : 52} className="shrink-0" />
        <div className="min-w-0">
          <p className="home-top__org">Белорусское общество глухих</p>
          <h1 className="home-top__title">Интерактивный музей</h1>
        </div>
      </header>

      <div
        className={`home-items ${isHorizontal ? "home-items--row" : "home-items--col"}`}
      >
        {hotspots.map((spot) => (
          <button
            key={spot.type}
            type="button"
            onClick={() => setActiveHotspot(spot.type)}
            className="home-item"
            aria-label={spot.label}
          >
            <div className="home-item__img" style={{ width: imageSize, height: imageSize }}>
              <Image
                src={getContent(spot.type)?.mediaUrl ?? defaultAssets[spot.type]}
                alt=""
                width={200}
                height={200}
                className="h-full w-full object-contain"
              />
            </div>
            <p className="home-item__label">{spot.label}</p>
            <p className="home-item__sub">{spot.sub}</p>
          </button>
        ))}
      </div>

      {activeHotspot && (
        <HotspotOverlay
          orientation={orientation}
          content={getContent(activeHotspot)}
          onClose={() => setActiveHotspot(null)}
        />
      )}
    </div>
  );
}
