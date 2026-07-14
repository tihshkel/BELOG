"use client";

import Image from "next/image";
import type { GalleryItem } from "@/lib/section-content";
import { defaultImageSize, mediaRefFromUrl, newBlockId } from "@/lib/section-content";
import { getMediaThumbnailUrl } from "@/lib/media";
import { MEDIA_ACCEPT_STRING } from "@/lib/media-constants";
import { uploadMediaFile } from "@/lib/upload-media";
import { useAdminToast } from "../AdminToast";
import { ImageSizePicker } from "../ImageSizePicker";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { MEDIA_KIND_ICONS } from "@/lib/media-constants";

interface GalleryEditorProps {
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
}

export function GalleryEditor({ items, onChange }: GalleryEditorProps) {
  const { showToast } = useAdminToast();

  const addMedia = async (files: FileList | null) => {
    if (!files?.length) return;
    const next = [...items];
    for (const file of Array.from(files)) {
      try {
        const result = await uploadMediaFile(file);
        next.push({
          id: newBlockId(),
          media: {
            url: result.url,
            kind: result.kind,
            mimeType: result.mimeType,
            posterUrl: result.posterUrl,
            slides: result.slides,
          },
          caption: "",
          size: defaultImageSize(),
        });
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Не удалось загрузить файл", "error");
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
          <p className="admin-empty__title">Пока нет медиа</p>
          <p className="admin-empty__sub">Загрузите фото, видео, PDF, аудио или презентации</p>
        </div>
      ) : (
        <div className="admin-gallery-edit-list">
          {items.map((item, index) => {
            const thumb = getMediaThumbnailUrl(item.media ?? mediaRefFromUrl(""));
            return (
              <article key={item.id} className="admin-gallery-edit-card">
                <div className="admin-gallery-edit-card__thumb">
                  {thumb ? (
                    <Image src={thumb} alt="" fill className="object-contain p-1" sizes="200px" unoptimized={thumb.endsWith(".svg")} />
                  ) : (
                    <div className="admin-upload__media-placeholder">
                      <MaterialIcon name={MEDIA_KIND_ICONS[(item.media ?? mediaRefFromUrl("")).kind]} size={32} />
                    </div>
                  )}
                  <label className="admin-gallery-grid__replace">
                    Заменить
                    <input
                      type="file"
                      accept={MEDIA_ACCEPT_STRING}
                      className="sr-only"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const result = await uploadMediaFile(file);
                          updateItem(item.id, {
                            media: {
                              url: result.url,
                              kind: result.kind,
                              mimeType: result.mimeType,
                              posterUrl: result.posterUrl,
                              slides: result.slides,
                            },
                          });
                        } catch (error) {
                          showToast(error instanceof Error ? error.message : "Не удалось загрузить файл", "error");
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
                    placeholder="Подпись"
                  />

                  <ImageSizePicker
                    compact
                    value={item.size ?? "medium"}
                    onChange={(size) => updateItem(item.id, { size })}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}

      <label className="admin-add-zone">
        <span className="admin-add-zone__icon">+</span>
        <span className="admin-add-zone__text">Добавить медиа</span>
        <span className="admin-add-zone__hint">Можно выбрать несколько файлов</span>
        <input type="file" accept={MEDIA_ACCEPT_STRING} multiple className="sr-only" onChange={(e) => void addMedia(e.target.files)} />
      </label>
    </div>
  );
}
