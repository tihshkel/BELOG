"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ScreenOrientation } from "@/lib/types";
import type { ProjectTheme } from "@/lib/project-theme";
import { HomeEditor } from "./HomeEditor";
import { ProjectThemeEditor } from "./ProjectThemeEditor";
import { StateSymbolsEditor } from "./StateSymbolsEditor";

interface HomeContentItem {
  id: string;
  screenId: string;
  hotspotType: string;
  title: string | null;
  contentJson: string | null;
  contentHtml: string | null;
  mediaUrl: string | null;
}

interface SiteSettingsEditorProps {
  horizontalData: HomeContentItem[];
  verticalData: HomeContentItem[];
  initialTheme: ProjectTheme;
}

type SiteTab = "appearance" | "history" | "symbols";

export function SiteSettingsEditor({
  horizontalData,
  verticalData,
  initialTheme,
}: SiteSettingsEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orientation = (searchParams.get("orientation") === "vertical" ? "vertical" : "horizontal") as ScreenOrientation;
  const rawTab = searchParams.get("tab");
  const tab: SiteTab =
    rawTab === "history" || rawTab === "symbols" ? rawTab : "appearance";

  const [localOrientation, setLocalOrientation] = useState<ScreenOrientation>(orientation);
  const [localTab, setLocalTab] = useState<SiteTab>(tab);

  useEffect(() => {
    setLocalOrientation(orientation);
    setLocalTab(tab);
  }, [orientation, tab]);

  const updateQuery = useCallback(
    (nextOrientation: ScreenOrientation, nextTab: SiteTab) => {
      const params = new URLSearchParams();
      if (nextOrientation === "vertical") params.set("orientation", "vertical");
      if (nextTab !== "appearance") params.set("tab", nextTab);
      const query = params.toString();
      router.replace(query ? `/admin/site?${query}` : "/admin/site");
    },
    [router]
  );

  const handleOrientationChange = (next: ScreenOrientation) => {
    setLocalOrientation(next);
    updateQuery(next, localTab);
  };

  const handleTabChange = (next: SiteTab) => {
    setLocalTab(next);
    updateQuery(localOrientation, next);
  };

  const data = localOrientation === "horizontal" ? horizontalData : verticalData;

  return (
    <div className="admin-site-settings">
      <header className="admin-page-head">
        <h1 className="admin-page-head__title">Настройки сайта</h1>
        <p className="admin-page-head__sub">
          Оформление киоска, история по логотипу и государственные символы
        </p>
      </header>

      <div className="admin-site-settings__orientation">
        <span className="admin-label">Ориентация экрана</span>
        <div className="admin-segmented" role="tablist" aria-label="Ориентация экрана">
          <button
            type="button"
            role="tab"
            aria-selected={localOrientation === "horizontal"}
            className={`admin-segmented__btn${localOrientation === "horizontal" ? " admin-segmented__btn--active" : ""}`}
            onClick={() => handleOrientationChange("horizontal")}
          >
            Горизонтальный
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={localOrientation === "vertical"}
            className={`admin-segmented__btn${localOrientation === "vertical" ? " admin-segmented__btn--active" : ""}`}
            onClick={() => handleOrientationChange("vertical")}
          >
            Вертикальный
          </button>
        </div>
      </div>

      <div className="admin-site-settings__tabs" role="tablist" aria-label="Разделы настроек">
        <button
          type="button"
          role="tab"
          aria-selected={localTab === "appearance"}
          className={`admin-steps__btn${localTab === "appearance" ? " admin-steps__btn--active" : ""}`}
          onClick={() => handleTabChange("appearance")}
        >
          Оформление
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={localTab === "history"}
          className={`admin-steps__btn${localTab === "history" ? " admin-steps__btn--active" : ""}`}
          onClick={() => handleTabChange("history")}
        >
          История по логотипу
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={localTab === "symbols"}
          className={`admin-steps__btn${localTab === "symbols" ? " admin-steps__btn--active" : ""}`}
          onClick={() => handleTabChange("symbols")}
        >
          Государственные символы
        </button>
      </div>

      <div className="admin-site-settings__panel">
        {localTab === "appearance" ? (
          <ProjectThemeEditor initialTheme={initialTheme} />
        ) : localTab === "history" ? (
          <HomeEditor orientation={localOrientation} initialData={data} />
        ) : (
          <StateSymbolsEditor orientation={localOrientation} initialData={data} />
        )}
      </div>
    </div>
  );
}
