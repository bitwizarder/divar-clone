"use client";

import React, { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";

import BulkDeleteAction from "../../../components/ui/admin/BulkDeleteAction";
import SingleDeleteAction from "../../../components/ui/admin/SingleDeleteAction";
import { PageListResponse } from "@/app/types/page";
import { converterToJalali } from "@/app/helpers/date";



function PageList({ pages }: { pages: PageListResponse }) {
  const router = useRouter();

  /* =========================================================
     STATE
  ========================================================= */

  const [error, setError] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const selectAllRef = useRef<HTMLInputElement | null>(null);

  /* =========================================================
     SELECTION
  ========================================================= */

  const allSelected =
    pages.data.length > 0 && selectedIds.length === pages.data.length;

  const someSelected =
    selectedIds.length > 0 && selectedIds.length < pages.data.length;

  /*
   * Set indeterminate state
   */
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  /*
   * Select / unselect one page
   */
  const togglePage = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id],
    );
  };

  /*
   * Select / unselect all pages
   */
  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(pages.data.map((page) => page.id));
  };

  /*
   * Clear selections
   */
  const clearSelection = () => {
    setSelectedIds([]);
  };

  /* =========================================================
     EMPTY STATE
  ========================================================= */

  if (!pages.data?.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-color bg-surface px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-hover text-icon">
          <i className="fa fa-folder-open text-xl"></i>
        </div>

        <h3 className="mt-4 text-base font-bold text-primary">
          صفحهای وجود ندارد
        </h3>

        <p className="mt-2 text-sm text-secondary">
          هنوز هیچ صفحهای برای نمایش ثبت نشده است.
        </p>
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-danger bg-danger/5 p-4 text-danger">
          <i className="fa fa-exclamation-circle mt-0.5"></i>

          <div>
            <p className="font-medium">خطا</p>

            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* =====================================================
          BULK DELETE
      ===================================================== */}

      <BulkDeleteAction
        selectedIds={selectedIds}
        endpoint="/api/admin/content/page/bulk"
        title="حذف صفحه‌ها"
        itemName={`${selectedIds.length} صفحه`}
        description={`آیا از حذف ${selectedIds.length} صفحه انتخاب‌شده مطمئن هستید؟`}
        warning="این عملیات قابل بازگشت نیست. در صورت وجود زیر‌صفحه، آن‌ها نیز ممکن است به‌صورت زنجیره‌ای حذف شوند."
        deleteButtonText="حذف انتخاب‌شده‌ها"
        confirmText="بله، حذف شوند"
        cancelText="انصراف"
        onSuccess={() => {
          setSelectedIds([]);
          setError(null);
          router.push("/admin/page?deletesSuccess=1");
          router.refresh();
        }}
        onError={(message) => {
          setError(message);
        }}
      />

      {/* =====================================================
          DESKTOP TABLE
      ===================================================== */}

      <div className="hidden overflow-hidden rounded-2xl border border-color bg-surface text-primary shadow-sm lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 text-right">
            <thead>
              <tr className="border-b border-color bg-surface">
                {/* Select All */}

                <th className="w-14 px-3 py-4">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="انتخاب همه صفحه‌ها"
                    className="appearance-none
                    relative
                    h-5 w-5
                    cursor-pointer
                    rounded
                    border
                    border-color dark:border-gray-dark
                    bg-hover dark:hover:bg-surface
                    transition-all
                    duration-200
                    hover:bg-muted
                    checked:border-accent
                    checked:bg-hover
                    before:absolute
                    before:inset-0
                    before:flex
                    before:items-center
                    before:justify-center
                    before:font-bold
                    before:text-sm
                    before:text-accent
                    before:opacity-0
                    before:content-['✓']
                    checked:before:opacity-100
                    focus:ring-0"
                  />
                </th>

                <th className="px-3 py-4 text-xs font-semibold">ردیف</th>

                <th className="px-3 py-4 text-xs font-semibold">شناسه</th>

                <th className="px-3 py-4 text-xs font-semibold">عنوان صفحه</th>

                <th className="px-3 py-4 text-xs font-semibold">بدنه اصلی</th>

                <th className="px-3 py-4 text-xs font-semibold">مسیر</th>

                <th className="px-3 py-4 text-xs font-semibold">اسلاگ</th>

                <th className="px-3 py-4 text-xs font-semibold">وضعیت</th>

                <th className="px-3 py-4 text-xs font-semibold">تاریخ ایجاد</th>

                <th className="px-3 py-4 text-xs font-semibold">عملیات</th>
              </tr>
            </thead>

            <tbody>
              {pages.data.map((page, index) => {
                const isSelected = selectedIds.includes(page.id);

                return (
                  <tr
                    key={page.id}
                    className={`group border-b border-color transition-colors last:border-0 hover:bg-hover ${
                      isSelected ? "bg-hover" : ""
                    }`}
                  >
                    {/* Checkbox */}

                    <td className="px-3 py-4 ">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => togglePage(page.id)}
                        aria-label={`انتخاب ${page.title}`}
                        className="appearance-none
                          relative
                          h-5 w-5
                          cursor-pointer
                          rounded
                          border
                          border-color dark:border-gray-dark
                          bg-hover dark:hover:bg-surface
                          transition-all
                          duration-200
                          hover:bg-muted
                          checked:border-accent
                          checked:bg-hover
                          before:absolute
                          before:inset-0
                          before:flex
                          before:items-center
                          before:justify-center
                          before:font-bold
                          before:text-sm
                          before:text-accent
                          before:opacity-0
                          before:content-['✓']
                          checked:before:opacity-100
                          focus:ring-0"
                      />
                    </td>

                    {/* Row */}

                    <td className="px-3 py-4 text-sm text-gray text-center">
                      <span className="font-bold">{index + 1}</span>
                    </td>

                    {/* ID */}

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
                    {/* Slug */}
                    <td className="max-w-xs px-3 py-4">
                      <p className="line-clamp-2 text-sm text-secondary">
                        {page.slug || "-"}
                      </p>
                    </td>

                    {/* Status */}

                    <td className="px-3 py-4">
                      {page.status ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 dark:bg-green-50/5 dark:text-green-500">
                          <span className="h-2 w-2 rounded-full bg-success"></span>
                          فعال
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 dark:bg-red-50/5 dark:text-red-400/90">
                          <span className="h-2 w-2 rounded-full bg-danger"></span>
                          غیرفعال
                        </span>
                      )}
                    </td>

                    {/* Date */}

                    <td className="px-3 py-4 text-sm text-secondary">
                      {converterToJalali(page.created_at)}
                    </td>

                    {/* Actions */}

                    <td className="px-3 py-4">
                      <div className="flex items-center gap-2">
                        {/* Edit */}

                        <Link
                          href={`/admin/page/edit/${page.id}`}
                          title="ویرایش"
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100 dark:bg-blue-50/5 dark:text-blue-400 dark:hover:bg-blue-100/10"
                        >
                          <i className="fa fa-pencil"></i>
                        </Link>

                        {/* Delete */}

                        <SingleDeleteAction
                          endpoint={`/api/admin/content/page/${page.id}`}
                          title="حذف صفحه"
                          itemName={page.title}
                          itemId={page.id}
                          icon="fa-solid fa-newspaper"
                          description="آیا از حذف این صفحه مطمئن هستید؟"
                          warning="این عملیات قابل بازگشت می باشد. پس از حذف، این صفحه به سطل زباله خواهد رفت."
                          deleteButtonText="حذف"
                          confirmText="بله، حذف شود"
                          cancelText="انصراف"
                          onSuccess={() => {
                            setError(null);

                            setSelectedIds((prev) =>
                              prev.filter((id) => id !== page.id),
                            );

                            router.push("/admin/page?deleteSuccess=1");
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

      {/* =====================================================
          MOBILE
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {/* Mobile Select All */}

        <div className="flex items-center justify-between rounded-2xl border border-color bg-surface px-4 py-3">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              ref={selectAllRef}
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              aria-label="انتخاب همه صفحه‌ها"
              className="appearance-none
              relative
              h-5 w-5
              cursor-pointer
              rounded
              border
              border-color dark:border-gray-dark
              bg-hover dark:hover:bg-surface
              transition-all
              duration-200
              checked:border-accent
              checked:bg-hover
              before:absolute
              before:inset-0
              before:flex
              before:items-center
              before:justify-center
              before:font-bold
              before:text-sm
              before:text-accent
              before:opacity-0
              before:content-['✓']
              checked:before:opacity-100
              focus:ring-0"
            />

            <span className="text-sm font-medium text-primary">انتخاب همه</span>
          </label>

          <span className="text-xs text-muted">
            {selectedIds.length > 0
              ? `${selectedIds.length} انتخاب شده`
              : `${pages.data.length} صفحه`}
          </span>
        </div>

        {pages.data.map((page) => {
          const isSelected = selectedIds.includes(page.id);

          return (
            <div
              key={page.id}
              className={`rounded-2xl border border-color bg-surface p-4 shadow-sm transition-shadow hover:shadow-md ${
                isSelected ? "bg-hover" : ""
              }`}
            >
              {/* Header */}

              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {/* Checkbox */}

                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => togglePage(page.id)}
                    aria-label={`انتخاب ${page.title}`}
                    className="appearance-none
                      relative
                      h-5 w-5
                      shrink-0
                      cursor-pointer
                      rounded
                      border
                      border-color dark:border-gray-dark
                      bg-hover dark:hover:bg-surface
                      transition-all
                      duration-200
                      checked:border-accent
                      checked:bg-hover
                      before:absolute
                      before:inset-0
                      before:flex
                      before:items-center
                      before:justify-center
                      before:font-bold
                      before:text-sm
                      before:text-accent
                      before:opacity-0
                      before:content-['✓']
                      checked:before:opacity-100
                      focus:ring-0"
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

                {/* Status */}

                {page.status ? (
                  <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-300/5 dark:text-green-300">
                    فعال
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-300/5 dark:text-red-300">
                    غیرفعال
                  </span>
                )}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {/* Url */}
                <div className="mt-3 rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted">مسیر</p>

                  <p className="mt-1 text-sm line-clamp-3 leading-6 text-secondary">
                    {page.url || "مسیری ثبت نشده است."}
                  </p>
                </div>

                {/* SLug */}
                <div className="mt-3 rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted">اسلاگ</p>

                  <p className="mt-1 text-sm line-clamp-3 leading-6 text-secondary">
                    {page.slug || "موقعیتی ثبت نشده است."}
                  </p>
                </div>

                {/* Date Create */}
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted">تاریخ ایجاد</p>

                  <p className="mt-1 text-sm font-medium text-secondary">
                    {converterToJalali(page.created_at)}
                  </p>
                </div>

                {/* Body */}
                <div className="rounded-xl bg-muted p-3 col-span-2">
                  <p className="text-xs text-muted">بدنه</p>

                  <p className="mt-1 line-clamp-4 text-sm font-medium text-secondary">
                    {page.body || "صفحه اصلی"}
                  </p>
                </div>
              </div>

              {/* Actions */}

              <div className="mt-4 flex gap-2 border-t border-color pt-4">
                {/* Edit */}

                <Link
                  href={`/admin/page/edit/${page.id}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-50 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-100 dark:bg-blue-50/5 dark:text-blue-400 dark:hover:bg-blue-100/10"
                >
                  <i className="fa fa-pencil"></i>
                  ویرایش
                </Link>

                {/* Delete */}

                <SingleDeleteAction
                  endpoint={`/api/admin/content/page/${page.id}`}
                  title="حذف صفحه"
                  itemName={page.title}
                  itemId={page.id}
                  icon="fa-solid fa-newspaper"
                  btnText="حذف"
                  extraClasses="flex-1"
                  description="آیا از حذف این صفحه مطمئن هستید؟"
                  warning="این عملیات قابل بازگشت می باشد. پس از حذف، این صفحه به سطل زباله خواهد رفت."
                  deleteButtonText="حذف"
                  confirmText="بله، حذف شود"
                  cancelText="انصراف"
                  onSuccess={() => {
                    setError(null);

                    setSelectedIds((prev) =>
                      prev.filter((id) => id !== page.id),
                    );

                    router.push("/admin/page/?deleteSuccess=1");
                    router.refresh();
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

export default PageList;
