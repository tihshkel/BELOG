"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { MediaTile } from "@/components/kiosk/media/MediaTile";
import type { Slide, SlideElement } from "@/lib/slide-content";
import type { ResizeCorner } from "@/lib/slide-snap";

interface SlideRendererProps {
  slide: Slide;
  selectedId?: string | null;
  editingTextId?: string | null;
  editable?: boolean;
  interactive?: boolean;
  /** Compact empty placeholders for thumbs / layout picker. */
  schematic?: boolean;
  onSelect?: (id: string | null) => void;
  onPointerDown?: (
    event: ReactPointerEvent<HTMLElement>,
    element: SlideElement,
    action: "move" | "resize",
    corner?: ResizeCorner
  ) => void;
  onDoubleClick?: (element: SlideElement) => void;
  onTextChange?: (id: string, text: string) => void;
  onTextEditEnd?: () => void;
  onOpenMedia?: (element: SlideElement) => void;
  className?: string;
}

const RESIZE_CORNERS: ResizeCorner[] = ["nw", "ne", "sw", "se"];

function elementStyle(element: SlideElement, index: number): CSSProperties {
  return {
    left: `${element.x}%`,
    top: `${element.y}%`,
    width: `${element.w}%`,
    height: `${element.h}%`,
    zIndex: index + 1,
  };
}

export function SlideRenderer({
  slide,
  selectedId,
  editingTextId,
  editable = false,
  interactive = !editable,
  schematic = false,
  onSelect,
  onPointerDown,
  onDoubleClick,
  onTextChange,
  onTextEditEnd,
  onOpenMedia,
  className = "",
}: SlideRendererProps) {
  return (
    <div
      className={`slide-renderer ${editable ? "slide-renderer--editable" : ""} ${schematic ? "slide-renderer--schematic" : ""} ${className}`}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onSelect?.(null);
      }}
    >
      {slide.elements.map((element, index) => {
        const selected = element.id === selectedId;
        const isEditingText =
          editable && element.type === "text" && element.id === editingTextId;

        return (
          <div
            key={element.id}
            className={`slide-element slide-element--${element.type}${selected ? " slide-element--selected" : ""}${isEditingText ? " slide-element--editing" : ""}`}
            style={elementStyle(element, index)}
            onPointerDown={(event) => {
              if (!editable || isEditingText) return;
              event.stopPropagation();
              onSelect?.(element.id);
              onPointerDown?.(event, element, "move");
            }}
            onDoubleClick={(event) => {
              if (!editable) return;
              event.stopPropagation();
              onDoubleClick?.(element);
            }}
          >
            {element.type === "text" ? (
              isEditingText ? (
                <textarea
                  className="slide-element__text slide-element__text-editor"
                  autoFocus
                  value={element.text}
                  style={{
                    fontFamily: element.fontFamily,
                    fontSize: `${element.fontSize}cqw`,
                    color: element.color,
                    textAlign: element.align,
                    fontWeight: element.bold ? 700 : 400,
                    fontStyle: element.italic ? "italic" : "normal",
                  }}
                  onChange={(event) =>
                    onTextChange?.(element.id, event.target.value)
                  }
                  onBlur={() => onTextEditEnd?.()}
                  onPointerDown={(event) => event.stopPropagation()}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      event.preventDefault();
                      onTextEditEnd?.();
                    }
                  }}
                />
              ) : (
                <div
                  className="slide-element__text"
                  style={{
                    fontFamily: element.fontFamily,
                    fontSize: `${element.fontSize}cqw`,
                    color: element.color,
                    textAlign: element.align,
                    fontWeight: element.bold ? 700 : 400,
                    fontStyle: element.italic ? "italic" : "normal",
                  }}
                >
                  {element.text}
                </div>
              )
            ) : null}

            {element.type === "rect" ? (
              <div
                className="slide-element__rect"
                style={{
                  background: element.fill,
                  opacity: element.opacity ?? 1,
                }}
              />
            ) : null}

            {element.type === "media" ? (
              element.media?.url && !schematic ? (
                <MediaTile
                  media={element.media}
                  className="slide-element__media"
                  sizes="60vw"
                  asButton={!editable && Boolean(onOpenMedia)}
                  openControl={editable && Boolean(onOpenMedia)}
                  onClick={onOpenMedia ? () => onOpenMedia(element) : undefined}
                />
              ) : (
                <div
                  className={`slide-element__media-empty${schematic ? " slide-element__media-empty--schematic" : ""}`}
                >
                  {schematic ? null : (
                    <>
                      <MaterialIcon name="add_photo_alternate" size={36} />
                      <span>Добавьте медиа</span>
                    </>
                  )}
                </div>
              )
            ) : null}

            {editable && selected && !isEditingText
              ? RESIZE_CORNERS.map((corner) => (
                  <button
                    key={corner}
                    type="button"
                    className={`slide-element__resize slide-element__resize--${corner}`}
                    aria-label={`Изменить размер (${corner})`}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      onPointerDown?.(event, element, "resize", corner);
                    }}
                  />
                ))
              : null}
          </div>
        );
      })}
    </div>
  );
}
