import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import type { MediaUploadResult } from "@/lib/media";
import { buildUploadPath, detectMediaKind, MediaValidationError } from "@/lib/media-validation";
import { convertPptxToSlides } from "@/lib/media/pptx-converter";
import { generatePdfPoster } from "@/lib/media/pdf-poster";

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifySession(token);
}

export async function POST(request: Request) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Файл не выбран" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { kind, mimeType, ext } = await detectMediaKind(buffer, file.name, file.type);

    const filename = `${crypto.randomUUID()}${ext.startsWith(".") ? ext : `.${ext}`}`;
    const { relativeUrl, absolutePath, uploadsRoot } = buildUploadPath(kind, filename);
    await mkdir(uploadsRoot, { recursive: true });
    await writeFile(absolutePath, buffer);

    const result: MediaUploadResult = {
      url: relativeUrl,
      kind,
      mimeType,
      size: buffer.length,
    };

    if (kind === "presentation") {
      const slides = await convertPptxToSlides(absolutePath);
      result.slides = slides;
    }

    if (kind === "pdf") {
      const posterUrl = await generatePdfPoster(absolutePath);
      if (posterUrl) result.posterUrl = posterUrl;
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof MediaValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Не удалось загрузить файл" }, { status: 500 });
  }
}
