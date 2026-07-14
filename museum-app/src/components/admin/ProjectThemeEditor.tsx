"use client";

import { useState } from "react";
import {
  PROJECT_FONT_OPTIONS,
  type ProjectTheme,
} from "@/lib/project-theme";
import { useAdminToast } from "./AdminToast";
import { MediaUploadZone } from "./MediaUploadZone";

interface ProjectThemeEditorProps {
  initialTheme: ProjectTheme;
}

export function ProjectThemeEditor({ initialTheme }: ProjectThemeEditorProps) {
  const { showToast } = useAdminToast();
  const [theme, setTheme] = useState(initialTheme);
  const [saving, setSaving] = useState(false);

  const setColor = (index: number, color: string) => {
    setTheme((current) => ({
      ...current,
      colors: current.colors.map((item, itemIndex) =>
        itemIndex === index ? color : item
      ),
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(theme),
      });
      if (!response.ok) throw new Error();
      showToast("Оформление сохранено");
    } catch {
      showToast("Не удалось сохранить оформление", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-template-form">
      <div className="admin-theme-backgrounds">
        <MediaUploadZone
          label="Фон горизонтального экрана"
          value={theme.backgroundHorizontal}
          onChange={(media) => {
            if (media.kind !== "image") {
              showToast("Для фона выберите изображение", "error");
              return;
            }
            setTheme((current) => ({
              ...current,
              backgroundHorizontal: media.url,
            }));
          }}
          hint="Соотношение сторон 952 × 535"
        />
        <MediaUploadZone
          label="Фон вертикального экрана"
          value={theme.backgroundVertical}
          onChange={(media) => {
            if (media.kind !== "image") {
              showToast("Для фона выберите изображение", "error");
              return;
            }
            setTheme((current) => ({
              ...current,
              backgroundVertical: media.url,
            }));
          }}
          hint="Соотношение сторон 616 × 1096"
        />
      </div>

      <div className="admin-field">
        <span className="admin-label">Палитра проекта</span>
        <div className="admin-theme-colors">
          {theme.colors.map((color, index) => (
            <label key={index} className="admin-theme-color">
              <input
                type="color"
                value={color}
                onChange={(event) => setColor(index, event.target.value)}
              />
              <span>{color.toUpperCase()}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="admin-theme-fonts">
        <label className="admin-field">
          <span className="admin-label">Основной шрифт</span>
          <select
            className="admin-input"
            value={theme.fontBody}
            onChange={(event) =>
              setTheme((current) => ({
                ...current,
                fontBody: event.target.value,
              }))
            }
          >
            {PROJECT_FONT_OPTIONS.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-field">
          <span className="admin-label">Акцентный шрифт</span>
          <select
            className="admin-input"
            value={theme.fontDisplay}
            onChange={(event) =>
              setTheme((current) => ({
                ...current,
                fontDisplay: event.target.value,
              }))
            }
          >
            {PROJECT_FONT_OPTIONS.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="button"
        className="admin-btn-primary"
        onClick={() => void save()}
        disabled={saving}
      >
        {saving ? "Сохранение…" : "Сохранить оформление"}
      </button>
    </div>
  );
}
