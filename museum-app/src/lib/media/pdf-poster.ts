import { execFile } from "child_process";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

async function commandExists(command: string): Promise<boolean> {
  try {
    await execFileAsync("which", [command]);
    return true;
  } catch {
    return false;
  }
}

/** First page of a PDF as a public poster image, or null if pdftoppm is unavailable. */
export async function generatePdfPoster(pdfAbsolutePath: string): Promise<string | null> {
  if (!(await commandExists("pdftoppm"))) {
    return null;
  }

  const id = path.basename(pdfAbsolutePath, path.extname(pdfAbsolutePath));
  const workDir = path.join(os.tmpdir(), `belog-pdf-${id}-${Date.now()}`);
  await mkdir(workDir, { recursive: true });

  try {
    const prefix = path.join(workDir, "page");
    await execFileAsync("pdftoppm", [
      "-png",
      "-f",
      "1",
      "-l",
      "1",
      "-singlefile",
      "-scale-to",
      "720",
      pdfAbsolutePath,
      prefix,
    ]);

    const pngPath = `${prefix}.png`;
    const buffer = await readFile(pngPath);
    const postersDir = path.join(process.cwd(), "public", "uploads", "pdf", "posters");
    await mkdir(postersDir, { recursive: true });
    const destName = `${id}-poster.png`;
    await writeFile(path.join(postersDir, destName), buffer);
    return `/uploads/pdf/posters/${destName}`;
  } catch (error) {
    console.error("PDF poster generation failed:", error);
    return null;
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => undefined);
  }
}
