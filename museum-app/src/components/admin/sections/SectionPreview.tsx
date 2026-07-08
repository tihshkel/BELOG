"use client";

import Image from "next/image";
import type { SectionTemplate } from "@/lib/types";
import type { SectionContentV2 } from "@/lib/section-content";
import { TEMPLATE_LABELS } from "@/lib/section-content";

interface SectionPreviewProps {
  title: string;
  coverUrl?: string;
  templateType: SectionTemplate;
  content: SectionContentV2;
  isPublished: boolean;
}

export function SectionPreview({
  title,
  coverUrl,
  templateType,
  content,
  isPublished,
}: SectionPreviewProps) {
  return (
    <div className="admin-preview">
      <p className="admin-preview__label">Как на экране</p>

      <div className="admin-preview__frame">
        <div className="admin-preview__card">
          {coverUrl ? (
            <div className="admin-preview__cover">
              <Image src={coverUrl} alt="" fill className="object-cover" sizes="320px" />
            </div>
          ) : (
            <div className="admin-preview__cover admin-preview__cover--empty" />
          )}
          <p className="admin-preview__card-title">{title || "Название раздела"}</p>
        </div>

        <div className="admin-preview__body">
          <div className="admin-preview__meta">
            <span>{TEMPLATE_LABELS[templateType]}</span>
            <span className={isPublished ? "admin-preview__status--on" : "admin-preview__status--off"}>
              {isPublished ? "На экране" : "Скрыт"}
            </span>
          </div>

          {templateType === "article" ? (
            <div className="admin-preview__article">
              {content.heroImage ? (
                <div className={`admin-preview__hero admin-preview__hero--${content.heroSize ?? "large"}`}>
                  <Image src={content.heroImage} alt="" fill className="object-cover" sizes="320px" />
                </div>
              ) : null}
              {content.intro ? <p className="admin-preview__lead">{content.intro}</p> : null}
              {content.body ? <p className="admin-preview__text">{content.body.slice(0, 180)}…</p> : null}
            </div>
          ) : null}

          {templateType === "photo_story" ? (
            <div className="admin-preview__stories">
              {(content.stories ?? []).slice(0, 2).map((story, i) => (
                <div key={story.id} className={`admin-preview__story admin-preview__story--${i % 2 === 0 ? "left" : "right"}`}>
                  {story.imageUrl ? (
                    <div className={`admin-preview__story-img admin-preview__story-img--${story.imageSize}`}>
                      <Image src={story.imageUrl} alt="" fill className="object-cover" sizes="80px" />
                    </div>
                  ) : null}
                  <div>
                    {story.title ? <strong>{story.title}</strong> : null}
                    {story.text ? <p>{story.text.slice(0, 60)}…</p> : null}
                  </div>
                </div>
              ))}
              {(content.stories ?? []).length === 0 ? <p className="admin-preview__empty">Добавьте сюжеты</p> : null}
            </div>
          ) : null}

          {templateType === "gallery" ? (
            <div className="admin-preview__gallery">
              {(content.gallery ?? []).length === 0 ? (
                <p className="admin-preview__empty">Добавьте фотографии</p>
              ) : (
                (content.gallery ?? []).slice(0, 6).map((item) => (
                  <div key={item.id} className={`admin-preview__gallery-thumb admin-preview__gallery-thumb--${item.size ?? "medium"}`}>
                    {item.url ? <Image src={item.url} alt="" fill className="object-cover" sizes="80px" /> : null}
                  </div>
                ))
              )}
            </div>
          ) : null}

          {templateType === "timeline" ? (
            <div className="admin-preview__timeline">
              {(content.events ?? []).length === 0 ? (
                <p className="admin-preview__empty">Добавьте события</p>
              ) : (
                (content.events ?? []).slice(0, 3).map((event) => (
                  <div key={event.id} className="admin-preview__timeline-item">
                    <span className="admin-preview__timeline-year">{event.year || "—"}</span>
                    <span>{event.title || "Событие"}</span>
                  </div>
                ))
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
