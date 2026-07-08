"use client";

import { useState } from "react";
import type { ScreenOrientation } from "@/lib/types";
import { useAdminToast } from "./AdminToast";
import { ImageUploadZone } from "./ImageUploadZone";

interface HomeContentItem {
  id: string;
  screenId: string;
  hotspotType: string;
  title: string | null;
  contentJson: string | null;
  contentHtml: string | null;
  mediaUrl: string | null;
}

const hotspotLabels: Record<string, string> = {
  flag: "Флаг и гимн",
  emblem: "Герб РБ — законы и указы",
  logo: "Логотип — история музея",
};

interface HomeEditorProps {
  orientation: ScreenOrientation;
  initialData: HomeContentItem[];
}

export function HomeEditor({ orientation, initialData }: HomeEditorProps) {
  const { showToast } = useAdminToast();
  const [items, setItems] = useState(initialData);
  const [saving, setSaving] = useState<string | null>(null);

  const updateItem = (hotspotType: string, field: string, value: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.hotspotType === hotspotType ? { ...item, [field]: value } : item
      )
    );
  };

  const saveItem = async (item: HomeContentItem) => {
    setSaving(item.hotspotType);
    try {
      const html = item.contentHtml ?? "";
      const res = await fetch("/api/home-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          screenId: orientation,
          hotspotType: item.hotspotType,
          title: item.title,
          contentJson: item.contentJson,
          contentHtml: html,
          mediaUrl: item.mediaUrl,
        }),
      });
      if (!res.ok) throw new Error();
      showToast("Сохранено");
    } catch {
      showToast("Ошибка сохранения", "error");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="admin-editor">
      <header className="admin-page-head">
        <h1 className="admin-page-head__title">Главная страница</h1>
        <p className="admin-page-head__sub">
          Экран: {orientation === "horizontal" ? "горизонтальный" : "вертикальный"}
        </p>
      </header>

      {items.map((item) => (
        <div key={item.hotspotType} className="admin-card admin-editor__card">
          <h3 className="admin-editor__block-title">
            {hotspotLabels[item.hotspotType] ?? item.hotspotType}
          </h3>

          <div className="admin-field">
            <label className="admin-label">Заголовок</label>
            <input
              type="text"
              value={item.title ?? ""}
              onChange={(e) => updateItem(item.hotspotType, "title", e.target.value)}
              className="admin-input admin-input--large"
            />
          </div>

          <ImageUploadZone
            label="Изображение"
            value={item.mediaUrl}
            onChange={(url) => updateItem(item.hotspotType, "mediaUrl", url)}
          />

          <div className="admin-field">
            <label className="admin-label">Текст</label>
            <textarea
              className="admin-textarea"
              rows={12}
              value={stripHtml(item.contentHtml ?? "")}
              onChange={(e) => {
                const html = e.target.value
                  .split("\n\n")
                  .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
                  .join("");
                setItems((prev) =>
                  prev.map((i) =>
                    i.hotspotType === item.hotspotType
                      ? { ...i, contentHtml: html }
                      : i
                  )
                );
              }}
              placeholder="Введите текст. Пустая строка между абзацами — новый абзац."
            />
          </div>

          <button
            type="button"
            onClick={() => saveItem(item)}
            disabled={saving === item.hotspotType}
            className="admin-btn-primary admin-btn-primary--large"
          >
            {saving === item.hotspotType ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      ))}
    </div>
  );
}

function stripHtml(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}
