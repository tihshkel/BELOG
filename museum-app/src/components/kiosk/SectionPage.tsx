"use client";

import type { Section, ScreenOrientation } from "@/lib/types";
import { SectionSlideDeckLayout } from "./sections/SectionSlideDeckLayout";

interface SectionPageProps {
  section: Section;
  orientation: ScreenOrientation;
}

export function SectionPage({ section, orientation }: SectionPageProps) {
  return (
    <SectionSlideDeckLayout section={section} orientation={orientation} />
  );
}
