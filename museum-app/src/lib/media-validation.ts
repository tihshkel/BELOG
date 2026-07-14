import { fileTypeFromBuffer } from "file-type";
import path from "path";
import type { MediaKind, MediaUploadResult } from "./media";
import { MEDIA_SIZE_LIMITS } from "./media-constants";

const EXT_KIND: Record<string, MediaKind> = {
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

const MIME_KIND: Record<string, MediaKind> = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "image",
  "video/mp4": "video",
  "video/webm": "video",
  "audio/mpeg": "audio",
  "audio/wav": "audio",
  "audio/ogg": "audio",
  "audio/mp3": "audio",
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "presentation",
};

export class MediaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaValidationError";
  }
}

export async function detectMediaKind(
  buffer: Buffer,
  filename: string,
  declaredMime?: string
): Promise<{ kind: MediaKind; mimeType: string; ext: string }> {
  const detected = await fileTypeFromBuffer(buffer);
  const extFromName = path.extname(filename).replace(".", "").toLowerCase();

  const mimeType = detected?.mime ?? declaredMime ?? "application/octet-stream";
  const ext = detected?.ext ?? extFromName;

  let kind = MIME_KIND[mimeType] ?? EXT_KIND[ext] ?? EXT_KIND[extFromName];

  if (!kind && extFromName === "pptx") {
    kind = "presentation";
  }

  if (!kind) {
    throw new MediaValidationError("Неподдерживаемый формат файла");
  }

  if (detected && MIME_KIND[detected.mime] && MIME_KIND[detected.mime] !== kind) {
    kind = MIME_KIND[detected.mime];
  }

  const allowedExts: Record<MediaKind, string[]> = {
    image: ["jpg", "jpeg", "png", "webp", "gif"],
    video: ["mp4", "webm"],
    audio: ["mp3", "mpeg", "wav", "ogg", "m4a"],
    pdf: ["pdf"],
    presentation: ["pptx"],
  };

  const normalizedExt = ext === "mpeg" ? "mp3" : ext;
  if (!allowedExts[kind].includes(normalizedExt) && !allowedExts[kind].includes(extFromName)) {
    throw new MediaValidationError(`Расширение .${ext} не подходит для типа ${kind}`);
  }

  const sizeLimit = MEDIA_SIZE_LIMITS[kind];
  if (buffer.length > sizeLimit) {
    const mb = Math.round(sizeLimit / (1024 * 1024));
    throw new MediaValidationError(`Файл слишком большой. Лимит: ${mb} МБ`);
  }

  const safeExt = extFromName || ext || (kind === "image" ? "jpg" : kind);
  return { kind, mimeType, ext: safeExt.startsWith(".") ? safeExt : `.${safeExt}` };
}

export function buildUploadPath(kind: MediaKind, filename: string): { relativeUrl: string; absolutePath: string; uploadsRoot: string } {
  const uploadsRoot = path.join(process.cwd(), "public", "uploads", kind);
  const relativeUrl = `/uploads/${kind}/${filename}`;
  const absolutePath = path.join(uploadsRoot, filename);
  return { relativeUrl, absolutePath, uploadsRoot };
}

export type { MediaUploadResult };
