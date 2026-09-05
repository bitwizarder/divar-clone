"use client";

import React, { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";

import BulkDeleteAction from "../../../components/ui/admin/BulkDeleteAction";
import SingleDeleteAction from "../../../components/ui/admin/SingleDeleteAction";
import { converterToJalali } from "@/app/helpers/date";
import { CategoryValueListResponse } from "@/app/types/categoryValue";

function CategoryValueList({ values }: { values: CategoryValueListResponse }) {
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
    values.data.length > 0 && selectedIds.length === values.data.length;

  const someSelected =
    selectedIds.length > 0 && selectedIds.length < values.data.length;

  /*
   * Set indeterminate state
   */
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  /*
   * Select / unselect one value
   */
  const toggleValue = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id],
    );
  };

  /*
   * Select / unselect all values
   */
  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(values.data.map((val) => val.id));
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

  if (!values.data?.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-color bg-surface px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-hover text-icon">
          <i className="fa fa-folder-open text-xl"></i>
        </div>

        <h3 className="mt-4 text-base font-bold text-primary">
          مقداری وجود ندارد
        </h3>

        <p className="mt-2 text-sm text-secondary">
          هنوز هیچ مقداری برای ویژگی‌های دسته‌بندی ثبت نشده است.
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
        endpoint="/api/admin/advertise/category-value/bulk"
        title="حذف مقادیر"
        itemName={`${selectedIds.length} مقدار`}
        description={`آیا از حذف ${selectedIds.length} مقدار انتخاب‌شده مطمئن هستید؟`}
        warning="این عملیات قابل بازگشت نیست. مقادیر مرتبط با ویژگی‌های دسته‌بندی نیز ممکن است تحت تأثیر قرار گیرند."
        deleteButtonText="حذف انتخاب‌شده‌ها"
        confirmText="بله، حذف شوند"
        cancelText="انصراف"
        onSuccess={() => {
          setSelectedIds([]);
          setError(null);
          router.push("/admin/category-value?deletesSuccess=1");
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
                    aria-label="انتخاب همه مقادیر"
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

                <th className="px-3 py-4 text-xs font-semibold">مقدار</th>

                <th className="px-3 py-4 text-xs font-semibold">ویژگی</th>

                <th className="px-3 py-4 text-xs font-semibold">واحد</th>

                <th className="px-3 py-4 text-xs font-semibold">نوع</th>

                <th className="px-3 py-4 text-xs font-semibold">وضعیت</th>

                <th className="px-3 py-4 text-xs font-semibold">تاریخ ایجاد</th>

                <th className="px-3 py-4 text-xs font-semibold">عملیات</th>
              </tr>
            </thead>

            <tbody>
              {values.data.map((val, index) => {
                const isSelected = selectedIds.includes(val.id);

                return (
                  <tr
                    key={val.id}
                    className={`group border-b border-color transition-colors last:border-0 hover:bg-hover ${
                      isSelected ? "bg-hover" : ""
                    }`}
                  >
                    {/* Checkbox */}

                    <td className="px-3 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleValue(val.id)}
                        aria-label={`انتخاب ${val.value}`}
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
                        #{val.id}
                      </span>
                    </td>

                    {/* Value */}

                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-hover text-icon">
                          <i
                            className={`${val.categoryAttribute?.category?.icon ?? "fa fa-list"}`}
                          ></i>
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-primary">
                            {val.value}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Attribute (ویژگی) */}

                    <td className="px-3 py-4">
                      <span className="text-sm text-secondary">
                        {val.categoryAttribute?.name || "ویژگی نامشخص"}
                      </span>
                    </td>

                    {/* Unit */}

                    <td className="px-3 py-4">
                      <span className="text-sm text-secondary">
                        {val.categoryAttribute?.unit || "-"}
                      </span>
                    </td>

                    {/* Type */}

                    <td className="px-3 py-4">
                      <span className="text-sm text-secondary">
                        {val.type === 1 ? "ویژه" : "عادی"}
                      </span>
                    </td>

                    {/* Status */}

                    <td className="px-3 py-4">
                      {val.status ? (
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
                      {converterToJalali(val.created_at)}
                    </td>

                    {/* Actions */}

                    <td className="px-3 py-4">
                      <div className="flex items-center gap-2">
                        {/* Edit */}

                        <Link
                          href={`/admin/category-value/edit/${val.id}`}
                          title="ویرایش"
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100 dark:bg-blue-50/5 dark:text-blue-400 dark:hover:bg-blue-100/10"
                        >
                          <i className="fa fa-pencil"></i>
                        </Link>

                        {/* Delete */}

                        <SingleDeleteAction
                          endpoint={`/api/admin/advertise/category-value/${val.id}`}
                          title="حذف مقدار"
                          itemName={val.value}
                          itemId={val.id}
                          icon={`${val.categoryAttribute?.category?.icon ?? "fa fa-list"}`}
                          description="آیا از حذف این مقدار مطمئن هستید؟"
                          warning="این عملیات قابل بازگشت است. پس از حذف، این مقدار به سطل زباله منتقل می‌شود."
                          deleteButtonText="حذف"
                          confirmText="بله، حذف شود"
                          cancelText="انصراف"
                          onSuccess={() => {
                            setError(null);

                            setSelectedIds((prev) =>
                              prev.filter((id) => id !== val.id),
                            );

                            router.push(
                              "/admin/category-value?deleteSuccess=1",
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
              aria-label="انتخاب همه مقادیر"
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
              : `${values.data.length} مقدار`}
          </span>
        </div>

        {values.data.map((val) => {
          const isSelected = selectedIds.includes(val.id);

          return (
            <div
              key={val.id}
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
                    onChange={() => toggleValue(val.id)}
                    aria-label={`انتخاب ${val.value}`}
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
                    <i
                      className={`${val.categoryAttribute?.category?.icon ?? "fa fa-list"}`}
                    ></i>
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-primary">
                      {val.value}
                    </h3>

                    <p className="mt-1 text-xs text-muted">شناسه #{val.id}</p>
                  </div>
                </div>

                {/* Status */}

                {val.status ? (
                  <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-300/5 dark:text-green-300">
                    فعال
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-300/5 dark:text-red-300">
                    غیرفعال
                  </span>
                )}
              </div>

              {/* Information */}

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted">ویژگی</p>

                  <p className="mt-1 truncate text-sm font-medium text-secondary">
                    {val.categoryAttribute?.name || "ویژگی نامشخص"}
                  </p>
                </div>

                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted">واحد</p>

                  <p className="mt-1 truncate text-sm font-medium text-secondary">
                    {val.categoryAttribute?.unit || "-"}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted">نوع</p>

                  <p className="mt-1 truncate text-sm font-medium text-secondary">
                    {val.type === 1 ? "ویژه" : "عادی"}
                  </p>
                </div>

                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted">تاریخ ایجاد</p>

                  <p className="mt-1 text-sm font-medium text-secondary">
                    {converterToJalali(val.created_at)}
                  </p>
                </div>
              </div>

              {/* Actions */}

              <div className="mt-4 flex gap-2 border-t border-color pt-4">
                {/* Edit */}

                <Link
                  href={`/admin/category-value/edit/${val.id}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-50 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-100 dark:bg-blue-50/5 dark:text-blue-400 dark:hover:bg-blue-100/10"
                >
                  <i className="fa fa-pencil"></i>
                  ویرایش
                </Link>

                {/* Delete */}

                <SingleDeleteAction
                  endpoint={`/api/admin/advertise/category-value/${val.id}`}
                  title="حذف مقدار"
                  itemName={val.value}
                  itemId={val.id}
                  icon={`${val.categoryAttribute?.category?.icon ?? "fa fa-list"}`}
                  btnText="حذف"
                  extraClasses="flex-1"
                  description="آیا از حذف این مقدار مطمئن هستید؟"
                  warning="این عملیات قابل بازگشت است. پس از حذف، این مقدار به سطل زباله منتقل می‌شود."
                  deleteButtonText="حذف"
                  confirmText="بله، حذف شود"
                  cancelText="انصراف"
                  onSuccess={() => {
                    setError(null);

                    setSelectedIds((prev) =>
                      prev.filter((id) => id !== val.id),
                    );

                    router.push("/admin/category-value/?deleteSuccess=1");
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

export default CategoryValueList;
