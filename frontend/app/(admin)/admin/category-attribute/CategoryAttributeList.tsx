"use client";

import React, { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";

import BulkDeleteAction from "../../../components/ui/admin/BulkDeleteAction";
import SingleDeleteAction from "../../../components/ui/admin/SingleDeleteAction";
import { converterToJalali } from "@/app/helpers/date";
import { CategoryAttributeListResponse } from "@/app/types/categoryAttribute";

function CategoryAttributeList({
  attributes,
}: {
  attributes: CategoryAttributeListResponse;
}) {
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
    attributes.data.length > 0 &&
    selectedIds.length === attributes.data.length;

  const someSelected =
    selectedIds.length > 0 && selectedIds.length < attributes.data.length;

  /*
   * Set indeterminate state
   */
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  /*
   * Select / unselect one attribute
   */
  const toggleAttribute = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  /*
   * Select / unselect all attributes
   */
  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(attributes.data.map((attr) => attr.id));
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

  if (!attributes.data?.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-color bg-surface px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-hover text-icon">
          <i className="fa fa-folder-open text-xl"></i>
        </div>

        <h3 className="mt-4 text-base font-bold text-primary">
          ویژگی‌ای وجود ندارد
        </h3>

        <p className="mt-2 text-sm text-secondary">
          هنوز هیچ ویژگی برای دسته‌بندی ثبت نشده است.
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
        endpoint="/api/admin/advertise/category-attribute/bulk"
        title="حذف ویژگی‌ها"
        itemName={`${selectedIds.length} ویژگی`}
        description={`آیا از حذف ${selectedIds.length} ویژگی انتخاب‌شده مطمئن هستید؟`}
        warning="این عملیات قابل بازگشت نیست. ویژگی‌های مرتبط با دسته‌بندی‌ها نیز ممکن است تحت تأثیر قرار گیرند."
        deleteButtonText="حذف انتخاب‌شده‌ها"
        confirmText="بله، حذف شوند"
        cancelText="انصراف"
        onSuccess={() => {
          setSelectedIds([]);
          setError(null);
          router.push("/admin/category-attribute?deletesSuccess=1");
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
                    aria-label="انتخاب همه ویژگی‌ها"
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

                <th className="px-3 py-4 text-xs font-semibold">نام ویژگی</th>

                <th className="px-3 py-4 text-xs font-semibold">واحد</th>
 
                <th className="px-3 py-4 text-xs font-semibold">دسته‌بندی</th>

                <th className="px-3 py-4 text-xs font-semibold">نوع</th>

                <th className="px-3 py-4 text-xs font-semibold">وضعیت</th>

                <th className="px-3 py-4 text-xs font-semibold">تاریخ ایجاد</th>

                <th className="px-3 py-4 text-xs font-semibold">عملیات</th>
              </tr>
            </thead>

            <tbody>
              {attributes.data.map((attr, index) => {
                const isSelected = selectedIds.includes(attr.id);

                return (
                  <tr
                    key={attr.id}
                    className={`group border-b border-color transition-colors last:border-0 hover:bg-hover ${
                      isSelected ? "bg-hover" : ""
                    }`}
                  >
                    {/* Checkbox */}

                    <td className="px-3 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleAttribute(attr.id)}
                        aria-label={`انتخاب ${attr.name}`}
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
                        #{attr.id}
                      </span>
                    </td>

                    {/* Name */}

                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-hover text-icon">
                          <i
                            className={
                              attr.category?.icon
                                ? attr.category.icon
                                : "fa fa-tag"
                            }
                          ></i>
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-primary">
                            {attr.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Unit */}

                    <td className="px-3 py-4">
                      <span className="text-sm text-secondary">
                        {attr.unit || "-"}
                      </span>
                    </td>

                    {/* Category */}

                    <td className="px-3 py-4">
                      <span className="text-sm text-secondary">
                        {attr.category?.name || "دسته‌بندی نامشخص"}
                      </span>
                    </td>

                    {/* Type */}

                    <td className="px-3 py-4">
                      <span className="text-sm text-secondary">
                        {attr.type === 1 ? "ویژه" : "عادی"}
                      </span>
                    </td>

                    {/* Status */}

                    <td className="px-3 py-4">
                      {attr.status ? (
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
                      {converterToJalali(attr.created_at)}
                    </td>

                    {/* Actions */}

                    <td className="px-3 py-4">
                      <div className="flex items-center gap-2">
                        {/* Edit */}

                        <Link
                          href={`/admin/category-attribute/edit/${attr.id}`}
                          title="ویرایش"
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100 dark:bg-blue-50/5 dark:text-blue-400 dark:hover:bg-blue-100/10"
                        >
                          <i className="fa fa-pencil"></i>
                        </Link>

                        {/* Delete */}

                        <SingleDeleteAction
                          endpoint={`/api/admin/advertise/category-attribute/${attr.id}`}
                          title="حذف ویژگی"
                          itemName={attr.name}
                          itemId={attr.id}
                          icon={attr.category?.icon || "fa fa-tag"}
                          description="آیا از حذف این ویژگی مطمئن هستید؟"
                          warning="این عملیات قابل بازگشت است. پس از حذف، این ویژگی به سطل زباله منتقل می‌شود."
                          deleteButtonText="حذف"
                          confirmText="بله، حذف شود"
                          cancelText="انصراف"
                          onSuccess={() => {
                            setError(null);

                            setSelectedIds((prev) =>
                              prev.filter((id) => id !== attr.id)
                            );

                            router.push(
                              "/admin/category-attribute?deleteSuccess=1"
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
              aria-label="انتخاب همه ویژگی‌ها"
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
              : `${attributes.data.length} ویژگی`}
          </span>
        </div>

        {attributes.data.map((attr) => {
          const isSelected = selectedIds.includes(attr.id);

          return (
            <div
              key={attr.id}
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
                    onChange={() => toggleAttribute(attr.id)}
                    aria-label={`انتخاب ${attr.name}`}
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
                      className={attr.category?.icon || "fa fa-tag"}
                    ></i>
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-primary">
                      {attr.name}
                    </h3>

                    <p className="mt-1 text-xs text-muted">
                      شناسه #{attr.id}
                    </p>
                  </div>
                </div>

                {/* Status */}

                {attr.status ? (
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
                  <p className="text-xs text-muted">واحد</p>

                  <p className="mt-1 truncate text-sm font-medium text-secondary">
                    {attr.unit || "-"}
                  </p>
                </div>

                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted">دسته‌بندی</p>

                  <p className="mt-1 truncate text-sm font-medium text-secondary">
                    {attr.category?.name || "دسته‌بندی نامشخص"}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted">نوع</p>

                  <p className="mt-1 truncate text-sm font-medium text-secondary">
                    {attr.type === 1 ? "ویژه" : "عادی"}
                  </p>
                </div>

                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted">تاریخ ایجاد</p>

                  <p className="mt-1 text-sm font-medium text-secondary">
                    {converterToJalali(attr.created_at)}
                  </p>
                </div>
              </div>

              {/* Actions */}

              <div className="mt-4 flex gap-2 border-t border-color pt-4">
                {/* Edit */}

                <Link
                  href={`/admin/category-attribute/edit/${attr.id}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-50 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-100 dark:bg-blue-50/5 dark:text-blue-400 dark:hover:bg-blue-100/10"
                >
                  <i className="fa fa-pencil"></i>
                  ویرایش
                </Link>

                {/* Delete */}

                <SingleDeleteAction
                  endpoint={`/api/admin/advertise/category-attribute/${attr.id}`}
                  title="حذف ویژگی"
                  itemName={attr.name}
                  itemId={attr.id}
                  icon={attr.category?.icon || "fa fa-tag"}
                  btnText="حذف"
                  extraClasses="flex-1"
                  description="آیا از حذف این ویژگی مطمئن هستید؟"
                  warning="این عملیات قابل بازگشت است. پس از حذف، این ویژگی به سطل زباله منتقل می‌شود."
                  deleteButtonText="حذف"
                  confirmText="بله، حذف شود"
                  cancelText="انصراف"
                  onSuccess={() => {
                    setError(null);

                    setSelectedIds((prev) =>
                      prev.filter((id) => id !== attr.id)
                    );

                    router.push("/admin/category-attribute/?deleteSuccess=1");
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

export default CategoryAttributeList;