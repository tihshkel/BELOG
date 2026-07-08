"use client";

import Image from "next/image";

interface ImageUploadZoneProps {
  label?: string;
  value?: string | null;
  onChange: (url: string) => void;
  hint?: string;
}

export async function uploadImageFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Ошибка загрузки");
  const data = await res.json();
  return data.url as string;
}

export function ImageUploadZone({ label, value, onChange, hint }: ImageUploadZoneProps) {
  const handleFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    try {
      const url = await uploadImageFile(file);
      onChange(url);
    } catch {
      alert("Не удалось загрузить фото. Попробуйте ещё раз.");
    }
  };

  return (
    <div className="admin-upload">
      {label ? <p className="admin-upload__label">{label}</p> : null}
      <div className="admin-upload__zone">
        {value ? (
          <div className="admin-upload__preview">
            <Image src={value} alt="" fill className="object-contain p-2" />
          </div>
        ) : (
          <p className="admin-upload__placeholder">Нажмите, чтобы выбрать фото</p>
        )}
        <input
          type="file"
          accept="image/*"
          className="admin-upload__input"
          onChange={(e) => handleFile(e.target.files)}
        />
      </div>
      {hint ? <p className="admin-upload__hint">{hint}</p> : null}
      {value ? (
        <button type="button" className="admin-btn-secondary admin-upload__change" onClick={() => onChange("")}>
          Убрать фото
        </button>
      ) : null}
    </div>
  );
}
