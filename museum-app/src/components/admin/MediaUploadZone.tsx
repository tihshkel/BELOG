"use client";

import Image from "next/image";
import type { MediaRef } from "@/lib/media";
import { getMediaThumbnailUrl, normalizeMediaRef, parseStoredMediaValue } from "@/lib/media";
import { MEDIA_ACCEPT_STRING, MEDIA_KIND_ICONS, MEDIA_KIND_LABELS } from "@/lib/media-constants";
import { uploadMediaFile } from "@/lib/upload-media";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { PdfThumbnail } from "@/components/kiosk/media/PdfThumbnail";

interface MediaUploadZoneProps {
  label?: string;
  value?: string | MediaRef | null;
  onChange: (media: MediaRef) => void;
  onClear?: () => void;
  hint?: string;
}

export async function uploadImageFile(file: File): Promise<string> {
  const result = await uploadMediaFile(file);
  return result.url;
}

export { uploadMediaFile };

export function MediaUploadZone({ label, value, onChange, onClear, hint }: MediaUploadZoneProps) {
  const media =
    typeof value === "string" || value === null || value === undefined
      ? parseStoredMediaValue(value ?? "")
      : normalizeMediaRef(value);

  const handleFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    try {
      const result = await uploadMediaFile(file);
      onChange({
        url: result.url,
        kind: result.kind,
        mimeType: result.mimeType,
        posterUrl: result.posterUrl,
        slides: result.slides,
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Не удалось загрузить файл");
    }
  };

  const thumbnail = media ? getMediaThumbnailUrl(media) : null;

  return (
    <div className="admin-upload">
      {label ? <p className="admin-upload__label">{label}</p> : null}
      <div className="admin-upload__zone admin-upload__zone--media">
        {media?.url ? (
          <div className="admin-upload__preview admin-upload__preview--media">
            {thumbnail && media.kind === "image" ? (
              <Image src={thumbnail} alt="" fill className="object-contain p-2" unoptimized={thumbnail.endsWith(".svg")} />
            ) : thumbnail ? (
              <Image src={thumbnail} alt="" fill className="object-contain p-2" unoptimized />
            ) : media.kind === "pdf" ? (
              <PdfThumbnail url={media.url} className="admin-upload__pdf-thumb" />
            ) : media.kind === "video" ? (
              <video
                className="admin-upload__video-thumb"
                src={media.url}
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              <div className="admin-upload__media-placeholder">
                <MaterialIcon name={MEDIA_KIND_ICONS[media.kind]} size={40} />
                <span>{MEDIA_KIND_LABELS[media.kind]}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="admin-upload__media-empty">
            <MaterialIcon name="upload_file" size={32} />
            <p className="admin-upload__placeholder">Нажмите, чтобы выбрать файл</p>
            <p className="admin-upload__placeholder-sub">Фото, видео, PDF, аудио или PPTX</p>
          </div>
        )}
        <input
          type="file"
          accept={MEDIA_ACCEPT_STRING}
          className="admin-upload__input"
          onChange={(e) => void handleFile(e.target.files)}
        />
      </div>
      {media?.url ? (
        <p className="admin-upload__meta">
          {MEDIA_KIND_LABELS[media.kind]}
          {media.slides?.length ? ` · ${media.slides.length} слайдов` : ""}
        </p>
      ) : null}
      {hint ? <p className="admin-upload__hint">{hint}</p> : null}
      {media?.url ? (
        <button
          type="button"
          className="admin-btn-secondary admin-upload__change"
          onClick={() => (onClear ? onClear() : onChange({ url: "", kind: "image" }))}
        >
          Убрать файл
        </button>
      ) : null}
    </div>
  );
}

export function ImageUploadZone(props: Omit<MediaUploadZoneProps, "onChange"> & { onChange: (url: string) => void }) {
  return (
    <MediaUploadZone
      {...props}
      onChange={(media) => props.onChange(media.url)}
    />
  );
}
