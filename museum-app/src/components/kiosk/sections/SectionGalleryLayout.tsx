"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ScreenOrientation, Section } from "@/lib/types";
import { mediaRefFromUrl } from "@/lib/media";
import { imageSizeClass, parseContent } from "@/lib/section-content";
import { SectionHeader } from "./SectionHeader";
import { MediaTile } from "../media/MediaTile";
import { MediaPreviewOverlay } from "../media/MediaPreviewOverlay";

interface SectionGalleryLayoutProps {
  section: Section;
  orientation: ScreenOrientation;
}

export function SectionGalleryLayout({ section, orientation }: SectionGalleryLayoutProps) {
  const isHorizontal = orientation === "horizontal";
  const content = parseContent(section.contentJson, section.contentHtml, "gallery");
  const items = content.gallery ?? [];
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-transparent">
      <SectionHeader title={section.title} orientation={orientation} />

      <div className="gallery-layout flex-1 min-h-0 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className={`gallery-grid ${isHorizontal ? "gallery-grid--horizontal" : "gallery-grid--vertical"}`}
        >
          {items.map((item, index) => (
            <MediaTile
              key={item.id}
              media={item.media ?? mediaRefFromUrl("")}
              caption={item.caption}
              className={`gallery-item ${imageSizeClass(item.size, "gallery-item")}`}
              imageClassName={`gallery-item__image ${imageSizeClass(item.size, "gallery-item__image")}`}
              sizes={isHorizontal ? "33vw" : "100vw"}
              onClick={() => setPreviewIndex(index)}
              asButton
            />
          ))}
        </motion.div>
      </div>

      {previewIndex !== null && items[previewIndex]?.media?.url ? (
        <MediaPreviewOverlay
          items={items.map((item) => ({ media: item.media ?? mediaRefFromUrl(""), caption: item.caption }))}
          index={previewIndex}
          onClose={() => setPreviewIndex(null)}
          onChange={setPreviewIndex}
        />
      ) : null}
    </div>
  );
}
