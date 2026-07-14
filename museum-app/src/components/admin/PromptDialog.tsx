"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

interface PromptDialogProps {
  open: boolean;
  title: string;
  message?: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export function PromptDialog({
  open,
  title,
  message,
  label,
  placeholder = "https://",
  defaultValue = "",
  confirmLabel = "Добавить",
  cancelLabel = "Отмена",
  onConfirm,
  onCancel,
}: PromptDialogProps) {
  const titleId = useId();
  const messageId = useId();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (!open) return;
    setValue(defaultValue);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, defaultValue, onCancel]);

  if (!open) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  };

  return (
    <div className="admin-modal-backdrop" role="presentation" onClick={onCancel}>
      <form
        className="admin-modal admin-modal--prompt"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={message ? messageId : undefined}
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="admin-modal__header">
          <div className="admin-modal__icon-wrap admin-modal__icon-wrap--info">
            <MaterialIcon name="link" size={22} />
          </div>
          <div className="admin-modal__copy">
            <h2 id={titleId} className="admin-modal__title">
              {title}
            </h2>
            {message ? (
              <p id={messageId} className="admin-modal__message">
                {message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="admin-modal__field">
          <label className="admin-modal__label" htmlFor={inputId}>
            {label}
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="url"
            className="admin-modal__input"
            value={value}
            placeholder={placeholder}
            onChange={(event) => setValue(event.target.value)}
          />
        </div>

        <div className="admin-modal__actions">
          <button type="button" className="admin-modal__btn admin-modal__btn--cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="submit" className="admin-modal__btn admin-modal__btn--confirm admin-modal__btn--info" disabled={!value.trim()}>
            {confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
