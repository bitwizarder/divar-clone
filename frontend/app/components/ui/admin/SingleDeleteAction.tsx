"use client";

import React, { useState } from "react";
import ConfirmModal from "./ConfirmModal";

interface DeleteActionProps {
  endpoint: string;

  title?: string;
  itemName?: string;
  itemId?: number | string;
  icon?: string;

  description?: string;
  warning?: string;

  btnText?: string;
  extraClasses?: string;

  deleteButtonText?: string;
  confirmText?: string;
  cancelText?: string;

  onSuccess?: () => void;
  onError?: (message: string) => void;
}

function SingleDeleteAction({
  endpoint,

  title = "حذف مورد",

  itemName,
  itemId,
  icon = "fa fa-trash",

  btnText = "",

  description = "آیا از حذف این مورد مطمئن هستید؟",

  warning = "این عملیات قابل بازگشت نیست.",

  deleteButtonText = "حذف",

  confirmText = "بله، حذف شود",
  cancelText = "انصراف",

  extraClasses = "",

  onSuccess,
  onError,
}: DeleteActionProps) {
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
    const csrfResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/sanctum/csrf-cookie`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    if (!csrfResponse.ok) {
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
   * Delete Item
   */
  const handleDelete = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      /*
       * Get CSRF Token
       */
      const csrfToken = await getCsrfToken();

      /*
       * Delete Request
       */
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
        {
          method: "DELETE",

          headers: {
            Accept: "application/json",
            "X-XSRF-TOKEN": csrfToken,
          },

          credentials: "include",
        },
      );

      /*
       * Handle API Error
       */
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(errorData?.message || "خطا در حذف مورد.");
      }

      /*
       * Close Modal
       */
      setOpen(false);

      /*
       * Success Callback
       *
       * Refresh / Navigation / State
       * توسط کامپوننت والد مدیریت می‌شود.
       */
      onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "خطا در حذف مورد.";

      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* =====================================================
          DELETE BUTTON
      ===================================================== */}

      <button
        type="button"
        onClick={openModal}
        disabled={loading}
        title={deleteButtonText}
        className={`flex gap-2 h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100 dark:bg-red-50/5 dark:text-red-400 dark:hover:bg-red-100/10 disabled:cursor-not-allowed disabled:opacity-50 ${extraClasses}`}
      >
        {loading ? (
          <i className="fa fa-spinner fa-spin"></i>
        ) : (
          <i className="fa fa-trash"></i>
        )}
        {btnText}
      </button>

      {/* =====================================================
          CONFIRM MODAL
      ===================================================== */}

      <ConfirmModal
        open={open}
        title={title}
        itemName={itemName}
        itemId={itemId}
        icon={icon}
        description={description}
        warning={warning}
        confirmText={confirmText}
        cancelText={cancelText}
        loading={loading}
        onConfirm={handleDelete}
        onCancel={closeModal}
      />
    </>
  );
}

export default SingleDeleteAction;
