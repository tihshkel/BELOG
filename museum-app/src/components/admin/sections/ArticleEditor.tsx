"use client";

import type { SectionContentV2 } from "@/lib/section-content";
import { MediaUploadZone } from "../MediaUploadZone";
import { ImageSizePicker } from "../ImageSizePicker";

interface ArticleEditorProps {
  content: SectionContentV2;
  onChange: (content: SectionContentV2) => void;
}

export function ArticleEditor({ content, onChange }: ArticleEditorProps) {
  const patch = (partial: Partial<SectionContentV2>) => onChange({ ...content, version: 2, ...partial });

  return (
    <div className="admin-template-form">
      <MediaUploadZone
        label="Главное медиа"
        value={content.heroMedia ?? content.heroImage ?? ""}
        onChange={(heroMedia) => patch({ heroMedia })}
        hint="Фото, видео, PDF, аудио или презентация — крупно на экране"
      />

      {content.heroMedia?.url || content.heroImage ? (
        <ImageSizePicker
          value={content.heroSize ?? "large"}
          onChange={(heroSize) => patch({ heroSize })}
        />
      ) : null}

      <div className="admin-field">
        <label className="admin-label" htmlFor="article-intro">
          Вступление
        </label>
        <textarea
          id="article-intro"
          className="admin-textarea"
          rows={3}
          value={content.intro ?? ""}
          onChange={(e) => patch({ intro: e.target.value })}
          placeholder="Короткий абзац — привлекает внимание"
        />
      </div>

      <div className="admin-field">
        <label className="admin-label" htmlFor="article-body">
          Основной текст
        </label>
        <textarea
          id="article-body"
          className="admin-textarea admin-textarea--tall"
          rows={10}
          value={content.body ?? ""}
          onChange={(e) => patch({ body: e.target.value })}
          placeholder="Расскажите историю, факты, детали"
        />
      </div>
    </div>
  );
}
