"use client";

import ConfirmModal from "@/app/components/ui/admin/ConfirmModal";
import React, { useState } from "react";

interface SingleRestoreActionProps {
  endpoint: string;

  title?: string;
  itemName?: string;
  itemId?: number;

  icon?: string;
  confirmIcon?: string;

  description?: string;
  warning?: string;

  extraClasses?: string;
  btnText?: string;

  restoreButtonText?: string;
  confirmText?: string;
  cancelText?: string;

  onSuccess?: () => void;
  onError?: (message: string) => void;
}

function SingleRestoreAction({
  endpoint,

  title = "بازیابی مورد",

  itemName,
  itemId,

  icon = "fa fa-trash-restore",
  confirmIcon = "fa fa-rotate-left",

  description = "آیا از بازیابی این مورد مطمئن هستید؟",

  extraClasses = "",
  btnText = "",

  warning = "این مورد از سطل زباله خارج شده و به لیست اصلی بازگردانده می‌شود.",

  restoreButtonText = "بازیابی",

  confirmText = "بله، بازیابی شود",
  cancelText = "انصراف",

  onSuccess,
  onError,
}: SingleRestoreActionProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  /*
   * Open Modal
   */
  const openModal = () => {
    if (loading) {
      return;
    }

    setOpen(true);
  };

  /*
   * Close Modal
   */
  const closeModal = () => {
    if (loading) {
      return;
    }

    setOpen(false);
  };

  /*
   * Get CSRF Token
   */
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

  /*
   * Restore
   */
  const handleRestore = async () => {
    if (loading) {
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
            "X-Requested-With": "XMLHttpRequest",
          },

          credentials: "include",
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(errorData?.message || "خطا در بازیابی مورد.");
      }

      setOpen(false);

      onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "خطا در بازیابی مورد.";

      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        disabled={loading}
        title={restoreButtonText}
        className={`flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50 gap-2 dark:bg-green-50/5 dark:text-green-400 dark:hover:bg-green-100/10 ${extraClasses}`}
      >
        {loading ? (
          <i className="fa fa-spinner fa-spin"></i>
        ) : (
          <i className="fa fa-rotate-left"></i>
        )}
        {btnText}
      </button>

      <ConfirmModal
        open={open}
        title={title}
        itemName={itemName}
        itemId={itemId}
        icon={icon}
        confirmIcon={confirmIcon}
        description={description}
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

export default SingleRestoreAction;
