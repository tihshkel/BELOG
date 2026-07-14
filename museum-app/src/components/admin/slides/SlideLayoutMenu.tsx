"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  SLIDE_LAYOUTS,
  type SlideLayoutId,
} from "@/lib/slide-content";
import type { ScreenOrientation } from "@/lib/types";

interface SlideLayoutMenuProps {
  open: boolean;
  orientation: ScreenOrientation;
  onClose: () => void;
  onSelect: (layoutId: SlideLayoutId) => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}

function LayoutWireframe({
  layoutId,
  orientation,
}: {
  layoutId: SlideLayoutId;
  orientation: ScreenOrientation;
}) {
  const isVertical = orientation === "vertical";

  return (
    <span
      className={`layout-wire layout-wire--${orientation}`}
      data-layout={layoutId}
      aria-hidden
    >
      {layoutId === "blank" ? <span className="layout-wire__blank" /> : null}

      {layoutId === "article" && !isVertical ? (
        <>
          <span className="layout-wire__box layout-wire__box--media" style={{ left: "6%", top: "10%", width: "40%", height: "78%" }} />
          <span className="layout-wire__line layout-wire__line--title" style={{ left: "52%", top: "16%", width: "40%" }} />
          <span className="layout-wire__line" style={{ left: "52%", top: "38%", width: "40%" }} />
          <span className="layout-wire__line" style={{ left: "52%", top: "50%", width: "36%" }} />
          <span className="layout-wire__line" style={{ left: "52%", top: "62%", width: "38%" }} />
        </>
      ) : null}

      {layoutId === "article" && isVertical ? (
        <>
          <span className="layout-wire__box layout-wire__box--media" style={{ left: "8%", top: "6%", width: "84%", height: "40%" }} />
          <span className="layout-wire__line layout-wire__line--title" style={{ left: "8%", top: "52%", width: "84%" }} />
          <span className="layout-wire__line" style={{ left: "8%", top: "66%", width: "84%" }} />
          <span className="layout-wire__line" style={{ left: "8%", top: "76%", width: "70%" }} />
        </>
      ) : null}

      {layoutId === "photo_story" && !isVertical ? (
        <>
          <span className="layout-wire__line layout-wire__line--title" style={{ left: "6%", top: "18%", width: "38%" }} />
          <span className="layout-wire__line" style={{ left: "6%", top: "42%", width: "38%" }} />
          <span className="layout-wire__line" style={{ left: "6%", top: "54%", width: "34%" }} />
          <span className="layout-wire__line" style={{ left: "6%", top: "66%", width: "36%" }} />
          <span className="layout-wire__box layout-wire__box--media" style={{ left: "52%", top: "10%", width: "42%", height: "80%" }} />
        </>
      ) : null}

      {layoutId === "photo_story" && isVertical ? (
        <>
          <span className="layout-wire__box layout-wire__box--media" style={{ left: "8%", top: "5%", width: "84%", height: "46%" }} />
          <span className="layout-wire__line layout-wire__line--title" style={{ left: "8%", top: "56%", width: "84%" }} />
          <span className="layout-wire__line" style={{ left: "8%", top: "70%", width: "84%" }} />
          <span className="layout-wire__line" style={{ left: "8%", top: "80%", width: "68%" }} />
        </>
      ) : null}

      {layoutId === "gallery" ? (
        <>
          <span className="layout-wire__box layout-wire__box--media" style={{ left: "5%", top: isVertical ? "6%" : "8%", width: isVertical ? "44%" : "42%", height: isVertical ? "40%" : "38%" }} />
          <span className="layout-wire__box layout-wire__box--media" style={{ left: isVertical ? "51%" : "53%", top: isVertical ? "6%" : "8%", width: isVertical ? "44%" : "42%", height: isVertical ? "40%" : "38%" }} />
          <span className="layout-wire__box layout-wire__box--media" style={{ left: "5%", top: isVertical ? "52%" : "52%", width: isVertical ? "44%" : "42%", height: isVertical ? "40%" : "38%" }} />
          <span className="layout-wire__box layout-wire__box--media" style={{ left: isVertical ? "51%" : "53%", top: isVertical ? "52%" : "52%", width: isVertical ? "44%" : "42%", height: isVertical ? "40%" : "38%" }} />
        </>
      ) : null}

      {layoutId === "timeline" && !isVertical ? (
        <>
          <span className="layout-wire__line layout-wire__line--year" style={{ left: "6%", top: "18%", width: "22%" }} />
          <span className="layout-wire__line layout-wire__line--title" style={{ left: "34%", top: "18%", width: "56%" }} />
          <span className="layout-wire__line" style={{ left: "34%", top: "42%", width: "56%" }} />
          <span className="layout-wire__line" style={{ left: "34%", top: "54%", width: "48%" }} />
          <span className="layout-wire__box layout-wire__box--media" style={{ left: "6%", top: "48%", width: "22%", height: "36%" }} />
        </>
      ) : null}

      {layoutId === "timeline" && isVertical ? (
        <>
          <span className="layout-wire__line layout-wire__line--year" style={{ left: "8%", top: "6%", width: "50%" }} />
          <span className="layout-wire__line layout-wire__line--title" style={{ left: "8%", top: "20%", width: "84%" }} />
          <span className="layout-wire__box layout-wire__box--media" style={{ left: "8%", top: "34%", width: "84%", height: "32%" }} />
          <span className="layout-wire__line" style={{ left: "8%", top: "72%", width: "84%" }} />
          <span className="layout-wire__line" style={{ left: "8%", top: "82%", width: "70%" }} />
        </>
      ) : null}

      {layoutId === "highlights" ? (
        <>
          <span className="layout-wire__card" style={{ left: "5%", top: isVertical ? "5%" : "7%", width: isVertical ? "44%" : "43%", height: isVertical ? "42%" : "40%" }} />
          <span className="layout-wire__card" style={{ left: isVertical ? "51%" : "52%", top: isVertical ? "5%" : "7%", width: isVertical ? "44%" : "43%", height: isVertical ? "42%" : "40%" }} />
          <span className="layout-wire__card" style={{ left: "5%", top: "52%", width: isVertical ? "44%" : "43%", height: isVertical ? "42%" : "40%" }} />
          <span className="layout-wire__card" style={{ left: isVertical ? "51%" : "52%", top: "52%", width: isVertical ? "44%" : "43%", height: isVertical ? "42%" : "40%" }} />
        </>
      ) : null}
    </span>
  );
}

export function SlideLayoutMenu({
  open,
  orientation,
  onClose,
  onSelect,
  anchorRef,
}: SlideLayoutMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }

    const update = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const menuWidth = Math.min(440, window.innerWidth - 24);
      const menuHeight = Math.min(520, window.innerHeight - 24);
      let left = rect.right + 10;
      let top = rect.bottom - menuHeight;

      if (left + menuWidth > window.innerWidth - 12) {
        left = Math.max(12, rect.left - menuWidth - 10);
      }
      if (top < 12) top = 12;
      if (top + menuHeight > window.innerHeight - 12) {
        top = Math.max(12, window.innerHeight - menuHeight - 12);
      }

      setCoords({ top, left });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const timer = window.setTimeout(() => {
      window.addEventListener("pointerdown", onPointerDown);
    }, 0);

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, anchorRef]);

  if (!open || !coords || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={menuRef}
      className={`slide-layout-menu slide-layout-menu--${orientation}`}
      role="dialog"
      aria-labelledby={titleId}
      style={{ top: coords.top, left: coords.left }}
    >
      <div className="slide-layout-menu__head">
        <h3 id={titleId}>Новый слайд</h3>
        <p>
          {orientation === "vertical"
            ? "Макеты для вертикального экрана"
            : "Выберите макет"}
        </p>
      </div>
      <div className="slide-layout-menu__grid">
        {SLIDE_LAYOUTS.map((layout) => (
          <button
            key={layout.id}
            type="button"
            className="slide-layout-menu__card"
            onClick={() => {
              onSelect(layout.id);
              onClose();
            }}
          >
            <LayoutWireframe layoutId={layout.id} orientation={orientation} />
            <strong>{layout.label}</strong>
            <span className="slide-layout-menu__hint">{layout.description}</span>
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
}
