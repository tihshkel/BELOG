"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getPdfJs } from "@/lib/pdf-worker";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

interface PdfViewerProps {
  url: string;
}

interface PdfRenderTask {
  cancel: () => void;
  promise: Promise<void>;
}

export function PdfViewer({ url }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<{ numPages: number; getPage: (n: number) => Promise<unknown> } | null>(null);
  const renderTaskRef = useRef<PdfRenderTask | null>(null);
  const renderGenRef = useRef(0);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [docReady, setDocReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cancelRender = useCallback(() => {
    renderTaskRef.current?.cancel();
    renderTaskRef.current = null;
    renderGenRef.current += 1;
  }, []);

  const renderPage = useCallback(
    async (pageNum: number) => {
      const doc = pdfDocRef.current;
      const canvas = canvasRef.current;
      if (!doc || !canvas) return;

      cancelRender();
      const gen = renderGenRef.current;

      const pdfPage = (await doc.getPage(pageNum)) as {
        getViewport: (opts: { scale: number }) => { width: number; height: number };
        render: (ctx: {
          canvasContext: CanvasRenderingContext2D;
          viewport: { width: number; height: number };
        }) => PdfRenderTask;
      };

      if (gen !== renderGenRef.current) return;

      const viewport = pdfPage.getViewport({ scale: 1.5 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx || gen !== renderGenRef.current) return;

      const task = pdfPage.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = task;

      try {
        await task.promise;
      } catch (err) {
        if (gen === renderGenRef.current) {
          const message = err instanceof Error ? err.message : String(err);
          if (!message.includes("cancelled") && !message.includes("canceled")) {
            throw err;
          }
        }
      } finally {
        if (gen === renderGenRef.current && renderTaskRef.current === task) {
          renderTaskRef.current = null;
        }
      }
    },
    [cancelRender]
  );

  useEffect(() => {
    let cancelled = false;
    cancelRender();
    pdfDocRef.current = null;
    setDocReady(false);
    setLoading(true);
    setError(null);
    setPage(1);
    setTotalPages(0);

    async function load() {
      try {
        const pdfjs = await getPdfJs();
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.arrayBuffer();

        const task = pdfjs.getDocument({ data });
        const doc = await task.promise;
        if (cancelled) return;

        pdfDocRef.current = doc;
        setTotalPages(doc.numPages);
        setDocReady(true);
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          console.error("PDF load failed:", err);
          setError("Не удалось открыть PDF");
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
      cancelRender();
      pdfDocRef.current = null;
    };
  }, [url, cancelRender]);

  useEffect(() => {
    if (!docReady || page < 1 || !pdfDocRef.current) return;

    void renderPage(page).catch((err) => {
      console.error("PDF render failed:", err);
      setError("Не удалось отобразить страницу PDF");
    });

    return () => {
      cancelRender();
    };
  }, [docReady, page, renderPage, cancelRender]);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  if (error) {
    return <p className="media-preview__error">{error}</p>;
  }

  return (
    <div className="media-preview__pdf">
      <div className="media-preview__pdf-canvas-wrap">
        {loading ? <p className="media-preview__loading">Загрузка…</p> : null}
        <canvas ref={canvasRef} className="media-preview__pdf-canvas" />
      </div>

      {totalPages > 1 ? (
        <div className="media-preview__pdf-nav">
          <button type="button" className="media-preview__nav-btn" onClick={goPrev} disabled={page <= 1} aria-label="Предыдущая страница">
            <MaterialIcon name="chevron_left" size={32} />
          </button>
          <span className="media-preview__counter">
            {page} / {totalPages}
          </span>
          <button type="button" className="media-preview__nav-btn" onClick={goNext} disabled={page >= totalPages} aria-label="Следующая страница">
            <MaterialIcon name="chevron_right" size={32} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
