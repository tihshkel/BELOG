"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { Section, ScreenOrientation } from "@/lib/types";
import { KioskPageHeader } from "./KioskPageHeader";

interface SectionsGridProps {
  orientation: ScreenOrientation;
  sections: Section[];
  onSelect: (index: number) => void;
}

export function SectionsGrid({ orientation, sections, onSelect }: SectionsGridProps) {
  const isHorizontal = orientation === "horizontal";

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-transparent">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <KioskPageHeader
          title="Разделы музея"
          logoSize={isHorizontal ? 50 : 56}
        />
      </motion.div>

      <div
        className={`section-grid flex-1 min-h-0 overflow-y-auto ${
          isHorizontal ? "section-grid--horizontal" : "section-grid--vertical"
        }`}
      >
        {sections.map((section, index) => (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelect(index)}
            className="section-card"
            aria-label={section.title}
          >
            <div className="section-card__media">
              {section.coverUrl ? (
                <Image
                  src={section.coverUrl}
                  alt=""
                  fill
                  sizes={isHorizontal ? "50vw" : "100vw"}
                  className="section-card__photo"
                />
              ) : (
                <div className="section-card__fallback" aria-hidden />
              )}

              <div className="section-card__dim" aria-hidden />
              <div className="section-card__shade" aria-hidden />

              <div className="section-card__content">
                <h2 className="section-card__title">{section.title}</h2>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
