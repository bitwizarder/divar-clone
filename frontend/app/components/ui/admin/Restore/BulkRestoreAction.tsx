"use client";

import React, { useState } from "react";
import ConfirmModal from "../ConfirmModal";

interface BulkRestoreActionProps {
  selectedIds: number[];
  endpoint: string;

  title?: string;
  itemName?: string;

  icon?: string;
  confirmIcon?: string;

  description?: string;
  warning?: string;

  restoreButtonText?: string;
  confirmText?: string;
  cancelText?: string;

  onSuccess?: () => void;
  onError?: (message: string) => void;
}

function BulkRestoreAction({
  selectedIds,
  endpoint,

  title = "بازیابی موارد انتخاب‌شده",

  itemName,

  icon = "fa fa-trash-restore",
  confirmIcon = "fa fa-rotate-left",

  description,
  warning = "موارد انتخاب‌شده از سطل زباله خارج و به لیست اصلی بازگردانده می‌شوند.",

  restoreButtonText = "بازیابی انتخاب‌شده‌ها",

  confirmText = "بله، بازیابی شوند",
  cancelText = "انصراف",

  onSuccess,
  onError,
}: BulkRestoreActionProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!selectedIds.length) {
    return null;
  }

  const openModal = () => {
    if (loading) {
      return;
    }

    setOpen(true);
  };

  const closeModal = () => {
    if (loading) {
      return;
    }

    setOpen(false);
  };

  const getCsrfToken = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/sanctum/csrf-cookie`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error("خطا در دریافت CSRF token.");
    }

    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("XSRF-TOKEN="))
      ?.split("=")[1];

    if (!csrfToken) {
      throw new Error("CSRF token موجود نیست.");
    }

    return decodeURIComponent(csrfToken);
  };

  const handleRestore = async () => {
    if (!selectedIds.length || loading) {
      return;
    }

    setLoading(true);

    try {
      const csrfToken = await getCsrfToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
        {
          method: "PATCH",

          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-XSRF-TOKEN": csrfToken,
          },

          credentials: "include",

          body: JSON.stringify({
            ids: selectedIds,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || "خطا در بازیابی موارد انتخاب‌شده.",
        );
      }

      setOpen(false);

      onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "خطا در بازیابی موارد انتخاب‌شده.";

      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  const defaultItemName = itemName || `${selectedIds.length} مورد`;

  const defaultDescription =
    description ||
    `آیا از بازیابی ${selectedIds.length} مورد انتخاب‌شده مطمئن هستید؟`;

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-color bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-hover text-icon">
            <i className="fa fa-check"></i>
          </div>

          <p className="text-sm font-semibold text-primary">
            {selectedIds.length} مورد انتخاب شده
          </p>
        </div>

        <button
          type="button"
          onClick={openModal}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-success px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {loading ? (
            <>
              <i className="fa fa-spinner fa-spin"></i>
              در حال بازیابی...
            </>
          ) : (
            <>
              <i className="fa fa-rotate-left"></i>
              {restoreButtonText}
            </>
          )}
        </button>
      </div>

      <ConfirmModal
        open={open}
        title={title}
        itemName={defaultItemName}
        icon={icon}
        confirmIcon={confirmIcon}
        description={defaultDescription}
        warning={warning}
        confirmText={confirmText}
        cancelText={cancelText}
        confirmBg="bg-success"
        loading={loading}
        onConfirm={handleRestore}
        onCancel={closeModal}
      />
    </>
  );
}

export default BulkRestoreAction;
