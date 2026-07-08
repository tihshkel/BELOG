"use client";

import Image from "next/image";
import Link from "next/link";
import type { Section } from "@/lib/types";
import { TEMPLATE_LABELS, normalizeTemplateType } from "@/lib/section-content";

interface SectionListProps {
  sections: Section[];
  onMove: (id: string, dir: -1 | 1) => void;
  onDelete: (id: string) => void;
}

export function SectionList({ sections, onMove, onDelete }: SectionListProps) {
  if (sections.length === 0) {
    return (
      <div className="admin-empty admin-empty--friendly">
        <p className="admin-empty__title">Разделов пока нет</p>
        <p className="admin-empty__sub">Создайте первый раздел — он появится на экранах музея</p>
      </div>
    );
  }

  return (
    <div className="admin-section-list">
      {sections.map((section, index) => (
        <article key={section.id} className="touch-tile admin-section-row">
          <Link href={`/admin/sections/${section.id}`} className="admin-section-row__main">
            {section.coverUrl ? (
              <div className="admin-section-row__thumb">
                <Image src={section.coverUrl} alt="" fill className="object-cover" sizes="96px" />
              </div>
            ) : (
              <div className="admin-section-row__thumb admin-section-row__thumb--empty" />
            )}

            <div className="admin-section-row__info">
              <h3 className="admin-section-row__title">{section.title}</h3>
              <p className="admin-section-row__meta">
                {TEMPLATE_LABELS[normalizeTemplateType(section.templateType)]}
                <span className="admin-section-row__dot">·</span>
                <span className={section.isPublished ? "admin-section-row__status--on" : "admin-section-row__status--off"}>
                  {section.isPublished ? "На экране" : "Скрыт"}
                </span>
              </p>
            </div>
          </Link>

          <div className="admin-section-row__actions">
            <button
              type="button"
              className="admin-btn-text"
              disabled={index === 0}
              onClick={() => onMove(section.id, -1)}
              aria-label="Выше"
            >
              ↑
            </button>
            <button
              type="button"
              className="admin-btn-text"
              disabled={index === sections.length - 1}
              onClick={() => onMove(section.id, 1)}
              aria-label="Ниже"
            >
              ↓
            </button>
            <Link href={`/admin/sections/${section.id}`} className="admin-btn-primary admin-btn-primary--compact">
              Изменить
            </Link>
            <button type="button" className="admin-btn-text admin-btn-text--danger" onClick={() => onDelete(section.id)}>
              Удалить
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
