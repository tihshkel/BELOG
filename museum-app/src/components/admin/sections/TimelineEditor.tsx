"use client";

import type { TimelineEvent } from "@/lib/section-content";
import { createEmptyEvent } from "@/lib/section-content";
import { MediaUploadZone } from "../MediaUploadZone";

interface TimelineEditorProps {
  events: TimelineEvent[];
  onChange: (events: TimelineEvent[]) => void;
}

export function TimelineEditor({ events, onChange }: TimelineEditorProps) {
  const update = (id: string, patch: Partial<TimelineEvent>) => {
    onChange(events.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const remove = (id: string) => onChange(events.filter((e) => e.id !== id));

  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= events.length) return;
    const copy = [...events];
    [copy[index], copy[next]] = [copy[next], copy[index]];
    onChange(copy);
  };

  return (
    <div className="admin-template-form admin-template-form--timeline">
      {events.length === 0 ? (
        <div className="admin-empty admin-empty--friendly">
          <p className="admin-empty__title">Добавьте первое событие</p>
          <p className="admin-empty__sub">Год, заголовок и описание — на экране выстроятся в ленту времени</p>
          <button type="button" className="admin-btn-primary" onClick={() => onChange([createEmptyEvent()])}>
            + Добавить событие
          </button>
        </div>
      ) : (
        events.map((event, index) => (
          <article key={event.id} className="admin-timeline-card">
            <div className="admin-timeline-card__rail">
              <span className="admin-timeline-card__dot" />
              {index < events.length - 1 ? <span className="admin-timeline-card__line" /> : null}
            </div>

            <div className="admin-timeline-card__body">
              <div className="admin-timeline-card__head">
                <span className="admin-block-card__badge">{index + 1}</span>
                <div className="admin-block-card__actions">
                  <button type="button" className="admin-btn-text" disabled={index === 0} onClick={() => move(index, -1)}>
                    Выше
                  </button>
                  <button
                    type="button"
                    className="admin-btn-text"
                    disabled={index === events.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    Ниже
                  </button>
                  <button type="button" className="admin-btn-text admin-btn-text--danger" onClick={() => remove(event.id)}>
                    Убрать
                  </button>
                </div>
              </div>

              <div className="admin-timeline-card__fields">
                <div className="admin-field admin-field--year">
                  <label className="admin-label">Год</label>
                  <input
                    className="admin-input"
                    value={event.year}
                    onChange={(e) => update(event.id, { year: e.target.value })}
                    placeholder="1960"
                    inputMode="numeric"
                  />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Заголовок события</label>
                  <input
                    className="admin-input"
                    value={event.title}
                    onChange={(e) => update(event.id, { title: e.target.value })}
                    placeholder="Основание общества"
                  />
                </div>
              </div>

              <div className="admin-field">
                <label className="admin-label">Описание</label>
                <textarea
                  className="admin-textarea"
                  rows={4}
                  value={event.text}
                  onChange={(e) => update(event.id, { text: e.target.value })}
                  placeholder="Что произошло в этот период"
                />
              </div>

              <MediaUploadZone
                label="Медиа (необязательно)"
                value={event.media ?? event.imageUrl ?? ""}
                onChange={(media) => update(event.id, { media: media.url ? media : undefined })}
                hint="Фото, видео, аудио или другое — рядом с событием"
              />
            </div>
          </article>
        ))
      )}

      {events.length > 0 ? (
        <button type="button" className="admin-add-zone admin-add-zone--inline" onClick={() => onChange([...events, createEmptyEvent()])}>
          <span className="admin-add-zone__icon">+</span>
          <span className="admin-add-zone__text">Ещё одно событие</span>
        </button>
      ) : null}
    </div>
  );
}
