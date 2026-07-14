"use client";

import { useEffect, useRef, useState } from "react";
import { getPdfJs } from "@/lib/pdf-worker";

interface PdfThumbnailProps {
  url: string;
  className?: string;
  alt?: string;
}

const thumbnailCache = new Map<string, string>();

export function PdfThumbnail({ url, className = "", alt = "PDF" }: PdfThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [src, setSrc] = useState<string | null>(() => thumbnailCache.get(url) ?? null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (thumbnailCache.has(url)) {
      setSrc(thumbnailCache.get(url) ?? null);
      setFailed(false);
      return;
    }

    let cancelled = false;

    const render = async () => {
      try {
        const pdfjs = await getPdfJs();
        const response = await fetch(url);
        if (!response.ok) throw new Error("Не удалось загрузить PDF");
        const data = await response.arrayBuffer();
        const doc = await pdfjs.getDocument({ data }).promise;
        const page = await doc.getPage(1);
        const base = page.getViewport({ scale: 1 });
        const scale = Math.min(480 / base.width, 360 / base.height, 1.5);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current ?? document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas unavailable");
        await page
          .render({
            canvasContext: ctx,
            canvas,
            viewport,
          } as Parameters<typeof page.render>[0])
          .promise;
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        thumbnailCache.set(url, dataUrl);
        if (!cancelled) {
          setSrc(dataUrl);
          setFailed(false);
        }
        await doc.destroy();
      } catch {
        if (!cancelled) setFailed(true);
      }
    };

    void render();
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (failed) {
    return <div className={`pdf-thumbnail pdf-thumbnail--failed ${className}`} aria-label={alt} />;
  }

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={`pdf-thumbnail ${className}`} draggable={false} />
    );
  }

  return (
    <div className={`pdf-thumbnail pdf-thumbnail--loading ${className}`} aria-busy>
      <canvas ref={canvasRef} hidden />
    </div>
  );
}
