"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { ScreenOrientation, Section } from "@/lib/types";
import type { MediaRef } from "@/lib/media";
import { imageSizeClass, parseContent } from "@/lib/section-content";
import { getDisplayBgSrc } from "@/lib/screen-specs";
import { SectionHeader } from "./SectionHeader";
import { MediaTile } from "../media/MediaTile";
import { MediaPreviewOverlay } from "../media/MediaPreviewOverlay";

interface SectionArticleLayoutProps {
  section: Section;
  orientation: ScreenOrientation;
}

export function SectionArticleLayout({ section, orientation }: SectionArticleLayoutProps) {
  const isHorizontal = orientation === "horizontal";
  const displayBg = getDisplayBgSrc(orientation);
  const content = parseContent(section.contentJson, section.contentHtml, "article");
  const heroMedia = content.heroMedia ?? (content.heroImage ? { url: content.heroImage, kind: "image" as const } : null);
  const hasVisual = Boolean(heroMedia?.url);
  const heroSize = content.heroSize ?? "large";
  const intro = content.intro?.trim();
  const body = content.body?.trim();
  const [previewOpen, setPreviewOpen] = useState(false);

  const layoutClass = [
    "article-layout",
    isHorizontal ? "article-layout--horizontal" : "article-layout--vertical",
    !hasVisual ? "article-layout--text-only" : "",
    hasVisual ? imageSizeClass(heroSize, "article-layout") : "",
  ]
    .filter(Boolean)
    .join(" ");

  const renderHero = (media: MediaRef) => {
    if (media.kind === "image") {
      return (
        <aside className={`article-visual ${imageSizeClass(heroSize, "article-visual")}`}>
          <Image src={displayBg} alt="" fill sizes="40vw" className="article-visual__bg" />
          <div className="article-visual__inner">
            <button type="button" className="article-visual__tap" onClick={() => setPreviewOpen(true)} aria-label="Открыть изображение">
              <Image
                src={media.url}
                alt={section.title}
                fill
                sizes={isHorizontal ? "40vw" : "100vw"}
                className="article-visual__img"
              />
            </button>
          </div>
        </aside>
      );
    }

    return (
      <aside className={`article-visual article-visual--media ${imageSizeClass(heroSize, "article-visual")}`}>
        <Image src={displayBg} alt="" fill sizes="40vw" className="article-visual__bg" />
        <div className="article-visual__inner article-visual__inner--media">
          <MediaTile
            media={media}
            title={section.title}
            className="article-visual__media-tile"
            sizes={isHorizontal ? "40vw" : "100vw"}
            onClick={() => setPreviewOpen(true)}
            asButton
          />
        </div>
      </aside>
    );
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-transparent">
      <SectionHeader title={section.title} orientation={orientation} />

      <div className={`article-body flex-1 min-h-0 ${layoutClass}`}>
        {hasVisual && heroMedia ? renderHero(heroMedia) : null}

        {(intro || body) ? (
          <section className="article-reader">
            <div className="article-reader__scroll">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.5 }}
                className="article-reader__inner"
              >
                {intro ? <p className="article-lead">{intro}</p> : null}
                {body ? <div className="article-body-text">{body.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}</div> : null}
              </motion.div>
            </div>
          </section>
        ) : null}
      </div>

      {previewOpen && heroMedia ? (
        <MediaPreviewOverlay
          items={[{ media: heroMedia, title: section.title }]}
          index={0}
          onClose={() => setPreviewOpen(false)}
        />
      ) : null}
    </div>
  );
}
