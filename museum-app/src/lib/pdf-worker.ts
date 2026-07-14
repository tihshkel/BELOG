type PdfJsModule = typeof import("pdfjs-dist");

declare global {
  interface Window {
    __pdfJsLib?: PdfJsModule;
    __pdfJsReady?: Promise<PdfJsModule>;
  }
}

const PDFJS_READY_EVENT = "pdfjslib-ready";

export function getPdfJs(): Promise<PdfJsModule> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("PDF.js доступен только в браузере"));
  }

  if (window.__pdfJsLib) {
    return Promise.resolve(window.__pdfJsLib);
  }

  if (!window.__pdfJsReady) {
    window.__pdfJsReady = new Promise<PdfJsModule>((resolve, reject) => {
      const onReady = () => {
        if (window.__pdfJsLib) {
          resolve(window.__pdfJsLib);
        } else {
          reject(new Error("PDF.js не инициализировался"));
        }
      };

      window.addEventListener(PDFJS_READY_EVENT, onReady, { once: true });

      const script = document.createElement("script");
      script.type = "module";
      script.textContent = `
        import * as pdfjsLib from "/pdf.min.mjs";
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        window.__pdfJsLib = pdfjsLib;
        window.dispatchEvent(new Event("${PDFJS_READY_EVENT}"));
      `;
      script.onerror = () => reject(new Error("Не удалось загрузить PDF.js"));
      document.head.appendChild(script);
    });
  }

  return window.__pdfJsReady;
}
