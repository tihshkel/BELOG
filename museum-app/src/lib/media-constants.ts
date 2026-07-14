import type { MediaKind } from "./media";

export const MEDIA_SIZE_LIMITS: Record<MediaKind, number> = {
  image: 10 * 1024 * 1024,
  video: 200 * 1024 * 1024,
  audio: 30 * 1024 * 1024,
  pdf: 25 * 1024 * 1024,
  presentation: 80 * 1024 * 1024,
};

export const MEDIA_ACCEPT_STRING =
  "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,audio/mpeg,audio/wav,audio/ogg,audio/mp3,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,.pptx";

export const MEDIA_KIND_LABELS: Record<MediaKind, string> = {
  image: "Изображение",
  video: "Видео",
  audio: "Аудио",
  pdf: "PDF",
  presentation: "Презентация",
};

export const MEDIA_KIND_ICONS: Record<MediaKind, string> = {
  image: "image",
  video: "videocam",
  audio: "music_note",
  pdf: "picture_as_pdf",
  presentation: "slideshow",
};
