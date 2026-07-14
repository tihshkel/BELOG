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

const symbolLabels: Record<string, string> = {
  flag: "Государственный флаг",
  emblem: "Государственный герб",
  anthem: "Государственный гимн",
};

interface StateSymbolsEditorProps {
  orientation: ScreenOrientation;
  initialData: HomeContentItem[];
}

export function StateSymbolsEditor({ orientation, initialData }: StateSymbolsEditorProps) {
  const { showToast } = useAdminToast();
  const symbolTypes = ["flag", "emblem", "anthem"];
  const items = initialData.filter((item) => symbolTypes.includes(item.hotspotType));
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
    <div className="admin-editor admin-editor--symbols">
      {localItems.map((item) => (
        <div key={item.hotspotType} className="admin-card admin-editor__card">
          <h3 className="admin-editor__block-title">
            {symbolLabels[item.hotspotType] ?? item.hotspotType}
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
            label={item.hotspotType === "anthem" ? "Гимн (аудио или изображение)" : "Медиа"}
            value={item.mediaUrl}
            onChange={(media) => updateItem(item.hotspotType, "mediaUrl", mediaRefToStorageValue(media))}
            hint={item.hotspotType === "anthem" ? "Загрузите MP3 или обложку" : undefined}
          />

          <div className="admin-field">
            <label className="admin-label">Текст</label>
            <RichTextEditor
              content={item.contentHtml ?? ""}
              onChange={(html) => updateItem(item.hotspotType, "contentHtml", html)}
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
