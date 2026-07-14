export type MediaKind = "image" | "video" | "audio" | "pdf" | "presentation";

export interface MediaSlide {
  index: number;
  url: string;
}

export interface MediaRef {
  url: string;
  kind: MediaKind;
  mimeType?: string;
  title?: string;
  posterUrl?: string;
  slides?: MediaSlide[];
}

export interface MediaUploadResult {
  url: string;
  kind: MediaKind;
  mimeType: string;
  size: number;
  posterUrl?: string;
  slides?: MediaSlide[];
}

const EXT_KIND_MAP: Record<string, MediaKind> = {
  jpg: "image",
  jpeg: "image",
  png: "image",
  webp: "image",
  gif: "image",
  mp4: "video",
  webm: "video",
  mp3: "audio",
  wav: "audio",
  ogg: "audio",
  m4a: "audio",
  pdf: "pdf",
  pptx: "presentation",
};

export function inferKindFromUrl(url: string): MediaKind {
  const clean = url.split("?")[0].split("#")[0];
  const ext = clean.split(".").pop()?.toLowerCase() ?? "";
  return EXT_KIND_MAP[ext] ?? "image";
}

export function mediaRefFromUrl(url: string, extra?: Partial<MediaRef>): MediaRef {
  return {
    url,
    kind: extra?.kind ?? inferKindFromUrl(url),
    mimeType: extra?.mimeType,
    title: extra?.title,
    posterUrl: extra?.posterUrl,
    slides: extra?.slides,
  };
}

export function normalizeMediaRef(
  input: string | MediaRef | null | undefined
): MediaRef | null {
  if (!input) return null;
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return null;
    return mediaRefFromUrl(trimmed);
  }
  if (!input.url?.trim()) return null;
  return {
    url: input.url,
    kind: input.kind ?? inferKindFromUrl(input.url),
    mimeType: input.mimeType,
    title: input.title,
    posterUrl: input.posterUrl,
    slides: input.slides,
  };
}

export function getMediaThumbnailUrl(media: MediaRef): string | null {
  if (media.kind === "presentation" && media.slides?.[0]?.url) {
    return media.slides[0].url;
  }
  if (media.posterUrl) {
    return media.posterUrl;
  }
  if (media.kind === "image") {
    return media.url;
  }
  return null;
}

export function mediaRefToStorageValue(media: MediaRef | null): string {
  if (!media?.url) return "";
  if (media.kind === "image" && !media.slides?.length && !media.posterUrl) {
    return media.url;
  }
  return JSON.stringify(media);
}

export function parseStoredMediaValue(value: string | null | undefined): MediaRef | null {
  if (!value?.trim()) return null;
  if (value.startsWith("{")) {
    try {
      const parsed = JSON.parse(value) as MediaRef;
      return normalizeMediaRef(parsed);
    } catch {
      return normalizeMediaRef(value);
    }
  }
  return normalizeMediaRef(value);
}
