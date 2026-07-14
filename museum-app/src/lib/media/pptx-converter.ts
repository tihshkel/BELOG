import { execFile } from "child_process";
import { mkdir, readdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";
import { promisify } from "util";
import type { MediaSlide } from "../media";

const execFileAsync = promisify(execFile);

async function commandExists(command: string): Promise<boolean> {
  try {
    await execFileAsync("which", [command]);
    return true;
  } catch {
    return false;
  }
}

async function convertWithLibreOffice(pptxPath: string, workDir: string): Promise<MediaSlide[]> {
  const hasSoffice = await commandExists("soffice");
  const hasPdftoppm = await commandExists("pdftoppm");

  if (!hasSoffice || !hasPdftoppm) {
    throw new Error("LibreOffice или pdftoppm не установлены");
  }

  await execFileAsync("soffice", ["--headless", "--convert-to", "pdf", "--outdir", workDir, pptxPath]);

  const pdfName = `${path.basename(pptxPath, path.extname(pptxPath))}.pdf`;
  const pdfPath = path.join(workDir, pdfName);
  const slidesDir = path.join(workDir, "slides");
  await mkdir(slidesDir, { recursive: true });

  const prefix = path.join(slidesDir, "slide");
  await execFileAsync("pdftoppm", ["-png", pdfPath, prefix]);

  const files = (await readdir(slidesDir))
    .filter((f) => f.startsWith("slide") && f.endsWith(".png"))
    .sort();

  if (files.length === 0) {
    throw new Error("Не удалось извлечь слайды из презентации");
  }

  const publicSlidesDir = path.join(process.cwd(), "public", "uploads", "presentation", "slides");
  await mkdir(publicSlidesDir, { recursive: true });
  const presentationId = path.basename(pptxPath, path.extname(pptxPath));

  const slides: MediaSlide[] = [];
  for (let i = 0; i < files.length; i++) {
    const src = path.join(slidesDir, files[i]);
    const destName = `${presentationId}-${String(i + 1).padStart(2, "0")}.png`;
    const dest = path.join(publicSlidesDir, destName);
    const buffer = await readFile(src);
    await writeFile(dest, buffer);
    slides.push({ index: i, url: `/uploads/presentation/slides/${destName}` });
  }

  return slides;
}

async function convertWithOfficeParser(pptxPath: string): Promise<MediaSlide[]> {
  const { parseOffice } = await import("officeparser");
  const buffer = await readFile(pptxPath);
  const ast = await parseOffice(buffer);

  const publicSlidesDir = path.join(process.cwd(), "public", "uploads", "presentation", "slides");
  await mkdir(publicSlidesDir, { recursive: true });
  const presentationId = path.basename(pptxPath, path.extname(pptxPath));

  const slideTexts: string[] = [];
  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    const record = node as Record<string, unknown>;
    if (typeof record.text === "string" && record.text.trim()) {
      slideTexts.push(record.text.trim());
    }
    Object.values(record).forEach(walk);
  };
  walk(ast);

  const chunks =
    slideTexts.length > 0
      ? slideTexts
      : ["Презентация загружена. Для полного предпросмотра установите LibreOffice на сервере."];
  const slides: MediaSlide[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const escaped = chunks[i]
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <rect width="100%" height="100%" fill="#f7f9fb"/>
  <text x="80" y="120" font-family="Arial, sans-serif" font-size="42" fill="#1a2332">Слайд ${i + 1}</text>
  <foreignObject x="80" y="180" width="1120" height="480">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial,sans-serif;font-size:28px;color:#2e3744;line-height:1.45;white-space:pre-wrap;">${escaped}</div>
  </foreignObject>
</svg>`;
    const destName = `${presentationId}-${String(i + 1).padStart(2, "0")}.svg`;
    const dest = path.join(publicSlidesDir, destName);
    await writeFile(dest, svg, "utf8");
    slides.push({ index: i, url: `/uploads/presentation/slides/${destName}` });
  }

  return slides;
}

export async function convertPptxToSlides(pptxPath: string): Promise<MediaSlide[]> {
  const workDir = path.join(path.dirname(pptxPath), `${path.basename(pptxPath, path.extname(pptxPath))}-work`);
  await mkdir(workDir, { recursive: true });

  try {
    try {
      return await convertWithLibreOffice(pptxPath, workDir);
    } catch {
      return await convertWithOfficeParser(pptxPath);
    }
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}
