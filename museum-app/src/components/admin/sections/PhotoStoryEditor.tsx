"use client";

import Image from "next/image";
import type { PhotoStoryItem } from "@/lib/section-content";
import { createEmptyStory } from "@/lib/section-content";
import { ImageUploadZone } from "../ImageUploadZone";
import { ImageSizePicker } from "../ImageSizePicker";

interface PhotoStoryEditorProps {
  stories: PhotoStoryItem[];
  onChange: (stories: PhotoStoryItem[]) => void;
}

export function PhotoStoryEditor({ stories, onChange }: PhotoStoryEditorProps) {
  const update = (id: string, patch: Partial<PhotoStoryItem>) => {
    onChange(stories.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const remove = (id: string) => onChange(stories.filter((s) => s.id !== id));

  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= stories.length) return;
    const copy = [...stories];
    [copy[index], copy[next]] = [copy[next], copy[index]];
    onChange(copy);
  };

  return (
    <div className="admin-template-form">
      {stories.length === 0 ? (
        <div className="admin-empty admin-empty--friendly">
          <p className="admin-empty__title">Добавьте первый сюжет</p>
          <p className="admin-empty__sub">Каждый сюжет — фото с заголовком и текстом. На экране они чередуются слева и справа.</p>
          <button type="button" className="admin-btn-primary" onClick={() => onChange([createEmptyStory()])}>
            + Добавить сюжет
          </button>
        </div>
      ) : (
        stories.map((story, index) => (
          <article key={story.id} className="admin-story-card">
            <div className="admin-story-card__head">
              <span className="admin-block-card__badge">{index + 1}</span>
              <span className="admin-story-card__label">Сюжет {index + 1}</span>
              <div className="admin-block-card__actions">
                <button type="button" className="admin-btn-text" disabled={index === 0} onClick={() => move(index, -1)}>
                  Выше
                </button>
                <button
                  type="button"
                  className="admin-btn-text"
                  disabled={index === stories.length - 1}
                  onClick={() => move(index, 1)}
                >
                  Ниже
                </button>
                <button type="button" className="admin-btn-text admin-btn-text--danger" onClick={() => remove(story.id)}>
                  Убрать
                </button>
              </div>
            </div>

            <div className="admin-story-card__layout">
              <div className="admin-story-card__photo">
                <ImageUploadZone
                  value={story.imageUrl}
                  onChange={(url) => update(story.id, { imageUrl: url })}
                />
                {story.imageUrl ? (
                  <ImageSizePicker
                    compact
                    value={story.imageSize}
                    onChange={(imageSize) => update(story.id, { imageSize })}
                  />
                ) : null}
              </div>

              <div className="admin-story-card__text">
                <div className="admin-field">
                  <label className="admin-label">Заголовок</label>
                  <input
                    className="admin-input"
                    value={story.title}
                    onChange={(e) => update(story.id, { title: e.target.value })}
                    placeholder="Например: Первые соревнования"
                  />
                </div>
                <div className="admin-field admin-field--tight">
                  <label className="admin-label">Текст</label>
                  <textarea
                    className="admin-textarea"
                    rows={5}
                    value={story.text}
                    onChange={(e) => update(story.id, { text: e.target.value })}
                    placeholder="Опишите, что на фото"
                  />
                </div>
              </div>
            </div>

            {story.imageUrl && story.title ? (
              <div className="admin-story-card__mini-preview" aria-hidden>
                <div className={`admin-story-mini admin-story-mini--${index % 2 === 0 ? "left" : "right"}`}>
                  <div className={`admin-story-mini__img admin-story-mini__img--${story.imageSize}`}>
                    <Image src={story.imageUrl} alt="" fill className="object-cover" sizes="120px" />
                  </div>
                  <div className="admin-story-mini__text">
                    <strong>{story.title}</strong>
                  </div>
                </div>
              </div>
            ) : null}
          </article>
        ))
      )}

      {stories.length > 0 ? (
        <button type="button" className="admin-add-zone admin-add-zone--inline" onClick={() => onChange([...stories, createEmptyStory()])}>
          <span className="admin-add-zone__icon">+</span>
          <span className="admin-add-zone__text">Ещё один сюжет</span>
        </button>
      ) : null}
    </div>
  );
}
