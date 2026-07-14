"use client";

import { useEffect, useId, useRef } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export type DialogVariant = "danger" | "warning" | "info";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  variant?: DialogVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_DEFAULTS: Record<
  DialogVariant,
  { icon: string; confirmLabel: string; iconClass: string }
> = {
  danger: {
    icon: "delete",
    confirmLabel: "Удалить",
    iconClass: "admin-modal__icon-wrap--danger",
  },
  warning: {
    icon: "warning",
    confirmLabel: "Продолжить",
    iconClass: "admin-modal__icon-wrap--warning",
  },
  info: {
    icon: "info",
    confirmLabel: "Понятно",
    iconClass: "admin-modal__icon-wrap--info",
  },
};

export function ConfirmDialog({
  open,
  title,
  message,
  variant = "danger",
  confirmLabel,
  cancelLabel = "Отмена",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const messageId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);
  const defaults = VARIANT_DEFAULTS[variant];

  useEffect(() => {
    if (!open) return;

    confirmRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="admin-modal-backdrop"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="admin-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-modal__header">
          <div className={`admin-modal__icon-wrap ${defaults.iconClass}`}>
            <MaterialIcon name={defaults.icon} size={22} filled />
          </div>
          <div className="admin-modal__copy">
            <h2 id={titleId} className="admin-modal__title">
              {title}
            </h2>
            <p id={messageId} className="admin-modal__message">
              {message}
            </p>
          </div>
        </div>

        <div className="admin-modal__actions">
          <button type="button" className="admin-modal__btn admin-modal__btn--cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={`admin-modal__btn admin-modal__btn--confirm admin-modal__btn--${variant}`}
            onClick={onConfirm}
          >
            {confirmLabel ?? defaults.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
