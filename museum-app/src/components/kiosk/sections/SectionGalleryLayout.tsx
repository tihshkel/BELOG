"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { ScreenOrientation, Section } from "@/lib/types";
import { imageSizeClass, parseContent } from "@/lib/section-content";
import { SectionHeader } from "./SectionHeader";
import { PhotoLightbox } from "./PhotoLightbox";

interface SectionGalleryLayoutProps {
  section: Section;
  orientation: ScreenOrientation;
}

export function SectionGalleryLayout({ section, orientation }: SectionGalleryLayoutProps) {
  const isHorizontal = orientation === "horizontal";
  const content = parseContent(section.contentJson, section.contentHtml, "gallery");
  const items = content.gallery ?? [];
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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
            <button
              key={item.id}
              type="button"
              className={`gallery-item ${imageSizeClass(item.size, "gallery-item")}`}
              onClick={() => setLightboxIndex(index)}
              aria-label={item.caption || `Фото ${index + 1}`}
            >
              <div className={`gallery-item__image ${imageSizeClass(item.size, "gallery-item__image")}`}>
                <Image
                  src={item.url}
                  alt={item.caption}
                  fill
                  sizes={isHorizontal ? "33vw" : "100vw"}
                  className="gallery-item__photo"
                />
              </div>
              {item.caption ? <p className="gallery-item__caption">{item.caption}</p> : null}
            </button>
          ))}
        </motion.div>
      </div>

      {lightboxIndex !== null ? (
        <PhotoLightbox
          images={items.map((i) => ({ url: i.url, caption: i.caption }))}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChange={setLightboxIndex}
        />
      ) : null}
    </div>
  );
}
