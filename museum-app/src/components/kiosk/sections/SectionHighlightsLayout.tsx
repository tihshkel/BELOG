"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ScreenOrientation, Section } from "@/lib/types";
import { parseContent } from "@/lib/section-content";
import { SectionHeader } from "./SectionHeader";
import { MediaTile } from "../media/MediaTile";
import { MediaPreviewOverlay } from "../media/MediaPreviewOverlay";

interface SectionHighlightsLayoutProps {
  section: Section;
  orientation: ScreenOrientation;
}

export function SectionHighlightsLayout({ section, orientation }: SectionHighlightsLayoutProps) {
  const isHorizontal = orientation === "horizontal";
  const content = parseContent(section.contentJson, section.contentHtml, "highlights");
  const cards = content.highlights ?? [];
  const [previewId, setPreviewId] = useState<string | null>(null);
  const previewCard = cards.find((c) => c.id === previewId);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-transparent">
      <SectionHeader title={section.title} orientation={orientation} />

      <div className="highlights-layout flex-1 min-h-0 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className={`highlights-grid ${isHorizontal ? "highlights-grid--horizontal" : "highlights-grid--vertical"}`}
        >
          {cards.map((card) => (
            <article key={card.id} className="highlights-card">
              {card.media?.url ? (
                <div className="highlights-card__image">
                  <MediaTile
                    media={card.media}
                    title={card.title}
                    className="highlights-card__media-tile"
                    sizes={isHorizontal ? "25vw" : "100vw"}
                    onClick={() => setPreviewId(card.id)}
                    asButton
                  />
                </div>
              ) : null}
              <div className="highlights-card__body">
                {card.title ? <h3 className="highlights-card__title">{card.title}</h3> : null}
                {card.text ? <p className="highlights-card__text">{card.text}</p> : null}
              </div>
            </article>
          ))}
        </motion.div>
      </div>

      {previewCard?.media?.url ? (
        <MediaPreviewOverlay
          items={[{ media: previewCard.media, title: previewCard.title }]}
          index={0}
          onClose={() => setPreviewId(null)}
        />
      ) : null}
    </div>
  );
}
