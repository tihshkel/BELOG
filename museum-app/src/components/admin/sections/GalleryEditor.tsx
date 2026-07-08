"use client";

import Image from "next/image";
import type { GalleryItem } from "@/lib/section-content";
import { defaultImageSize, newBlockId } from "@/lib/section-content";
import { uploadImageFile } from "../ImageUploadZone";
import { useAdminToast } from "../AdminToast";
import { ImageSizePicker } from "../ImageSizePicker";

interface GalleryEditorProps {
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
}

export function GalleryEditor({ items, onChange }: GalleryEditorProps) {
  const { showToast } = useAdminToast();

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    const next = [...items];
    for (const file of Array.from(files)) {
      try {
        const url = await uploadImageFile(file);
        next.push({ id: newBlockId(), url, caption: "", size: defaultImageSize() });
      } catch {
        showToast("Не удалось загрузить одно из фото", "error");
      }
    }
    onChange(next);
  };

  const updateItem = (id: string, patch: Partial<GalleryItem>) => {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const moveItem = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= items.length) return;
    const copy = [...items];
    [copy[index], copy[next]] = [copy[next], copy[index]];
    onChange(copy);
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="admin-gallery-editor">
      {items.length === 0 ? (
        <div className="admin-empty admin-empty--friendly">
          <p className="admin-empty__title">Пока нет фотографий</p>
          <p className="admin-empty__sub">Загрузите снимки и выберите размер каждого — от миниатюры до главного кадра</p>
        </div>
      ) : (
        <div className="admin-gallery-edit-list">
          {items.map((item, index) => (
            <article key={item.id} className="admin-gallery-edit-card">
              <div className="admin-gallery-edit-card__thumb">
                {item.url ? (
                  <Image src={item.url} alt="" fill className="object-cover" sizes="200px" />
                ) : null}
                <label className="admin-gallery-grid__replace">
                  Заменить
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const url = await uploadImageFile(file);
                        updateItem(item.id, { url });
                      } catch {
                        showToast("Не удалось загрузить фото", "error");
                      }
                    }}
                  />
                </label>
              </div>

              <div className="admin-gallery-edit-card__fields">
                <div className="admin-gallery-edit-card__head">
                  <span className="admin-block-card__badge">{index + 1}</span>
                  <div className="admin-block-card__actions">
                    <button type="button" className="admin-btn-text" disabled={index === 0} onClick={() => moveItem(index, -1)}>
                      Выше
                    </button>
                    <button
                      type="button"
                      className="admin-btn-text"
                      disabled={index === items.length - 1}
                      onClick={() => moveItem(index, 1)}
                    >
                      Ниже
                    </button>
                    <button type="button" className="admin-btn-text admin-btn-text--danger" onClick={() => removeItem(item.id)}>
                      Убрать
                    </button>
                  </div>
                </div>

                <input
                  className="admin-input"
                  value={item.caption}
                  onChange={(e) => updateItem(item.id, { caption: e.target.value })}
                  placeholder="Подпись к фото"
                />

                <ImageSizePicker
                  compact
                  value={item.size ?? "medium"}
                  onChange={(size) => updateItem(item.id, { size })}
                />
              </div>
            </article>
          ))}
        </div>
      )}

      <label className="admin-add-zone">
        <span className="admin-add-zone__icon">+</span>
        <span className="admin-add-zone__text">Добавить фотографии</span>
        <span className="admin-add-zone__hint">Можно выбрать несколько сразу</span>
        <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => void addPhotos(e.target.files)} />
      </label>
    </div>
  );
}
