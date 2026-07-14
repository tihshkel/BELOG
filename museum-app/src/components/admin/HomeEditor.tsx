"use client";

import { useState } from "react";
import type { ScreenOrientation } from "@/lib/types";
import { useAdminToast } from "./AdminToast";
import { mediaRefToStorageValue } from "@/lib/section-content";
import { MediaUploadZone } from "./MediaUploadZone";
import { RichTextEditor } from "./RichTextEditor";

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
  const items = initialData.filter((item) => item.hotspotType === "logo");
  const [localItems, setLocalItems] = useState(items);
  const [saving, setSaving] = useState<string | null>(null);

  const updateItem = (hotspotType: string, field: string, value: string) => {
    setLocalItems((prev) =>
      prev.map((item) =>
        item.hotspotType === hotspotType ? { ...item, [field]: value } : item
      )
    );
  };

  const saveItem = async (item: HomeContentItem) => {
    setSaving(item.hotspotType);
    try {
      const res = await fetch("/api/home-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          screenId: orientation,
          hotspotType: item.hotspotType,
          title: item.title,
          contentJson: item.contentJson,
          contentHtml: item.contentHtml,
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
          Клик по логотипу на киоске открывает эту историю · экран:{" "}
          {orientation === "horizontal" ? "горизонтальный" : "вертикальный"}
        </p>
      </header>

      {localItems.map((item) => (
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

          <MediaUploadZone
            label="Главное медиа (слева в окне)"
            value={item.mediaUrl}
            onChange={(media) => updateItem(item.hotspotType, "mediaUrl", mediaRefToStorageValue(media))}
          />

          <div className="admin-field">
            <label className="admin-label">Текст и фотографии</label>
            <p className="admin-page-head__sub" style={{ marginBottom: "0.75rem" }}>
              Форматируйте текст, вставляйте изображения и ссылки на источники. Изменения
              сразу отобразятся на киоске после сохранения.
            </p>
            <RichTextEditor
              content={item.contentJson ?? ""}
              fallbackHtml={item.contentHtml ?? ""}
              placeholder="История организации, этапы развития, источники..."
              onChange={(json, html) => {
                setLocalItems((prev) =>
                  prev.map((i) =>
                    i.hotspotType === item.hotspotType
                      ? { ...i, contentJson: json, contentHtml: html }
                      : i
                  )
                );
              }}
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
