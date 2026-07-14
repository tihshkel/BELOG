"use client";

import { useEffect, useRef, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { SlideRenderer } from "@/components/slides/SlideRenderer";
import {
  createMediaElement,
  createRectElement,
  createSlideFromLayout,
  createTextElement,
  duplicateSlideElement,
  type SectionContentV3,
  type Slide,
  type SlideElement,
  type SlideLayoutId,
  type SlideTextElement,
} from "@/lib/slide-content";
import {
  DEFAULT_PROJECT_THEME,
  PROJECT_FONT_OPTIONS,
  type ProjectTheme,
} from "@/lib/project-theme";
import type { ScreenOrientation } from "@/lib/types";
import { getScreenSpec } from "@/lib/screen-specs";
import {
  clamp,
  resizeFromCorner,
  snapMove,
  type ResizeCorner,
} from "@/lib/slide-snap";
import { MediaUploadZone } from "../MediaUploadZone";
import type { MediaPreviewItem } from "@/components/kiosk/media/MediaPreviewOverlay";
import { MediaPreviewOverlay } from "@/components/kiosk/media/MediaPreviewOverlay";
import { SlideLayoutMenu } from "./SlideLayoutMenu";

interface SlideCanvasProps {
  content: SectionContentV3;
  orientation: ScreenOrientation;
  onChange: (content: SectionContentV3) => void;
}

interface DragState {
  elementId: string;
  action: "move" | "resize";
  corner?: ResizeCorner;
  startX: number;
  startY: number;
  initial: SlideElement;
  bounds: DOMRect;
  keepAspect: boolean;
  others: Pick<SlideElement, "x" | "y" | "w" | "h">[];
}

const HISTORY_LIMIT = 50;
const NUDGE = 1;

function cloneContent(content: SectionContentV3): SectionContentV3 {
  return structuredClone(content);
}

export function SlideCanvas({
  content,
  orientation,
  onChange,
}: SlideCanvasProps) {
  const spec = getScreenSpec(orientation);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const contentRef = useRef(content);
  const liveContentRef = useRef(content);
  const slideIndexRef = useRef(0);
  const onChangeRef = useRef(onChange);
  const selectedIdRef = useRef<string | null>(null);
  const editingTextIdRef = useRef<string | null>(null);
  const historyRef = useRef<SectionContentV3[]>([cloneContent(content)]);
  const historyIndexRef = useRef(0);
  const applyingHistoryRef = useRef(false);
  const dragStartedRef = useRef(false);

  const [theme, setTheme] = useState<ProjectTheme>(DEFAULT_PROJECT_THEME);
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [layoutMenuOpen, setLayoutMenuOpen] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [mediaPreview, setMediaPreview] = useState<MediaPreviewItem | null>(null);
  const addSlideBtnRef = useRef<HTMLButtonElement>(null);

  contentRef.current = content;
  if (!dragRef.current && !editingTextId) {
    liveContentRef.current = content;
  }
  slideIndexRef.current = slideIndex;
  onChangeRef.current = onChange;
  selectedIdRef.current = selectedId;
  editingTextIdRef.current = editingTextId;

  const currentSlide = content.slides[slideIndex] ?? content.slides[0];
  const selectedElement = currentSlide?.elements.find(
    (element) => element.id === selectedId
  );

  const commitContent = (next: SectionContentV3, options?: { recordHistory?: boolean }) => {
    const recordHistory = options?.recordHistory !== false;
    liveContentRef.current = next;
    if (recordHistory && !applyingHistoryRef.current) {
      const stack = historyRef.current.slice(0, historyIndexRef.current + 1);
      stack.push(cloneContent(next));
      if (stack.length > HISTORY_LIMIT) stack.shift();
      historyRef.current = stack;
      historyIndexRef.current = stack.length - 1;
    }
    onChange(next);
  };

  useEffect(() => {
    void fetch("/api/theme")
      .then((response) => (response.ok ? response.json() : DEFAULT_PROJECT_THEME))
      .then((value: ProjectTheme) => setTheme(value))
      .catch(() => setTheme(DEFAULT_PROJECT_THEME));
  }, []);

  useEffect(() => {
    if (slideIndex >= content.slides.length) {
      setSlideIndex(Math.max(0, content.slides.length - 1));
    }
  }, [content.slides.length, slideIndex]);

  const updateSlide = (slide: Slide, options?: { recordHistory?: boolean }) => {
    commitContent(
      {
        ...liveContentRef.current,
        slides: liveContentRef.current.slides.map((item, index) =>
          index === slideIndexRef.current ? slide : item
        ),
      },
      options
    );
  };

  const updateElement = (
    id: string,
    patch: Partial<SlideElement>,
    options?: { recordHistory?: boolean }
  ) => {
    const slide = liveContentRef.current.slides[slideIndexRef.current];
    if (!slide) return;
    updateSlide(
      {
        ...slide,
        elements: slide.elements.map((element) =>
          element.id === id ? ({ ...element, ...patch } as SlideElement) : element
        ),
      },
      options
    );
  };

  const addElement = (element: SlideElement) => {
    const slide = liveContentRef.current.slides[slideIndexRef.current];
    if (!slide) return;
    updateSlide({ ...slide, elements: [...slide.elements, element] });
    setSelectedId(element.id);
    setEditingTextId(null);
  };

  const deleteSelected = () => {
    const slide = liveContentRef.current.slides[slideIndexRef.current];
    const id = selectedIdRef.current;
    if (!slide || !id || editingTextIdRef.current) return;
    updateSlide({
      ...slide,
      elements: slide.elements.filter((element) => element.id !== id),
    });
    setSelectedId(null);
  };

  const duplicateSelected = () => {
    const slide = liveContentRef.current.slides[slideIndexRef.current];
    const id = selectedIdRef.current;
    if (!slide || !id) return;
    const source = slide.elements.find((element) => element.id === id);
    if (!source) return;
    const copy = duplicateSlideElement(source);
    updateSlide({ ...slide, elements: [...slide.elements, copy] });
    setSelectedId(copy.id);
  };

  const moveLayer = (direction: -1 | 1) => {
    const slide = liveContentRef.current.slides[slideIndexRef.current];
    const id = selectedIdRef.current;
    if (!slide || !id) return;
    const elements = [...slide.elements];
    const index = elements.findIndex((element) => element.id === id);
    const target = clamp(index + direction, 0, elements.length - 1);
    if (target === index) return;
    [elements[index], elements[target]] = [elements[target], elements[index]];
    updateSlide({ ...slide, elements });
  };

  const bringToFront = () => {
    const slide = liveContentRef.current.slides[slideIndexRef.current];
    const id = selectedIdRef.current;
    if (!slide || !id) return;
    const element = slide.elements.find((item) => item.id === id);
    if (!element) return;
    updateSlide({
      ...slide,
      elements: [...slide.elements.filter((item) => item.id !== id), element],
    });
  };

  const sendToBack = () => {
    const slide = liveContentRef.current.slides[slideIndexRef.current];
    const id = selectedIdRef.current;
    if (!slide || !id) return;
    const element = slide.elements.find((item) => item.id === id);
    if (!element) return;
    updateSlide({
      ...slide,
      elements: [element, ...slide.elements.filter((item) => item.id !== id)],
    });
  };

  const nudgeSelected = (dx: number, dy: number) => {
    const slide = liveContentRef.current.slides[slideIndexRef.current];
    const id = selectedIdRef.current;
    if (!slide || !id || editingTextIdRef.current) return;
    const element = slide.elements.find((item) => item.id === id);
    if (!element) return;
    updateElement(id, {
      x: clamp(element.x + dx, 0, 100 - element.w),
      y: clamp(element.y + dy, 0, 100 - element.h),
    });
  };

  const undo = () => {
    if (historyIndexRef.current <= 0) return;
    applyingHistoryRef.current = true;
    historyIndexRef.current -= 1;
    const next = cloneContent(historyRef.current[historyIndexRef.current]);
    liveContentRef.current = next;
    onChangeRef.current(next);
    applyingHistoryRef.current = false;
  };

  const redo = () => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    applyingHistoryRef.current = true;
    historyIndexRef.current += 1;
    const next = cloneContent(historyRef.current[historyIndexRef.current]);
    liveContentRef.current = next;
    onChangeRef.current(next);
    applyingHistoryRef.current = false;
  };

  const startDrag = (
    event: React.PointerEvent<HTMLElement>,
    element: SlideElement,
    action: "move" | "resize",
    corner?: ResizeCorner
  ) => {
    if (editingTextIdRef.current) return;
    const bounds = stageRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const slide = liveContentRef.current.slides[slideIndexRef.current];
    dragStartedRef.current = false;
    dragRef.current = {
      elementId: element.id,
      action,
      corner: corner ?? "se",
      startX: event.clientX,
      startY: event.clientY,
      initial: element,
      bounds,
      keepAspect: event.shiftKey && element.type === "media",
      others:
        slide?.elements
          .filter((item) => item.id !== element.id)
          .map(({ x, y, w, h }) => ({ x, y, w, h })) ?? [],
    };
  };

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      dragStartedRef.current = true;
      const dx = ((event.clientX - drag.startX) / drag.bounds.width) * 100;
      const dy = ((event.clientY - drag.startY) / drag.bounds.height) * 100;
      const current = liveContentRef.current;
      const index = slideIndexRef.current;
      const slide = current.slides[index];
      if (!slide) return;

      const keepAspect =
        drag.keepAspect || (event.shiftKey && drag.initial.type === "media");

      const patch =
        drag.action === "move"
          ? snapMove(
              {
                x: drag.initial.x + dx,
                y: drag.initial.y + dy,
                w: drag.initial.w,
                h: drag.initial.h,
              },
              drag.others
            )
          : resizeFromCorner({
              initial: drag.initial,
              corner: drag.corner ?? "se",
              dx,
              dy,
              keepAspect,
            });

      const next = {
        ...current,
        slides: current.slides.map((item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                elements: item.elements.map((element) =>
                  element.id === drag.elementId
                    ? ({ ...element, ...patch } as SlideElement)
                    : element
                ),
              }
            : item
        ),
      };
      liveContentRef.current = next;
      onChangeRef.current(next);
    };

    const handleUp = () => {
      if (dragRef.current && dragStartedRef.current) {
        commitContent(liveContentRef.current);
      }
      dragRef.current = null;
      dragStartedRef.current = false;
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
    // commitContent is stable enough via refs; intentional empty deps for listeners
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target.isContentEditable
      );
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target) && event.key !== "Escape") return;
      if (editingTextIdRef.current && event.key !== "Escape") return;

      const meta = event.metaKey || event.ctrlKey;

      if (meta && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if (meta && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
        return;
      }
      if (meta && event.key.toLowerCase() === "d") {
        event.preventDefault();
        duplicateSelected();
        return;
      }
      if (event.key === "Escape") {
        if (editingTextIdRef.current) {
          setEditingTextId(null);
          return;
        }
        setSelectedId(null);
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        if (!selectedIdRef.current) return;
        event.preventDefault();
        deleteSelected();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        nudgeSelected(event.shiftKey ? -NUDGE * 5 : -NUDGE, 0);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        nudgeSelected(event.shiftKey ? NUDGE * 5 : NUDGE, 0);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        nudgeSelected(0, event.shiftKey ? -NUDGE * 5 : -NUDGE);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        nudgeSelected(0, event.shiftKey ? NUDGE * 5 : NUDGE);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addSlideFromLayout = (layoutId: SlideLayoutId) => {
    const next = createSlideFromLayout(layoutId, orientation);
    const slides = [...content.slides, next];
    commitContent({ ...content, slides });
    setSlideIndex(slides.length - 1);
    setSelectedId(null);
    setEditingTextId(null);
  };

  const duplicateSlide = () => {
    if (!currentSlide) return;
    const copy: Slide = {
      id: crypto.randomUUID(),
      elements: currentSlide.elements.map((element) => ({
        ...element,
        id: crypto.randomUUID(),
      })),
    };
    const slides = [...content.slides];
    slides.splice(slideIndex + 1, 0, copy);
    commitContent({ ...content, slides });
    setSlideIndex(slideIndex + 1);
  };

  const removeSlide = () => {
    if (content.slides.length <= 1) return;
    commitContent({
      ...content,
      slides: content.slides.filter((_, index) => index !== slideIndex),
    });
    setSlideIndex(Math.max(0, slideIndex - 1));
    setSelectedId(null);
  };

  const reorderSlides = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const slides = [...content.slides];
    const [moved] = slides.splice(fromIndex, 1);
    slides.splice(toIndex, 0, moved);
    commitContent({ ...content, slides });
    setSlideIndex(toIndex);
  };

  if (!currentSlide) return null;

  return (
    <div className="slide-editor">
      <div className="slide-editor__toolbar">
        <button type="button" onClick={() => addElement(createTextElement())}>
          <MaterialIcon name="title" size={20} />
          Текст
        </button>
        <button type="button" onClick={() => addElement(createMediaElement())}>
          <MaterialIcon name="perm_media" size={20} />
          Медиа
        </button>
        <button type="button" onClick={() => addElement(createRectElement())}>
          <MaterialIcon name="rectangle" size={20} />
          Фигура
        </button>
        <span className="slide-editor__toolbar-separator" />
        <button type="button" disabled={!selectedId} onClick={sendToBack} title="На задний план">
          Назад
        </button>
        <button type="button" disabled={!selectedId} onClick={() => moveLayer(-1)}>
          −1
        </button>
        <button type="button" disabled={!selectedId} onClick={() => moveLayer(1)}>
          +1
        </button>
        <button type="button" disabled={!selectedId} onClick={bringToFront} title="На передний план">
          Вперёд
        </button>
        <button type="button" disabled={!selectedId} onClick={duplicateSelected} title="⌘/Ctrl+D">
          Дублировать
        </button>
        <button
          type="button"
          className="slide-editor__danger"
          disabled={!selectedId}
          onClick={deleteSelected}
        >
          Удалить
        </button>
        <span className="slide-editor__toolbar-separator" />
        <button type="button" onClick={undo} title="⌘/Ctrl+Z">
          Отменить
        </button>
        <button type="button" onClick={redo} title="⌘/Ctrl+Shift+Z">
          Повторить
        </button>
      </div>

      <div className="slide-editor__workspace">
        <aside className="slide-editor__slides">
          {content.slides.map((item, index) => (
            <button
              key={item.id}
              type="button"
              draggable
              className={`slide-editor__thumb${index === slideIndex ? " slide-editor__thumb--active" : ""}${dragOverIndex === index ? " slide-editor__thumb--drop" : ""}`}
              onClick={() => {
                setSlideIndex(index);
                setSelectedId(null);
                setEditingTextId(null);
              }}
              onDragStart={(event) => {
                event.dataTransfer.setData("text/slide-index", String(index));
                event.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOverIndex(index);
              }}
              onDragLeave={() => setDragOverIndex(null)}
              onDrop={(event) => {
                event.preventDefault();
                const from = Number(event.dataTransfer.getData("text/slide-index"));
                setDragOverIndex(null);
                if (Number.isFinite(from)) reorderSlides(from, index);
              }}
            >
              <span>{index + 1}</span>
              <SlideRenderer
                slide={item}
                interactive={false}
                className={`slide-editor__thumb-stage slide-editor__thumb-stage--${orientation}`}
              />
            </button>
          ))}
          <div className="slide-editor__add-wrap">
            <button
              ref={addSlideBtnRef}
              type="button"
              className="slide-editor__add-slide"
              aria-expanded={layoutMenuOpen}
              onClick={() => setLayoutMenuOpen((open) => !open)}
            >
              + Слайд
            </button>
            <SlideLayoutMenu
              open={layoutMenuOpen}
              orientation={orientation}
              anchorRef={addSlideBtnRef}
              onClose={() => setLayoutMenuOpen(false)}
              onSelect={addSlideFromLayout}
            />
          </div>
        </aside>

        <main className="slide-editor__main">
          <div className="slide-editor__stage-frame">
            <div
              ref={stageRef}
              className={`slide-editor__stage slide-editor__stage--${orientation}`}
              style={{
                ["--stage-ar" as string]: String(spec.aspectRatio),
                aspectRatio: `${spec.widthMm} / ${spec.heightMm}`,
                backgroundImage: `url(${
                  orientation === "horizontal"
                    ? theme.backgroundHorizontal
                    : theme.backgroundVertical
                })`,
              }}
            >
              <SlideRenderer
                slide={currentSlide}
                editable
                selectedId={selectedId}
                editingTextId={editingTextId}
                onSelect={(id) => {
                  setSelectedId(id);
                  if (id !== editingTextId) setEditingTextId(null);
                }}
                onPointerDown={startDrag}
                onOpenMedia={(element) => {
                  if (element.type !== "media" || !element.media?.url) return;
                  setMediaPreview({ media: element.media });
                }}
                onDoubleClick={(element) => {
                  if (element.type === "text") {
                    setSelectedId(element.id);
                    setEditingTextId(element.id);
                  }
                }}
                onTextChange={(id, text) =>
                  updateElement(id, { text }, { recordHistory: false })
                }
                onTextEditEnd={() => {
                  setEditingTextId(null);
                  commitContent(liveContentRef.current);
                }}
              />
            </div>
          </div>
          <div className="slide-editor__slide-actions">
            <button type="button" className="admin-btn-text" onClick={duplicateSlide}>
              Дублировать слайд
            </button>
            <button
              type="button"
              className="admin-btn-text admin-btn-text--danger"
              disabled={content.slides.length <= 1}
              onClick={removeSlide}
            >
              Удалить слайд
            </button>
          </div>
        </main>

        <aside className="slide-editor__properties">
          <h3>Свойства</h3>
          {!selectedElement ? (
            <p>Выберите элемент на слайде</p>
          ) : (
            <>
              {selectedElement.type === "text" ? (
                <TextProperties
                  element={selectedElement}
                  colors={theme.colors}
                  onChange={(patch) => updateElement(selectedElement.id, patch)}
                />
              ) : null}
              <GeometryProperties
                element={selectedElement}
                onChange={(patch) => updateElement(selectedElement.id, patch)}
              />
              {selectedElement.type === "media" ? (
                <MediaUploadZone
                  label="Медиа"
                  value={selectedElement.media}
                  onChange={(media) =>
                    updateElement(selectedElement.id, { media })
                  }
                />
              ) : null}
              {selectedElement.type === "rect" ? (
                <>
                  <label className="admin-field">
                    <span className="admin-label">Цвет фигуры</span>
                    <input
                      type="color"
                      value={selectedElement.fill}
                      onChange={(event) =>
                        updateElement(selectedElement.id, {
                          fill: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="admin-field">
                    <span className="admin-label">Прозрачность</span>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={selectedElement.opacity ?? 1}
                      onChange={(event) =>
                        updateElement(selectedElement.id, {
                          opacity: Number(event.target.value),
                        })
                      }
                    />
                  </label>
                </>
              ) : null}
            </>
          )}
        </aside>
      </div>

      {mediaPreview ? (
        <MediaPreviewOverlay
          items={[mediaPreview]}
          index={0}
          onClose={() => setMediaPreview(null)}
        />
      ) : null}
    </div>
  );
}

function GeometryProperties({
  element,
  onChange,
}: {
  element: SlideElement;
  onChange: (patch: Partial<SlideElement>) => void;
}) {
  const setNumber = (key: "x" | "y" | "w" | "h", raw: string) => {
    const value = Number(raw);
    if (!Number.isFinite(value)) return;
    if (key === "x") onChange({ x: clamp(value, 0, 100 - element.w) });
    if (key === "y") onChange({ y: clamp(value, 0, 100 - element.h) });
    if (key === "w") onChange({ w: clamp(value, 4, 100 - element.x) });
    if (key === "h") onChange({ h: clamp(value, 4, 100 - element.y) });
  };

  return (
    <div className="slide-editor__geometry">
      {(["x", "y", "w", "h"] as const).map((key) => (
        <label key={key} className="admin-field">
          <span className="admin-label">{key.toUpperCase()} %</span>
          <input
            className="admin-input"
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={Number(element[key].toFixed(1))}
            onChange={(event) => setNumber(key, event.target.value)}
          />
        </label>
      ))}
    </div>
  );
}

function TextProperties({
  element,
  colors,
  onChange,
}: {
  element: SlideTextElement;
  colors: string[];
  onChange: (patch: Partial<SlideTextElement>) => void;
}) {
  const bumpSize = (delta: number) => {
    const next = Math.round((element.fontSize + delta) * 10) / 10;
    onChange({ fontSize: clamp(next, 0.8, 12) });
  };

  return (
    <>
      <label className="admin-field">
        <span className="admin-label">Текст</span>
        <textarea
          className="admin-textarea"
          rows={4}
          value={element.text}
          onChange={(event) => onChange({ text: event.target.value })}
        />
      </label>

      <div className="admin-field">
        <span className="admin-label">Размер текста</span>
        <div className="slide-editor__size-controls">
          <button
            type="button"
            className="slide-editor__size-btn"
            aria-label="Уменьшить текст"
            onClick={() => bumpSize(-0.4)}
          >
            −
          </button>
          <input
            className="admin-input slide-editor__size-input"
            type="number"
            min="0.8"
            max="12"
            step="0.2"
            value={Number(element.fontSize.toFixed(1))}
            onChange={(event) =>
              onChange({
                fontSize: clamp(Number(event.target.value) || 0.8, 0.8, 12),
              })
            }
          />
          <button
            type="button"
            className="slide-editor__size-btn"
            aria-label="Увеличить текст"
            onClick={() => bumpSize(0.4)}
          >
            +
          </button>
        </div>
      </div>

      <div className="admin-field">
        <span className="admin-label">Выравнивание</span>
        <div className="admin-segmented admin-segmented--full" role="group" aria-label="Выравнивание текста">
          {(
            [
              { align: "left" as const, label: "Слева", icon: "format_align_left" },
              { align: "center" as const, label: "Центр", icon: "format_align_center" },
              { align: "right" as const, label: "Справа", icon: "format_align_right" },
            ] as const
          ).map(({ align, label, icon }) => (
            <button
              key={align}
              type="button"
              className={`admin-segmented__btn${element.align === align ? " admin-segmented__btn--active" : ""}`}
              aria-pressed={element.align === align}
              title={label}
              onClick={() => onChange({ align })}
            >
              <MaterialIcon name={icon} size={20} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <label className="admin-field">
        <span className="admin-label">Шрифт</span>
        <select
          className="admin-input"
          value={element.fontFamily}
          onChange={(event) => onChange({ fontFamily: event.target.value })}
        >
          {PROJECT_FONT_OPTIONS.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </label>

      <div className="admin-field">
        <span className="admin-label">Цвет</span>
        <div className="slide-editor__palette">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              className={element.color === color ? "is-active" : ""}
              style={{ background: color }}
              aria-label={color}
              onClick={() => onChange({ color })}
            />
          ))}
        </div>
      </div>

      <div className="admin-field">
        <span className="admin-label">Начертание</span>
        <div className="admin-segmented" role="group" aria-label="Начертание">
          <button
            type="button"
            className={`admin-segmented__btn${element.bold ? " admin-segmented__btn--active" : ""}`}
            aria-pressed={Boolean(element.bold)}
            onClick={() => onChange({ bold: !element.bold })}
          >
            <MaterialIcon name="format_bold" size={20} />
            <span>Жирный</span>
          </button>
          <button
            type="button"
            className={`admin-segmented__btn${element.italic ? " admin-segmented__btn--active" : ""}`}
            aria-pressed={Boolean(element.italic)}
            onClick={() => onChange({ italic: !element.italic })}
          >
            <MaterialIcon name="format_italic" size={20} />
            <span>Курсив</span>
          </button>
        </div>
      </div>

      <div className="admin-field">
        <span className="admin-label">Позиция и размер блока</span>
      </div>
    </>
  );
}
