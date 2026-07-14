"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import type { HomeContent, ScreenOrientation, StateSymbolType } from "@/lib/types";
import { parseStoredMediaValue } from "@/lib/media";
import { getDisplayBgSrc } from "@/lib/screen-specs";
import { HotspotSymbol } from "./HotspotSymbol";
import { MediaTile } from "./media/MediaTile";
import { MediaPreviewOverlay } from "./media/MediaPreviewOverlay";

const STATE_SYMBOL_TYPES: StateSymbolType[] = ["flag", "emblem", "anthem"];

function isStateSymbol(hotspotType: string): boolean {
  return STATE_SYMBOL_TYPES.includes(hotspotType as StateSymbolType);
}

interface HotspotOverlayProps {
  orientation: ScreenOrientation;
  content: HomeContent | null;
  onClose: () => void;
  simple?: boolean;
}

export function HotspotOverlay({
  orientation,
  content,
  onClose,
  simple: simpleProp,
}: HotspotOverlayProps) {
  const [audioPreview, setAudioPreview] = useState(false);

  if (!content) return null;

  const simple = simpleProp ?? isStateSymbol(content.hotspotType);
  const isHorizontal = orientation === "horizontal";
  const displayBg = getDisplayBgSrc(orientation);
  const media = parseStoredMediaValue(content.mediaUrl);
  const hasMedia = Boolean(media?.url);
  const isAudio = media?.kind === "audio";
  const layoutClass = [
    "content-layout",
    isHorizontal ? "content-layout--horizontal" : "content-layout--vertical",
    !hasMedia ? "content-layout--text-only" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const fadeTransition = { duration: 0.2, ease: "easeOut" as const };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={content.hotspotType}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={fadeTransition}
        className={`content-overlay${simple ? " content-overlay--simple" : ""}`}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, ...(simple ? {} : { y: 20 }) }}
          animate={{ opacity: 1, ...(simple ? {} : { y: 0 }) }}
          exit={{ opacity: 0, ...(simple ? {} : { y: 16 }) }}
          transition={simple ? fadeTransition : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="content-panel"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="content-header">
            <h2 className="content-header__title">{content.title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="content-close"
              aria-label="Закрыть"
            >
              Закрыть
            </button>
          </header>

          <div className="content-body">
            <div className={layoutClass}>
              {hasMedia && media ? (
                <aside className="content-visual">
                  <div className="content-visual__bg-wrap">
                    <Image
                      src={displayBg}
                      alt=""
                      fill
                      sizes={isHorizontal ? "40vw" : "100vw"}
                      className="content-visual__bg"
                    />
                  </div>
                  <div className="content-visual__inner">
                    {isAudio ? (
                      <MediaTile
                        media={media}
                        title={content.title ?? undefined}
                        className="content-visual__audio-tile"
                        onClick={() => setAudioPreview(true)}
                        asButton
                      />
                    ) : (
                      <HotspotSymbol
                        type={content.hotspotType}
                        src={media.url}
                        simple={simple}
                      />
                    )}
                  </div>
                </aside>
              ) : null}

              {content.contentHtml && (
                <section className="content-reader">
                  <div className="content-reader__scroll">
                    <div
                      className="content-reader__inner prose-museum prose-museum--overlay"
                      dangerouslySetInnerHTML={{ __html: content.contentHtml }}
                    />
                  </div>
                </section>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {audioPreview && media ? (
        <MediaPreviewOverlay
          items={[{ media, title: content.title ?? undefined }]}
          index={0}
          onClose={() => setAudioPreview(false)}
        />
      ) : null}
    </AnimatePresence>
  );
}
