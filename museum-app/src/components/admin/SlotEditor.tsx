"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Section, SectionTemplate, ScreenOrientation } from "@/lib/types";
import {
  normalizeTemplateType,
  TEMPLATE_LABELS,
} from "@/lib/section-content";
import {
  createSlideContent,
  parseSlideContent,
  serializeSlideContent,
  type SectionContentV3,
} from "@/lib/slide-content";
import { formatSlotNumber } from "@/lib/slot-utils";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useAdminToast } from "./AdminToast";
import { ConfirmDialog } from "./ConfirmDialog";
import { ImageUploadZone } from "./MediaUploadZone";
import { TemplatePicker } from "./sections/TemplatePicker";
import { SlideCanvas } from "./slides/SlideCanvas";

interface SlotEditorProps {
  section: Section;
}

export function SlotEditor({ section: initial }: SlotEditorProps) {
  const { showToast } = useAdminToast();
  const slotLabel = formatSlotNumber(initial.slotIndex);
  const [templateType, setTemplateType] = useState<SectionTemplate>(
    normalizeTemplateType(initial.templateType)
  );
  const [title, setTitle] = useState(initial.title);
  const [coverUrl, setCoverUrl] = useState(initial.coverUrl ?? "");
  const [isPublished, setIsPublished] = useState(initial.isPublished);
  const [content, setContent] = useState<SectionContentV3>(() =>
    parseSlideContent(
      initial.contentJson,
      initial.contentHtml,
      normalizeTemplateType(initial.templateType)
    )
  );
  const [previewOrientation, setPreviewOrientation] =
    useState<ScreenOrientation>("horizontal");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [pendingTemplate, setPendingTemplate] = useState<SectionTemplate | null>(
    null
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
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
          templateType,
          contentJson: serializeSlideContent(content),
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
  }, [initial.id, templateType, title, coverUrl, content, isPublished, showToast]);

  useEffect(() => {
    if (skipAutoSave.current) {
      skipAutoSave.current = false;
      return;
    }
    const timer = setTimeout(() => {
      void save();
    }, 2000);
    return () => clearTimeout(timer);
  }, [title, coverUrl, content, isPublished, templateType, save]);

  const applyTemplateChange = (next: SectionTemplate) => {
    setTemplateType(next);
    setContent(createSlideContent(next, undefined, previewOrientation));
    setPendingTemplate(null);
    skipAutoSave.current = false;
  };

  const handleTemplateSelect = (next: SectionTemplate) => {
    if (next === templateType) return;
    setPendingTemplate(next);
  };

  return (
    <div className="slot-workspace">
      <header className="slot-workspace__bar">
        <div className="slot-workspace__identity">
          <span className="slot-workspace__slot">{slotLabel}</span>
          <input
            className="slot-workspace__title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Название раздела"
            aria-label="Название на кнопке киоска"
          />
          <label className="slot-workspace__publish">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(event) => setIsPublished(event.target.checked)}
            />
            <span>На экране</span>
          </label>
        </div>

        <div className="slot-workspace__actions">
          {saving ? (
            <span className="admin-editor__save-status">Сохранение…</span>
          ) : lastSaved ? (
            <span className="admin-editor__save-status admin-editor__save-status--saved">
              Сохранено
            </span>
          ) : (
            <span className="admin-editor__save-status">Автосохранение</span>
          )}

          <div className="admin-preview-toggle" role="group" aria-label="Ориентация превью">
            <button
              type="button"
              className={`admin-preview-toggle__btn${previewOrientation === "horizontal" ? " admin-preview-toggle__btn--active" : ""}`}
              onClick={() => setPreviewOrientation("horizontal")}
            >
              Гориз.
            </button>
            <button
              type="button"
              className={`admin-preview-toggle__btn${previewOrientation === "vertical" ? " admin-preview-toggle__btn--active" : ""}`}
              onClick={() => setPreviewOrientation("vertical")}
            >
              Верт.
            </button>
          </div>

          <button
            type="button"
            className={`admin-btn-secondary admin-btn-secondary--compact${settingsOpen ? " is-active" : ""}`}
            onClick={() => setSettingsOpen((open) => !open)}
          >
            <MaterialIcon name="tune" size={18} />
            Настройки
          </button>

          <a
            href={`/display/${previewOrientation}`}
            target="_blank"
            rel="noreferrer"
            className="admin-btn-secondary admin-btn-secondary--compact"
          >
            Превью
          </a>

          <button
            type="button"
            className="admin-btn-primary admin-btn-primary--compact"
            onClick={() => void save()}
            disabled={saving}
          >
            Сохранить
          </button>
        </div>
      </header>

      {settingsOpen ? (
        <div className="slot-workspace__settings">
          <ImageUploadZone
            label="Обложка слота"
            value={coverUrl}
            onChange={setCoverUrl}
            hint="Миниатюра в боковой навигации админки"
          />
          <div className="admin-field">
            <span className="admin-label">
              Пересоздать раздел с нуля ({TEMPLATE_LABELS[templateType]})
            </span>
            <TemplatePicker selected={templateType} onSelect={handleTemplateSelect} />
          </div>
        </div>
      ) : null}

      <div className="slot-workspace__canvas">
        <SlideCanvas
          key={`${templateType}-${initial.id}`}
          content={content}
          orientation={previewOrientation}
          onChange={setContent}
        />
      </div>

      <ConfirmDialog
        open={pendingTemplate !== null}
        title="Сменить шаблон?"
        message={`При смене на «${pendingTemplate ? TEMPLATE_LABELS[pendingTemplate] : ""}» текущее содержание будет сброшено.`}
        variant="warning"
        confirmLabel="Сменить шаблон"
        onConfirm={() => pendingTemplate && applyTemplateChange(pendingTemplate)}
        onCancel={() => setPendingTemplate(null)}
      />
    </div>
  );
}
