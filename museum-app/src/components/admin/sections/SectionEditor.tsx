"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Section } from "@/lib/types";
import {
  normalizeTemplateType,
  parseContent,
  serializeContent,
  TEMPLATE_LABELS,
  type SectionContentV2,
} from "@/lib/section-content";
import { useAdminToast } from "../AdminToast";
import { ImageUploadZone } from "../ImageUploadZone";
import { ArticleEditor } from "./ArticleEditor";
import { GalleryEditor } from "./GalleryEditor";
import { PhotoStoryEditor } from "./PhotoStoryEditor";
import { SectionPreview } from "./SectionPreview";
import { TimelineEditor } from "./TimelineEditor";

interface SectionEditorProps {
  section: Section;
}

type EditorStep = "basics" | "content";

export function SectionEditor({ section: initial }: SectionEditorProps) {
  const router = useRouter();
  const { showToast } = useAdminToast();
  const tpl = normalizeTemplateType(initial.templateType);
  const [step, setStep] = useState<EditorStep>("basics");
  const [title, setTitle] = useState(initial.title);
  const [coverUrl, setCoverUrl] = useState(initial.coverUrl ?? "");
  const [isPublished, setIsPublished] = useState(initial.isPublished);
  const [content, setContent] = useState<SectionContentV2>(() =>
    parseContent(initial.contentJson, initial.contentHtml, tpl)
  );
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const skipAutoSave = useRef(true);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/sections/${initial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          coverUrl: coverUrl || null,
          templateType: tpl,
          contentJson: serializeContent(content),
          isPublished,
        }),
      });
      if (!res.ok) throw new Error();
      setLastSaved(new Date());
      showToast("Сохранено");
    } catch {
      showToast("Ошибка сохранения", "error");
    } finally {
      setSaving(false);
    }
  }, [initial.id, tpl, title, coverUrl, content, isPublished, showToast]);

  useEffect(() => {
    if (skipAutoSave.current) {
      skipAutoSave.current = false;
      return;
    }
    const timer = setTimeout(() => {
      void save();
    }, 2000);
    return () => clearTimeout(timer);
  }, [title, coverUrl, content, isPublished, save]);

  const renderContentEditor = () => {
    switch (tpl) {
      case "article":
        return <ArticleEditor content={content} onChange={setContent} />;
      case "photo_story":
        return (
          <PhotoStoryEditor
            stories={content.stories ?? []}
            onChange={(stories) => setContent((c) => ({ ...c, version: 2, stories }))}
          />
        );
      case "gallery":
        return (
          <GalleryEditor
            items={content.gallery ?? []}
            onChange={(gallery) => setContent((c) => ({ ...c, version: 2, gallery }))}
          />
        );
      case "timeline":
        return (
          <TimelineEditor
            events={content.events ?? []}
            onChange={(events) => setContent((c) => ({ ...c, version: 2, events }))}
          />
        );
    }
  };

  return (
    <div className="admin-editor">
      <div className="admin-editor__toolbar">
        <button type="button" className="admin-btn-ghost admin-btn-ghost--compact" onClick={() => router.push("/admin/sections")}>
          ← К разделам
        </button>
        <div className="admin-editor__toolbar-meta">
          <span className="admin-editor__template">{TEMPLATE_LABELS[tpl]}</span>
          {saving ? (
            <span className="admin-editor__save-status">Сохранение…</span>
          ) : lastSaved ? (
            <span className="admin-editor__save-status">Сохранено</span>
          ) : (
            <span className="admin-editor__save-status">Автосохранение</span>
          )}
        </div>
        <div className="admin-editor__toolbar-actions">
          <a href="/display/horizontal" target="_blank" rel="noreferrer" className="admin-btn-secondary admin-btn-secondary--compact">
            На экране
          </a>
          <button type="button" className="admin-btn-primary admin-btn-primary--compact" onClick={() => void save()} disabled={saving}>
            Сохранить
          </button>
        </div>
      </div>

      <div className="admin-editor__split">
        <div className="admin-editor__form">
          <header className="admin-page-head admin-page-head--compact">
            <h1 className="admin-page-head__title">{title || "Новый раздел"}</h1>
            <p className="admin-page-head__sub">Заполните по шагам — изменения сохраняются сами</p>
          </header>

          <div className="admin-steps" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={step === "basics"}
              className={`admin-steps__btn${step === "basics" ? " admin-steps__btn--active" : ""}`}
              onClick={() => setStep("basics")}
            >
              1. Основное
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={step === "content"}
              className={`admin-steps__btn${step === "content" ? " admin-steps__btn--active" : ""}`}
              onClick={() => setStep("content")}
            >
              2. Содержание
            </button>
          </div>

          {step === "basics" ? (
            <div className="admin-panel">
              <div className="admin-field">
                <label className="admin-label" htmlFor="section-title">
                  Название на экране
                </label>
                <input
                  id="section-title"
                  className="admin-input admin-input--large"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Например: История музея"
                />
              </div>

              <div className="admin-field">
                <label className="admin-toggle admin-toggle--card">
                  <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
                  <span>
                    <strong>Показывать на экране</strong>
                    <small>Если выключено, раздел виден только здесь</small>
                  </span>
                </label>
              </div>

              <ImageUploadZone
                label="Обложка в списке разделов"
                value={coverUrl}
                onChange={setCoverUrl}
                hint="Это фото на плитке в меню разделов"
              />

              <button type="button" className="admin-btn-primary admin-btn-primary--block" onClick={() => setStep("content")}>
                Далее — содержание →
              </button>
            </div>
          ) : (
            <div className="admin-panel">
              {renderContentEditor()}
              <button type="button" className="admin-btn-secondary admin-btn-secondary--block admin-editor__back-step" onClick={() => setStep("basics")}>
                ← Назад к основному
              </button>
            </div>
          )}
        </div>

        <aside className="admin-editor__preview">
          <SectionPreview
            title={title}
            coverUrl={coverUrl}
            templateType={tpl}
            content={content}
            isPublished={isPublished}
          />
        </aside>
      </div>
    </div>
  );
}
