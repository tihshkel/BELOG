"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { PageTransition } from "./PageTransition";

interface BookNavigatorProps {
  pages: ReactNode[];
  currentPage?: number;
  onPageChange?: (page: number) => void;
  showNextOnFirst?: boolean;
  homePageIndex?: number;
  sectionsPageIndex?: number;
  symbolsPageIndex?: number;
}

export function BookNavigator({
  pages,
  currentPage: controlledPage,
  onPageChange,
  showNextOnFirst = true,
  homePageIndex = 0,
  sectionsPageIndex = 2,
  symbolsPageIndex = 1,
}: BookNavigatorProps) {
  const [internalPage, setInternalPage] = useState(0);
  const currentPage = controlledPage ?? internalPage;
  const prevPageRef = useRef(currentPage);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (controlledPage !== undefined && prevPageRef.current !== controlledPage) {
      setDirection(controlledPage > prevPageRef.current ? 1 : -1);
      prevPageRef.current = controlledPage;
    }
  }, [controlledPage]);

  const setPage = useCallback(
    (page: number, dir: 1 | -1) => {
      setDirection(dir);
      if (onPageChange) onPageChange(page);
      else setInternalPage(page);
    },
    [onPageChange]
  );

  const goForward = useCallback(() => {
    if (currentPage === homePageIndex) {
      setPage(sectionsPageIndex, 1);
      return;
    }
    if (currentPage < pages.length - 1) setPage(currentPage + 1, 1);
  }, [currentPage, homePageIndex, pages.length, sectionsPageIndex, setPage]);

  const goBackward = useCallback(() => {
    if (currentPage > sectionsPageIndex) {
      setPage(sectionsPageIndex, -1);
      return;
    }
    if (currentPage === symbolsPageIndex) {
      setPage(homePageIndex, -1);
      return;
    }
    if (currentPage > homePageIndex) {
      setPage(homePageIndex, -1);
    }
  }, [currentPage, homePageIndex, sectionsPageIndex, symbolsPageIndex, setPage]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    const threshold = Math.max(60, window.innerWidth * 0.05);
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
      if (dx < 0) goForward();
      else goBackward();
    }
    setTouchStart(null);
  };

  const isHomePage = currentPage === homePageIndex;
  const isSymbolsPage = currentPage === symbolsPageIndex;
  const isSectionsPage = currentPage === sectionsPageIndex;
  const isSectionDetailPage = currentPage > sectionsPageIndex;
  const isLastPage = currentPage === pages.length - 1;
  const showForward =
    !isLastPage && (showNextOnFirst || !isHomePage) && !isSectionsPage && !isSymbolsPage;

  return (
    <div
      className="navigator-root relative h-full w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <PageTransition key={currentPage} direction={direction}>
          {pages[currentPage]}
        </PageTransition>
      </AnimatePresence>

      <div
        className={`nav-dock absolute bottom-[clamp(12px,3cqh,24px)] left-1/2 z-30 flex -translate-x-1/2 items-center gap-[clamp(8px,2cqw,14px)] ${
          isHomePage || isSectionsPage || isSymbolsPage ? "nav-dock--home" : ""
        }`}
      >
        {isSymbolsPage ? (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setPage(homePageIndex, -1)}
            className="nav-btn nav-btn--wide"
            aria-label="На главную"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0" style={{ width: "clamp(16px,3.5cqw,20px)", height: "clamp(16px,3.5cqw,20px)" }}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>На главную</span>
          </motion.button>
        ) : null}

        {isSectionsPage ? (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setPage(homePageIndex, -1)}
            className="nav-btn nav-btn--wide"
            aria-label="На главную"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0" style={{ width: "clamp(16px,3.5cqw,20px)", height: "clamp(16px,3.5cqw,20px)" }}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>На главную</span>
          </motion.button>
        ) : null}

        {isSectionDetailPage ? (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setPage(sectionsPageIndex, -1)}
            className="nav-btn"
            aria-label="К разделам"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </motion.button>
        ) : null}

        {showForward ? (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={goForward}
            className={`nav-btn nav-btn--primary ${isHomePage ? "nav-btn--wide" : ""}`}
            aria-label={isHomePage ? "К разделам" : "Далее"}
          >
            {isHomePage ? (
              <>
                <span>К разделам</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0" style={{ width: "clamp(16px,3.5cqw,20px)", height: "clamp(16px,3.5cqw,20px)" }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </motion.button>
        ) : null}
      </div>
    </div>
  );
}
