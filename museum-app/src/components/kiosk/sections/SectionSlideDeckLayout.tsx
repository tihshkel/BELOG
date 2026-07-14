"use client";

import { useRef, useState } from "react";
import { SlideRenderer } from "@/components/slides/SlideRenderer";
import type { MediaPreviewItem } from "@/components/kiosk/media/MediaPreviewOverlay";
import { MediaPreviewOverlay } from "@/components/kiosk/media/MediaPreviewOverlay";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { parseSlideContent, type SlideElement } from "@/lib/slide-content";
import type { ScreenOrientation, Section } from "@/lib/types";
import { SectionHeader } from "./SectionHeader";

interface SectionSlideDeckLayoutProps {
  section: Section;
  orientation: ScreenOrientation;
}

export function SectionSlideDeckLayout({
  section,
  orientation,
}: SectionSlideDeckLayoutProps) {
  const content = parseSlideContent(
    section.contentJson,
    section.contentHtml,
    section.templateType
  );
  const deckRef = useRef<HTMLDivElement>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [preview, setPreview] = useState<MediaPreviewItem | null>(null);
  const isHorizontal = orientation === "horizontal";

  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(content.slides.length - 1, index));
    const page = deckRef.current?.children[next] as HTMLElement | undefined;
    if (!page) return;
    page.scrollIntoView({
      behavior: "smooth",
      block: isHorizontal ? "nearest" : "start",
      inline: isHorizontal ? "start" : "nearest",
    });
    setSlideIndex(next);
  };

  const openMedia = (element: SlideElement) => {
    if (element.type !== "media" || !element.media?.url) return;
    setPreview({ media: element.media });
  };

  const handleDeckScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    if (isHorizontal) {
      if (!target.clientWidth) return;
      setSlideIndex(Math.round(target.scrollLeft / target.clientWidth));
      return;
    }
    if (!target.clientHeight) return;
    setSlideIndex(Math.round(target.scrollTop / target.clientHeight));
  };

  const handlePageTap = (index: number, event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest("button, a, [data-media-open]")) return;
    if (index < content.slides.length - 1) {
      goTo(index + 1);
    }
  };

  const prevIcon = isHorizontal ? "keyboard_arrow_left" : "keyboard_arrow_up";
  const nextIcon = isHorizontal ? "keyboard_arrow_right" : "keyboard_arrow_down";

  return (
    <div className="section-slide-layout">
      <SectionHeader title={section.title} orientation={orientation} />
      <div
        ref={deckRef}
        className={`section-slide-deck section-slide-deck--${orientation}`}
        onScroll={handleDeckScroll}
      >
        {content.slides.map((slide, index) => (
          <section
            key={slide.id}
            className="section-slide-deck__page"
            aria-label={`Слайд ${index + 1}`}
            onClick={(event) => handlePageTap(index, event)}
          >
            <SlideRenderer slide={slide} onOpenMedia={openMedia} />
          </section>
        ))}
      </div>

      {content.slides.length > 1 ? (
        <nav className="section-slide-nav" aria-label="Навигация по слайдам">
          <button
            type="button"
            onClick={() => goTo(slideIndex - 1)}
            disabled={slideIndex === 0}
            aria-label="Предыдущий слайд"
          >
            <MaterialIcon name={prevIcon} size={28} />
          </button>
          <span>
            {slideIndex + 1} / {content.slides.length}
          </span>
          <button
            type="button"
            onClick={() => goTo(slideIndex + 1)}
            disabled={slideIndex === content.slides.length - 1}
            aria-label="Следующий слайд"
          >
            <MaterialIcon name={nextIcon} size={28} />
          </button>
        </nav>
      ) : null}

      {preview ? (
        <MediaPreviewOverlay
          items={[preview]}
          index={0}
          onClose={() => setPreview(null)}
        />
      ) : null}
    </div>
  );
}
