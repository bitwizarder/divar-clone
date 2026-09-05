"use client";

import BulkRestoreAction from "@/app/components/ui/admin/Restore/BulkRestoreAction";
import SingleRestoreAction from "@/app/components/ui/admin/Restore/SingleRestoreAction";
import SingleDeleteAction from "@/app/components/ui/admin/SingleDeleteAction";
import { PageListResponse } from "@/app/types/page";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { converterToJalali } from "@/app/helpers/date";
import BulkDeleteAction from "@/app/components/ui/admin/BulkDeleteAction";

function PageTrashList({ pages }: { pages: PageListResponse }) {
  const [error, setError] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const selectAllRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  /*
   * Selection
   */

  const allSelected =
    pages.data.length > 0 && selectedIds.length === pages.data.length;

  const someSelected =
    selectedIds.length > 0 && selectedIds.length < pages.data.length;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const togglePage = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(pages.data.map((page) => page.id));
  };

  /*
   * Empty State
   */

  if (!pages.data?.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-color bg-surface px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-hover text-icon">
          <i className="fa fa-trash text-xl"></i>
        </div>

        <h3 className="mt-4 text-base font-bold text-primary">
          سطل زباله خالی است
        </h3>

        <p className="mt-2 text-sm text-secondary">
          هیچ صفحه حذف‌شده‌ای وجود ندارد.
        </p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-danger bg-danger/5 p-4 text-danger">
          <i className="fa fa-exclamation-circle mt-0.5"></i>

          <div>
            <p className="font-medium">خطا</p>

            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Bulk Restore */}

      <BulkRestoreAction
        selectedIds={selectedIds}
        endpoint="/api/admin/content/page/trash/restore"
        title="بازیابی صفحه‌ها"
        itemName={`${selectedIds.length} صفحه`}
        description={`آیا از بازیابی ${selectedIds.length} صفحه انتخاب‌شده مطمئن هستید؟`}
        warning="صفحه‌های انتخاب‌شده از سطل زباله خارج و به لیست اصلی بازگردانده می‌شوند."
        onSuccess={() => {
          setSelectedIds([]);
          setError(null);

          router.push("/admin/page/trash/?restoresSuccess=1");
        }}
        onError={(message) => {
          setError(message);
        }}
      />

      {/* =====================================================
        BULK DELETE (Permanent)
      ===================================================== */}

      <BulkDeleteAction
        selectedIds={selectedIds}
        endpoint="/api/admin/content/page/trash"
        title="حذف دائمی صفحه‌ها"
        itemName={`${selectedIds.length} صفحه`}
        description={`آیا از حذف دائمی ${selectedIds.length} صفحه انتخاب‌شده مطمئن هستید؟`}
        warning="هشدار: این عملیات غیرقابل بازگشت است و صفحه‌ها برای همیشه از پایگاه داده حذف خواهند شد."
        deleteButtonText="حذف دائمی انتخاب‌شده‌ها"
        confirmText="بله، برای همیشه حذف شوند"
        cancelText="انصراف"
        onSuccess={() => {
          setSelectedIds([]);
          setError(null);
          router.push("/admin/page/trash?forceDeletesSuccess=1");
          router.refresh();
        }}
        onError={(message) => {
          setError(message);
        }}
      />

      {/* Desktop */}

      <div className="hidden overflow-hidden rounded-2xl border border-color bg-surface text-primary shadow-sm lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 text-right">
            <thead>
              <tr className="border-b border-color bg-surface">
                <th className="w-14 px-3 py-4">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="انتخاب همه"
                    className="appearance-none relative h-5 w-5 cursor-pointer rounded border border-color bg-hover transition-all checked:border-accent checked:bg-hover before:absolute before:inset-0 before:flex before:items-center before:justify-center before:font-bold before:text-sm before:text-accent before:opacity-0 before:content-['✓'] checked:before:opacity-100 focus:ring-0"
                  />
                </th>

                <th className="px-3 py-4 text-xs font-semibold">ردیف</th>

                <th className="px-3 py-4 text-xs font-semibold">شناسه</th>

                <th className="px-3 py-4 text-xs font-semibold">عنوان صفحه</th>

                <th className="px-3 py-4 text-xs font-semibold">بدنه اصلی</th>

                <th className="px-3 py-4 text-xs font-semibold">مسیر</th>

                <th className="px-3 py-4 text-xs font-semibold">تاریخ حذف</th>

                <th className="px-3 py-4 text-xs font-semibold">عملیات</th>
              </tr>
            </thead>

            <tbody>
              {pages.data.map((page, index) => {
                const isSelected = selectedIds.includes(page.id);

                return (
                  <tr
                    key={page.id}
                    className={`border-b border-color last:border-0 hover:bg-hover ${
                      isSelected ? "bg-hover" : ""
                    }`}
                  >
                    <td className="px-3 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => togglePage(page.id)}
                        aria-label={`انتخاب ${page.title}`}
                        className="appearance-none relative h-5 w-5 cursor-pointer rounded border border-color bg-hover transition-all checked:border-accent checked:bg-hover before:absolute before:inset-0 before:flex before:items-center before:justify-center before:font-bold before:text-sm before:text-accent before:opacity-0 before:content-['✓'] checked:before:opacity-100 focus:ring-0"
                      />
                    </td>

                    <td className="px-3 py-4 text-sm text-gray">
                      <span className="font-bold">{index + 1}</span>
                    </td>

                    <td className="px-3 py-4">
                      <span className="rounded-lg bg-hover px-2.5 py-1 text-xs font-medium">
                        #{page.id}
                      </span>
                    </td>

                    {/* Title */}
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-primary">
                            {page.title}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Body */}
                    <td className="px-3 py-4">
                      <span className="text-sm line-clamp-2 text-secondary">
                        {page.body || "-"}
                      </span>
                    </td>

                    {/* URL */}
                    <td className="max-w-xs px-3 py-4">
                      <p className="line-clamp-2 text-sm text-secondary">
                        {page.url || "-"}
                      </p>
                    </td>

                    <td className="px-3 py-4 text-sm text-secondary">
                      {converterToJalali(page.deleted_at)}
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex items-center gap-2">
                        <SingleRestoreAction
                          endpoint={`/api/admin/content/page/trash/${page.id}/restore`}
                          title="بازیابی صفحه"
                          itemName={page.title}
                          itemId={page.id}
                          icon={"fa fa-newspaper"}
                          onSuccess={() => {
                            setError(null);
                            router.push("/admin/page/trash/?restoreSuccess=1");
                          }}
                          onError={(message) => {
                            setError(message);
                          }}
                        />

                        <SingleDeleteAction
                          endpoint={`/api/admin/content/page/trash/${page.id}`}
                          title="حذف دائمی صفحه"
                          itemName={page.title}
                          itemId={page.id}
                          icon="fa fa-trash"
                          description="آیا از حذف دائمی این صفحه مطمئن هستید؟"
                          warning="هشدار: این عملیات غیرقابل بازگشت است و صفحه برای همیشه از پایگاه داده حذف خواهد شد."
                          deleteButtonText="حذف دائمی"
                          confirmText="بله، برای همیشه حذف شود"
                          cancelText="انصراف"
                          onSuccess={() => {
                            setSelectedIds((prev) =>
                              prev.filter((id) => id !== page.id),
                            );

                            setError(null);

                            router.push(
                              "/admin/page/trash/?forceDeleteSuccess=1",
                            );
                            router.refresh();
                          }}
                          onError={(message) => {
                            setError(message);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile */}

      <div className="grid grid-cols-1 gap-4 lg:hidden">
        <div className="flex items-center justify-between rounded-2xl border border-color bg-surface px-4 py-3">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              ref={selectAllRef}
              checked={allSelected}
              onChange={toggleAll}
              aria-label="انتخاب همه"
              className="appearance-none relative h-5 w-5 cursor-pointer rounded border border-color bg-hover before:absolute before:inset-0 before:flex before:items-center before:justify-center before:text-sm before:font-bold before:text-accent before:opacity-0 before:content-['✓'] checked:before:opacity-100"
            />

            <span className="text-sm font-medium text-primary">انتخاب همه</span>
          </label>

          <span className="text-xs text-muted">
            {selectedIds.length > 0
              ? `${selectedIds.length} انتخاب شده`
              : `${pages.data.length} مورد`}
          </span>
        </div>

        {pages.data.map((page) => {
          const isSelected = selectedIds.includes(page.id);

          return (
            <div
              key={page.id}
              className={`rounded-2xl border border-color bg-surface p-4 shadow-sm ${
                isSelected ? "bg-hover" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => togglePage(page.id)}
                  aria-label={`انتخاب ${page.title}`}
                  className="appearance-none relative mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border border-color bg-hover before:absolute before:inset-0 before:flex before:items-center before:justify-center before:text-sm before:font-bold before:text-accent before:opacity-0 before:content-['✓'] checked:before:opacity-100"
                />

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-hover text-icon">
                  <i className="fa-solid fa-newspaper"></i>
                </div>

                <div className="min-w-0">
                  <h3 className="truncate font-bold text-primary">
                    {page.title}
                  </h3>

                  <p className="mt-1 text-xs text-muted">شناسه #{page.id}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {/* Url */}
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted">مسیر</p>

                  <p className="mt-1 text-sm line-clamp-3 leading-6 text-secondary">
                    {page.url || "مسیری ثبت نشده است."}
                  </p>
                </div>

                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted">تاریخ حذف</p>
                  <p className="mt-1 text-sm font-medium text-secondary">
                    {converterToJalali(page.deleted_at)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2 border-t border-color pt-4">
                <SingleRestoreAction
                  endpoint={`/api/admin/content/page/trash/${page.id}/restore`}
                  title="بازیابی صفحه"
                  itemName={page.title}
                  icon={"fa fa-newspaper"}
                  itemId={page.id}
                  extraClasses="flex-1"
                  btnText="بازیابی"
                  onSuccess={() => {
                    window.location.reload();
                  }}
                  onError={(message) => {
                    setError(message);
                  }}
                />

                <SingleDeleteAction
                  endpoint={`/api/admin/content/page/trash/${page.id}`}
                  title="حذف دائمی صفحه"
                  itemName={page.title}
                  itemId={page.id}
                  icon="fa fa-trash"
                  btnText="حذف"
                  extraClasses="flex-1"
                  description="آیا از حذف دائمی این صفحه مطمئن هستید؟"
                  warning="این عملیات غیرقابل بازگشت است."
                  deleteButtonText="حذف دائمی"
                  confirmText="بله، برای همیشه حذف شود"
                  cancelText="انصراف"
                  onSuccess={() => {
                    window.location.reload();
                  }}
                  onError={(message) => {
                    setError(message);
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default PageTrashList;
