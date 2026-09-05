"use client";

import React, { useEffect } from "react";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  itemName?: string;
  itemId?: number | string;
  icon?: string;
  description?: string;
  warning?: string;
  confirmText?: string;
  confirmIcon?: string;
  confirmBg?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({
  open,
  title = "تأیید عملیات",
  itemName,
  itemId,
  icon = "fa fa-trash",
  description = "آیا از انجام این عملیات مطمئن هستید؟",
  warning = "این عملیات قابل بازگشت نیست.",
  confirmText = "بله، انجام شود",
  confirmIcon = "fa fa-trash",
  confirmBg = "bg-accent",
  cancelText = "انصراف",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // جلوگیری از اسکرول صفحه در هنگام باز بودن Modal
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, loading, onCancel]);

  if (!open) {
    return null;
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !loading) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="w-full max-w-md overflow-hidden rounded-3xl bg-surface shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-color px-5 py-4 sm:px-6">
          <h2
            id="confirm-modal-title"
            className="text-lg font-bold text-primary"
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            aria-label="بستن"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-secondary transition hover:bg-gray-100 dark:hover:bg-gray-100/10 hover:text-gray-700 dark:hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <i className="fa fa-times"></i>
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-6 sm:px-6">
          {/* Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-hover text-icon">
            <i className={`${icon} text-2xl`}></i>
          </div>

          <div className="mt-5 text-center">
            <h3 className="text-lg font-bold text-primary">{description}</h3>

            {itemName && (
              <p className="mt-3 text-sm leading-7 text-gray">
                مورد زیر برای انجام عملیات انتخاب شده است:
              </p>
            )}

            {/* Selected Item */}
            {itemName && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-color dark:border-color bg-hover p-4 text-right">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-white/10 text-icon shadow-sm">
                  <i className={`${icon} text-base`}></i>
                </div>

                <div className="min-w-0">
                  <p className="truncate font-bold text-secondary">
                    {itemName}
                  </p>

                  {itemId !== undefined && (
                    <p className="mt-1 text-xs text-gray">شناسه: #{itemId}</p>
                  )}
                </div>
              </div>
            )}

            {/* Warning */}
            {warning && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-100 dark:bg-amber-100/10 p-3 text-right">
                <i className="fa fa-exclamation-triangle mt-0.5 shrink-0 text-amber-500 dark:text-amber-500"></i>

                <p className="text-xs leading-6 text-amber-700 dark:text-amber-500">
                  {warning}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-color bg-gray-50 dark:bg-gray-50/5 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-full rounded-xl border border-gray-200 bg-white dark:bg-white/5 px-5 py-3 text-sm font-medium text-secondary transition hover:bg-gray-100/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex w-full items-center justify-center gap-2 rounded-xl ${confirmBg} px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto`}
          >
            {loading ? (
              <>
                <i className="fa fa-spinner fa-spin"></i>
                در حال انجام...
              </>
            ) : (
              <>
                <i className={confirmIcon}></i>
                {confirmText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
