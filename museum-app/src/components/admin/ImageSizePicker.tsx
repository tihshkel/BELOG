"use client";

import type { ImageSize } from "@/lib/section-content";
import { IMAGE_SIZE_LABELS } from "@/lib/section-content";

const SIZES: ImageSize[] = ["small", "medium", "large", "full"];

interface ImageSizePickerProps {
  value: ImageSize;
  onChange: (size: ImageSize) => void;
  label?: string;
  compact?: boolean;
}

export function ImageSizePicker({ value, onChange, label = "Размер на экране", compact }: ImageSizePickerProps) {
  return (
    <div className={`admin-size-picker${compact ? " admin-size-picker--compact" : ""}`}>
      <p className="admin-label">{label}</p>
      <div className="admin-size-picker__options" role="radiogroup" aria-label={label}>
        {SIZES.map((size) => (
          <button
            key={size}
            type="button"
            role="radio"
            aria-checked={value === size}
            className={`admin-size-picker__btn${value === size ? " admin-size-picker__btn--active" : ""}`}
            onClick={() => onChange(size)}
          >
            <span className={`admin-size-picker__preview admin-size-picker__preview--${size}`} aria-hidden />
            <span className="admin-size-picker__label">{IMAGE_SIZE_LABELS[size]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
