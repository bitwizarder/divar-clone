"use client";

import React, { useState } from "react";
import ConfirmModal from "./ConfirmModal";

interface BulkDeleteActionProps {
  selectedIds: number[];
  endpoint: string;

  title?: string;
  itemName?: string;

  description?: string;
  warning?: string;

  deleteButtonText?: string;
  confirmText?: string;
  cancelText?: string;

  onSuccess?: () => void;
  onError?: (message: string) => void;
}

function BulkDeleteAction({
  selectedIds, 
  endpoint,

  title = "حذف موارد انتخاب‌شده",

  itemName,

  description,

  warning = "این عملیات قابل بازگشت نیست.",

  deleteButtonText = "حذف انتخاب‌شده‌ها",

  confirmText = "بله، حذف شوند",

  cancelText = "انصراف",

  onSuccess,

  onError,
}: BulkDeleteActionProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  /*
   * =========================================================
   * OPEN MODAL
   * =========================================================
   */

  const openModal = () => {
    if (loading || !selectedIds.length) {
      return;
    }

    setOpen(true);
  };

  /*
   * =========================================================
   * CLOSE MODAL
   * =========================================================
   */

  const closeModal = () => {
    if (loading) {
      return;
    }

    setOpen(false);
  };

  /*
   * =========================================================
   * GET CSRF TOKEN
   * =========================================================
   */

  const getCsrfToken = async (): Promise<string> => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!apiBaseUrl) {
      throw new Error("آدرس API تنظیم نشده است.");
    }

    const csrfResponse = await fetch(
      `${apiBaseUrl}/sanctum/csrf-cookie`,
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
   * =========================================================
   * BULK DELETE
   * =========================================================
   */

  const handleDelete = async () => {
    if (!selectedIds.length || loading) {
      return;
    }

    setLoading(true);

    try {
      /*
       * Get API Base URL
       */
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

      if (!apiBaseUrl) {
        throw new Error("آدرس API تنظیم نشده است.");
      }

      /*
       * Get CSRF Token
       */
      const csrfToken = await getCsrfToken();

      /*
       * Bulk Delete Request
       */
      const response = await fetch(
        `${apiBaseUrl}${endpoint}`,
        {
          method: "DELETE",

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

      /*
       * Handle API Error
       */
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => null);

        throw new Error(
          errorData?.message ||
            "خطا در حذف موارد انتخاب‌شده.",
        );
      }

      /*
       * Close Modal
       */
      setOpen(false);

      /*
       * Success Callback
       *
       * مسئولیت:
       * - Refresh
       * - Navigation
       * - Reset Selection
       *
       * بر عهده کامپوننت والد است.
       */
      onSuccess?.();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "خطا در حذف موارد انتخاب‌شده.";

      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  /*
   * =========================================================
   * EMPTY SELECTION
   * =========================================================
   */

  if (!selectedIds.length) {
    return null;
  }

  /*
   * =========================================================
   * DEFAULT VALUES
   * =========================================================
   */

  const defaultItemName =
    itemName || `${selectedIds.length} مورد`;

  const defaultDescription =
    description ||
    `آیا از حذف ${selectedIds.length} مورد انتخاب‌شده مطمئن هستید؟`;

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <>
      {/* =====================================================
          ACTION BAR
      ===================================================== */}

      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-color bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-hover text-icon">
            <i className="fa fa-check"></i>
          </div>

          <div>
            <p className="text-sm font-semibold text-primary">
              {selectedIds.length} مورد انتخاب شده
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openModal}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-text-btn transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {loading ? (
            <>
              <i className="fa fa-spinner fa-spin"></i>
              در حال حذف...
            </>
          ) : (
            <>
              <i className="fa fa-trash"></i>
              {deleteButtonText}
            </>
          )}
        </button>
      </div>

      {/* =====================================================
          CONFIRM MODAL
      ===================================================== */}

      <ConfirmModal
        open={open}
        title={title}
        itemName={defaultItemName}
        icon="fa fa-folder-open"
        description={defaultDescription}
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

export default BulkDeleteAction;
