"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { MediaRef } from "@/lib/media";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { AudioPlayerView } from "./AudioPlayerView";
import { PdfViewer } from "./PdfViewer";
import { PresentationViewer } from "./PresentationViewer";

export interface MediaPreviewItem {
  media: MediaRef;
  title?: string;
  caption?: string;
}

interface MediaPreviewOverlayProps {
  items: MediaPreviewItem[];
  index: number;
  onClose: () => void;
  onChange?: (index: number) => void;
}

export function MediaPreviewOverlay({ items, index, onClose, onChange }: MediaPreviewOverlayProps) {
  const current = items[index];
  const hasPrev = index > 0 && Boolean(onChange);
  const hasNext = index < items.length - 1 && Boolean(onChange);
  const canSwipeGallery = current?.media.kind === "image" && items.length > 1 && Boolean(onChange);

  const goPrev = useCallback(() => {
    if (hasPrev && onChange) onChange(index - 1);
  }, [hasPrev, index, onChange]);

  const goNext = useCallback(() => {
    if (hasNext && onChange) onChange(index + 1);
  }, [hasNext, index, onChange]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (canSwipeGallery) {
        if (e.key === "ArrowLeft") goPrev();
        if (e.key === "ArrowRight") goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, goPrev, goNext, canSwipeGallery]);

  if (!current) return null;

  const label = current.caption || current.title || "";

  return (
    <AnimatePresence>
      <motion.div
        className="media-preview"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <button type="button" className="media-preview__close" onClick={onClose} aria-label="Закрыть">
          <MaterialIcon name="close" size={28} />
        </button>

        {canSwipeGallery && hasPrev ? (
          <button
            type="button"
            className="media-preview__nav-btn media-preview__nav-btn--side media-preview__nav-btn--prev"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Предыдущее"
          >
            <MaterialIcon name="chevron_left" size={40} />
          </button>
        ) : null}

        <div className="media-preview__stage" onClick={(e) => e.stopPropagation()}>
          {current.media.kind === "image" ? (
            <div className="media-preview__image-wrap">
              <Image
                src={current.media.url}
                alt={label}
                fill
                sizes="100vw"
                className="media-preview__image"
                priority
              />
            </div>
          ) : null}

          {current.media.kind === "video" ? (
            <video
              className="media-preview__video"
              src={current.media.url}
              controls
              playsInline
              autoPlay
              poster={current.media.posterUrl}
            />
          ) : null}

          {current.media.kind === "audio" ? (
            <AudioPlayerView media={current.media} title={current.title || label} />
          ) : null}

          {current.media.kind === "pdf" ? <PdfViewer url={current.media.url} /> : null}

          {current.media.kind === "presentation" ? <PresentationViewer media={current.media} /> : null}

          {label ? <p className="media-preview__caption">{label}</p> : null}

          {canSwipeGallery ? (
            <p className="media-preview__counter">
              {index + 1} / {items.length}
            </p>
          ) : null}
        </div>

        {canSwipeGallery && hasNext ? (
          <button
            type="button"
            className="media-preview__nav-btn media-preview__nav-btn--side media-preview__nav-btn--next"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Следующее"
          >
            <MaterialIcon name="chevron_right" size={40} />
          </button>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}
