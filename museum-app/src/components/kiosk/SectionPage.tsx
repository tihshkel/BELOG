"use client";

import type { Section, ScreenOrientation } from "@/lib/types";
import { normalizeTemplateType } from "@/lib/section-content";
import { SectionArticleLayout } from "./sections/SectionArticleLayout";
import { SectionGalleryLayout } from "./sections/SectionGalleryLayout";
import { SectionPhotoStoryLayout } from "./sections/SectionPhotoStoryLayout";
import { SectionTimelineLayout } from "./sections/SectionTimelineLayout";

interface SectionPageProps {
  section: Section;
  orientation: ScreenOrientation;
}

export function SectionPage({ section, orientation }: SectionPageProps) {
  const tpl = normalizeTemplateType(section.templateType);

  switch (tpl) {
    case "photo_story":
      return <SectionPhotoStoryLayout section={section} orientation={orientation} />;
    case "gallery":
      return <SectionGalleryLayout section={section} orientation={orientation} />;
    case "timeline":
      return <SectionTimelineLayout section={section} orientation={orientation} />;
    case "article":
    default:
      return <SectionArticleLayout section={section} orientation={orientation} />;
  }
}
