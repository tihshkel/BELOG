"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import type { MediaRef } from "@/lib/media";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

interface PresentationViewerProps {
  media: MediaRef;
}

export function PresentationViewer({ media }: PresentationViewerProps) {
  const slides = media.slides ?? [];
  const [index, setIndex] = useState(0);
  const current = slides[index];

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(slides.length - 1, i + 1));
  }, [slides.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  if (!current) {
    return <p className="media-preview__error">Слайды презентации недоступны</p>;
  }

  return (
    <div className="media-preview__presentation">
      <div className="presentation-viewer__stage">
        <Image
          src={current.url}
          alt={`Слайд ${index + 1}`}
          fill
          sizes="100vw"
          className="presentation-viewer__slide"
          unoptimized
          priority
        />
      </div>

      {slides.length > 1 ? (
        <>
          <button
            type="button"
            className="media-preview__nav-btn media-preview__nav-btn--side media-preview__nav-btn--prev"
            onClick={goPrev}
            disabled={index <= 0}
            aria-label="Предыдущий слайд"
          >
            <MaterialIcon name="chevron_left" size={40} />
          </button>
          <button
            type="button"
            className="media-preview__nav-btn media-preview__nav-btn--side media-preview__nav-btn--next"
            onClick={goNext}
            disabled={index >= slides.length - 1}
            aria-label="Следующий слайд"
          >
            <MaterialIcon name="chevron_right" size={40} />
          </button>
          <p className="media-preview__counter presentation-viewer__counter">
            {index + 1} / {slides.length}
          </p>
        </>
      ) : null}
    </div>
  );
}
