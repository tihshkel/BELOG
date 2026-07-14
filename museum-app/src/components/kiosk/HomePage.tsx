"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import type { HomeContent, ScreenOrientation } from "@/lib/types";
import { LOGO_HISTORY_DEFAULT } from "@/lib/home-history-content";
import { HotspotOverlay } from "./HotspotOverlay";
import { MuseumLogo } from "./MuseumLogo";

interface HomePageProps {
  orientation: ScreenOrientation;
  homeContent: HomeContent[];
  onOpenStateSymbols: () => void;
}

const defaultLogo = "/assets/logo-belog.png";

export function HomePage({ orientation, homeContent, onOpenStateSymbols }: HomePageProps) {
  const [showHistory, setShowHistory] = useState(false);
  const isHorizontal = orientation === "horizontal";

  const logoContent =
    homeContent.find((h) => h.hotspotType === "logo") ?? {
      id: "default-logo",
      screenId: orientation,
      hotspotType: "logo" as const,
      title: LOGO_HISTORY_DEFAULT.title,
      contentJson: LOGO_HISTORY_DEFAULT.contentJson,
      contentHtml: LOGO_HISTORY_DEFAULT.contentHtml,
      mediaUrl: LOGO_HISTORY_DEFAULT.mediaUrl,
      updatedAt: "",
    };
  const logoSrc = logoContent?.mediaUrl ?? defaultLogo;
  const logoSize = isHorizontal
    ? "clamp(200px, 42cqw, 380px)"
    : "clamp(180px, 52cqw, 320px)";

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

      <button
        type="button"
        onClick={onOpenStateSymbols}
        className="home-symbols-btn"
        aria-label="Государственные символы"
      >
        Государственные символы
      </button>

      <div className="home-logo-center">
        <motion.button
          type="button"
          onClick={() => setShowHistory(true)}
          className="home-logo-pulse"
          aria-label="История музея"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="home-logo-pulse__img" style={{ width: logoSize, height: logoSize }}>
            <Image
              src={logoSrc}
              alt="Белорусское общество глухих"
              width={400}
              height={400}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <p className="home-logo-pulse__label">{logoContent.title ?? "История музея"}</p>
          <p className="home-logo-pulse__sub">О нашей организации</p>
        </motion.button>
      </div>

      {showHistory && (
        <HotspotOverlay
          orientation={orientation}
          content={logoContent}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}
