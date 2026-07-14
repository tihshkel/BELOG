"use client";

import Image from "next/image";
import type { HighlightCard } from "@/lib/section-content";
import { createEmptyHighlight } from "@/lib/section-content";
import { getMediaThumbnailUrl } from "@/lib/media";
import { MEDIA_ACCEPT_STRING, MEDIA_KIND_ICONS } from "@/lib/media-constants";
import { uploadMediaFile } from "@/lib/upload-media";
import { useAdminToast } from "../AdminToast";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

interface HighlightsEditorProps {
  items: HighlightCard[];
  onChange: (items: HighlightCard[]) => void;
}

export function HighlightsEditor({ items, onChange }: HighlightsEditorProps) {
  const { showToast } = useAdminToast();

  const addCard = () => {
    onChange([...items, createEmptyHighlight()]);
  };

  const updateCard = (id: string, patch: Partial<HighlightCard>) => {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removeCard = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="admin-highlights-editor">
      {items.length === 0 ? (
        <div className="admin-empty admin-empty--friendly">
          <p className="admin-empty__title">Пока нет карточек</p>
          <p className="admin-empty__sub">Добавьте карточки с медиа, заголовком и кратким текстом</p>
        </div>
      ) : (
        <div className="admin-highlights-grid">
          {items.map((item) => {
            const thumb = item.media ? getMediaThumbnailUrl(item.media) : null;
            return (
              <article key={item.id} className="admin-highlights-card">
                <div className="admin-highlights-card__media">
                  {thumb ? (
                    <Image src={thumb} alt="" fill className="object-cover" sizes="200px" unoptimized={thumb.endsWith(".svg")} />
                  ) : item.media?.url ? (
                    <div className="admin-upload__media-placeholder">
                      <MaterialIcon name={MEDIA_KIND_ICONS[item.media.kind]} size={32} />
                    </div>
                  ) : null}
                  <label className="admin-highlights-card__upload">
                    {item.media?.url ? "Заменить" : "Добавить медиа"}
                    <input
                      type="file"
                      accept={MEDIA_ACCEPT_STRING}
                      className="sr-only"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const result = await uploadMediaFile(file);
                          updateCard(item.id, {
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

                <div className="admin-field">
                  <label className="admin-label">Заголовок</label>
                  <input
                    className="admin-input"
                    value={item.title}
                    onChange={(e) => updateCard(item.id, { title: e.target.value })}
                    placeholder="Название карточки"
                  />
                </div>

                <div className="admin-field">
                  <label className="admin-label">Текст</label>
                  <textarea
                    className="admin-textarea"
                    rows={4}
                    value={item.text}
                    onChange={(e) => updateCard(item.id, { text: e.target.value })}
                    placeholder="Краткое описание"
                  />
                </div>

                <button
                  type="button"
                  className="admin-btn-ghost admin-btn-ghost--compact"
                  onClick={() => removeCard(item.id)}
                >
                  Удалить карточку
                </button>
              </article>
            );
          })}
        </div>
      )}

      <button type="button" className="admin-btn-secondary" onClick={addCard}>
        + Добавить карточку
      </button>
    </div>
  );
}
