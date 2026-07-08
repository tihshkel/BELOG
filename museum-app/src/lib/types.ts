export type ScreenOrientation = "horizontal" | "vertical";
export type HotspotType = "flag" | "emblem" | "logo";
export type SectionTemplate = "article" | "photo_story" | "gallery" | "timeline";

export interface Screen {
  id: ScreenOrientation;
  name: string;
}

export interface HomeContent {
  id: string;
  screenId: ScreenOrientation;
  hotspotType: HotspotType;
  title: string | null;
  contentJson: string | null;
  contentHtml: string | null;
  mediaUrl: string | null;
  updatedAt: string;
}

export interface Section {
  id: string;
  title: string;
  coverUrl: string | null;
  templateType: SectionTemplate;
  contentJson: string | null;
  contentHtml: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KioskData {
  homeContent: HomeContent[];
  sections: Section[];
  updatedAt: string;
}
