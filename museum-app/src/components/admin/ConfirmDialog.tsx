"use client";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Удалить",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal">
        <h2 className="admin-modal__title">{title}</h2>
        <p className="admin-modal__message">{message}</p>
        <div className="admin-modal__actions">
          <button type="button" className="admin-btn-ghost" onClick={onCancel}>
            Отмена
          </button>
          <button type="button" className="admin-btn-primary admin-btn-primary--danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
