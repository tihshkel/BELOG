"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface PhotoLightboxProps {
  images: { url: string; caption: string }[];
  index: number;
  onClose: () => void;
  onChange: (index: number) => void;
}

export function PhotoLightbox({ images, index, onClose, onChange }: PhotoLightboxProps) {
  const hasPrev = index > 0;
  const hasNext = index < images.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) onChange(index - 1);
  }, [hasPrev, index, onChange]);

  const goNext = useCallback(() => {
    if (hasNext) onChange(index + 1);
  }, [hasNext, index, onChange]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, goPrev, goNext]);

  const current = images[index];

  return (
    <AnimatePresence>
      <motion.div
        className="lightbox"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <button
          type="button"
          className="lightbox__close"
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>

        {hasPrev ? (
          <button
            type="button"
            className="lightbox__nav lightbox__nav--prev"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Предыдущее фото"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        ) : null}

        <div className="lightbox__stage" onClick={(e) => e.stopPropagation()}>
          <div className="lightbox__image-wrap">
            <Image
              src={current.url}
              alt={current.caption}
              fill
              sizes="100vw"
              className="lightbox__image"
              priority
            />
          </div>
          {current.caption ? <p className="lightbox__caption">{current.caption}</p> : null}
          <p className="lightbox__counter">
            {index + 1} / {images.length}
          </p>
        </div>

        {hasNext ? (
          <button
            type="button"
            className="lightbox__nav lightbox__nav--next"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Следующее фото"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}
