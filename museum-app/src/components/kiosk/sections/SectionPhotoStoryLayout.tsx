"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ScreenOrientation, Section } from "@/lib/types";
import { imageSizeClass, mediaRefFromUrl, parseContent } from "@/lib/section-content";
import { SectionHeader } from "./SectionHeader";
import { MediaTile } from "../media/MediaTile";
import { MediaPreviewOverlay } from "../media/MediaPreviewOverlay";

interface SectionPhotoStoryLayoutProps {
  section: Section;
  orientation: ScreenOrientation;
}

export function SectionPhotoStoryLayout({ section, orientation }: SectionPhotoStoryLayoutProps) {
  const isHorizontal = orientation === "horizontal";
  const content = parseContent(section.contentJson, section.contentHtml, "photo_story");
  const stories = content.stories ?? [];
  const [previewId, setPreviewId] = useState<string | null>(null);

  const previewStory = stories.find((s) => s.id === previewId);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-transparent">
      <SectionHeader title={section.title} orientation={orientation} />

      <div className="story-layout flex-1 min-h-0 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className={`story-layout__inner ${isHorizontal ? "story-layout__inner--horizontal" : "story-layout__inner--vertical"}`}
        >
          {stories.map((story, index) => {
            const side = index % 2 === 0 ? "left" : "right";
            const hasMedia = Boolean(story.media?.url);

            return (
              <article
                key={story.id}
                className={`story-card story-card--${side} ${hasMedia ? imageSizeClass(story.imageSize, "story-card") : "story-card--text-only"}`}
              >
                {hasMedia ? (
                  <div className={`story-card__visual ${imageSizeClass(story.imageSize, "story-card__visual")}`}>
                    <MediaTile
                      media={story.media ?? mediaRefFromUrl("")}
                      title={story.title}
                      className="story-card__media-tile"
                      sizes={isHorizontal ? "45vw" : "100vw"}
                      onClick={() => setPreviewId(story.id)}
                      asButton
                    />
                  </div>
                ) : null}

                <div className="story-card__content">
                  {story.title ? <h2 className="story-card__title">{story.title}</h2> : null}
                  {story.text ? (
                    <div className="story-card__text">
                      {story.text.split("\n\n").map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </motion.div>
      </div>

      {previewStory?.media?.url ? (
        <MediaPreviewOverlay
          items={[{ media: previewStory.media, title: previewStory.title }]}
          index={0}
          onClose={() => setPreviewId(null)}
        />
      ) : null}
    </div>
  );
}
