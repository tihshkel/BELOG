"use client";

import Image from "next/image";
import type { MediaRef } from "@/lib/media";
import { getMediaThumbnailUrl } from "@/lib/media";
import { MEDIA_KIND_ICONS, MEDIA_KIND_LABELS } from "@/lib/media-constants";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { PdfThumbnail } from "./PdfThumbnail";

interface MediaTileProps {
  media: MediaRef;
  title?: string;
  caption?: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  onClick?: () => void;
  /** Whole tile is a button (kiosk). */
  asButton?: boolean;
  /** Floating open control that does not block slide drag (admin). */
  openControl?: boolean;
}

export function MediaTile({
  media,
  title,
  caption,
  className = "",
  imageClassName = "",
  sizes = "100vw",
  onClick,
  asButton = Boolean(onClick),
  openControl = false,
}: MediaTileProps) {
  const label = title || caption || media.title || MEDIA_KIND_LABELS[media.kind];
  const thumbnail = getMediaThumbnailUrl(media);
  const interactive = Boolean(onClick);

  const visual = (() => {
    if (thumbnail) {
      return (
        <Image
          src={thumbnail}
          alt={label}
          fill
          sizes={sizes}
          className="media-tile__image"
          unoptimized={thumbnail.endsWith(".svg") || thumbnail.startsWith("data:")}
        />
      );
    }

    if (media.kind === "pdf") {
      return <PdfThumbnail url={media.url} alt={label} className="media-tile__pdf-thumb" />;
    }

    if (media.kind === "video") {
      return (
        <video
          className="media-tile__video-preview"
          src={media.url}
          muted
          playsInline
          preload="metadata"
          aria-label={label}
        />
      );
    }

    if (media.kind === "audio") {
      return (
        <div className="media-tile__icon-wrap media-tile__icon-wrap--audio">
          <MaterialIcon name="headphones" size={48} />
          <span className="media-tile__kind-title">Аудио</span>
        </div>
      );
    }

    return (
      <div className="media-tile__icon-wrap">
        <MaterialIcon name={MEDIA_KIND_ICONS[media.kind]} size={48} />
      </div>
    );
  })();

  const content = (
    <>
      <div className={`media-tile__visual media-tile__visual--${media.kind} ${imageClassName}`}>
        {visual}

        {media.kind === "video" ? (
          <span className="media-tile__play" aria-hidden>
            <MaterialIcon name="play_circle" size={56} />
          </span>
        ) : null}

        {media.kind === "audio" ? (
          <span className="media-tile__audio-badge">
            <MaterialIcon name="headphones" size={20} />
            Послушать
          </span>
        ) : null}

        {media.kind === "presentation" ? (
          <span className="media-tile__badge">Презентация</span>
        ) : null}

        {media.kind === "pdf" ? (
          <span className="media-tile__badge media-tile__badge--pdf">PDF</span>
        ) : null}

        {interactive && !openControl ? (
          <span className="media-tile__open" aria-hidden>
            <MaterialIcon name="open_in_full" size={22} />
          </span>
        ) : null}

        {openControl && onClick ? (
          <button
            type="button"
            className="media-tile__open-btn"
            aria-label={`Открыть: ${label}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onClick();
            }}
          >
            <MaterialIcon name="open_in_full" size={20} />
            <span>Открыть</span>
          </button>
        ) : null}
      </div>

      {caption ? <p className="media-tile__caption">{caption}</p> : null}
      {!caption && title && media.kind !== "image" ? (
        <p className="media-tile__caption">{title}</p>
      ) : null}
    </>
  );

  const classes = [
    "media-tile",
    `media-tile--${media.kind}`,
    interactive ? "media-tile--interactive" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (asButton && onClick && !openControl) {
    return (
      <button
        type="button"
        className={classes}
        onClick={onClick}
        aria-label={`Открыть: ${label}`}
      >
        {content}
      </button>
    );
  }

  return <div className={classes}>{content}</div>;
}
