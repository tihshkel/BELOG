"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import type { HomeContent, ScreenOrientation } from "@/lib/types";
import { getDisplayBgSrc } from "@/lib/screen-specs";
import { HotspotSymbol } from "./HotspotSymbol";

interface HotspotOverlayProps {
  orientation: ScreenOrientation;
  content: HomeContent | null;
  onClose: () => void;
}

export function HotspotOverlay({ orientation, content, onClose }: HotspotOverlayProps) {
  if (!content) return null;

  const isHorizontal = orientation === "horizontal";
  const displayBg = getDisplayBgSrc(orientation);
  const hasMedia = Boolean(content.mediaUrl);
  const layoutClass = [
    "content-layout",
    isHorizontal ? "content-layout--horizontal" : "content-layout--vertical",
    !hasMedia ? "content-layout--text-only" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={content.hotspotType}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="content-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="content-panel"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.header
            className="content-header"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.35 }}
          >
            <h2 className="content-header__title">{content.title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="content-close"
              aria-label="Закрыть"
            >
              Закрыть
            </button>
          </motion.header>

          <div className="content-body">
            <div className={layoutClass}>
              {hasMedia && (
                <aside className="content-visual">
                  <motion.div
                    className="content-visual__bg-wrap"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Image
                      src={displayBg}
                      alt=""
                      fill
                      sizes={isHorizontal ? "40vw" : "100vw"}
                      className="content-visual__bg"
                    />
                  </motion.div>
                  <div className="content-visual__inner">
                    <HotspotSymbol type={content.hotspotType} src={content.mediaUrl!} />
                  </div>
                </aside>
              )}

              {content.contentHtml && (
                <motion.section
                  className="content-reader"
                  initial={{ opacity: 0, x: 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: hasMedia ? 0.35 : 0.15,
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div className="content-reader__scroll">
                    <motion.div
                      className="content-reader__inner prose-museum prose-museum--overlay"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: hasMedia ? 0.45 : 0.25, duration: 0.4 }}
                      dangerouslySetInnerHTML={{ __html: content.contentHtml }}
                    />
                  </div>
                </motion.section>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
