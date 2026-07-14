import type { MediaUploadResult } from "./media";

export async function uploadMediaFile(file: File): Promise<MediaUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? "Ошибка загрузки");
  }
  return res.json() as Promise<MediaUploadResult>;
}
