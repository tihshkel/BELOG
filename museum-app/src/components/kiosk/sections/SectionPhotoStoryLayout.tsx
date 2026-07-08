"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { ScreenOrientation, Section } from "@/lib/types";
import { imageSizeClass, parseContent } from "@/lib/section-content";
import { SectionHeader } from "./SectionHeader";

interface SectionPhotoStoryLayoutProps {
  section: Section;
  orientation: ScreenOrientation;
}

export function SectionPhotoStoryLayout({ section, orientation }: SectionPhotoStoryLayoutProps) {
  const isHorizontal = orientation === "horizontal";
  const content = parseContent(section.contentJson, section.contentHtml, "photo_story");
  const stories = content.stories ?? [];

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
            const hasImage = Boolean(story.imageUrl);

            return (
              <article
                key={story.id}
                className={`story-card story-card--${side} ${hasImage ? imageSizeClass(story.imageSize, "story-card") : "story-card--text-only"}`}
              >
                {hasImage && story.imageUrl ? (
                  <div className={`story-card__visual ${imageSizeClass(story.imageSize, "story-card__visual")}`}>
                    <Image
                      src={story.imageUrl}
                      alt={story.title}
                      fill
                      sizes={isHorizontal ? "45vw" : "100vw"}
                      className="story-card__img"
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
    </div>
  );
}
