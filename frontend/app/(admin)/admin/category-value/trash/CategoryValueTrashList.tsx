"use client";

import BulkRestoreAction from "@/app/components/ui/admin/Restore/BulkRestoreAction";
import SingleRestoreAction from "@/app/components/ui/admin/Restore/SingleRestoreAction";
import SingleDeleteAction from "@/app/components/ui/admin/SingleDeleteAction";
import BulkDeleteAction from "@/app/components/ui/admin/BulkDeleteAction";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { converterToJalali } from "@/app/helpers/date";
import { CategoryValueListResponse } from "@/app/types/categoryValue";

function CategoryValueTrashList({
  values,
}: {
  values: CategoryValueListResponse;
}) {
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const selectAllRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const allSelected =
    values.data.length > 0 && selectedIds.length === values.data.length;
  const someSelected =
    selectedIds.length > 0 && selectedIds.length < values.data.length;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const toggleValue = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(values.data.map((v) => v.id));
  };

  if (!values.data?.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-color bg-surface px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-hover text-icon">
          <i className="fa fa-trash text-xl"></i>
        </div>
        <h3 className="mt-4 text-base font-bold text-primary">
          سطل زباله خالی است
        </h3>
        <p className="mt-2 text-sm text-secondary">
          هیچ مقدار ویژگی حذف‌شده‌ای وجود ندارد.
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

      <BulkRestoreAction
        selectedIds={selectedIds}
        endpoint="/api/admin/advertise/category-value/trash/restore"
        title="بازیابی مقادیر ویژگی"
        icon="fa fa-trash-restore"
        itemName={`${selectedIds.length} مقدار ویژگی`}
        description={`آیا از بازیابی ${selectedIds.length} مقدار ویژگی انتخاب‌شده مطمئن هستید؟`}
        warning="مقادیر انتخاب‌شده از سطل زباله خارج و به لیست اصلی بازگردانده می‌شوند."
        onSuccess={() => {
          setSelectedIds([]);
          setError(null);
          router.push("/admin/category-value/trash?restoresSuccess=1");
        }}
        onError={(message) => setError(message)}
      />

      <BulkDeleteAction
        selectedIds={selectedIds}
        endpoint="/api/admin/advertise/category-value/trash"
        title="حذف دائمی مقادیر ویژگی"
        itemName={`${selectedIds.length} مقدار ویژگی`}
        description={`آیا از حذف دائمی ${selectedIds.length} مقدار ویژگی انتخاب‌شده مطمئن هستید؟`}
        warning="هشدار: این عملیات غیرقابل بازگشت است و مقادیر برای همیشه حذف خواهند شد."
        deleteButtonText="حذف دائمی انتخاب‌شده‌ها"
        confirmText="بله، برای همیشه حذف شوند"
        cancelText="انصراف"
        onSuccess={() => {
          setSelectedIds([]);
          setError(null);
          router.push("/admin/category-value/trash?forceDeletesSuccess=1");
          router.refresh();
        }}
        onError={(message) => setError(message)}
      />

      <div className="hidden overflow-hidden rounded-2xl border border-color bg-surface text-primary shadow-sm lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 text-right">
            <thead>
              <tr className="border-b border-color bg-surface">
                <th className="w-14 px-5 py-4">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="انتخاب همه"
                    className="appearance-none relative h-5 w-5 cursor-pointer rounded border border-color bg-hover transition-all checked:border-accent checked:bg-hover before:absolute before:inset-0 before:flex before:items-center before:justify-center before:font-bold before:text-sm before:text-accent before:opacity-0 before:content-['✓'] checked:before:opacity-100 focus:ring-0"
                  />
                </th>
                <th className="px-5 py-4 text-xs font-semibold">ردیف</th>
                <th className="px-5 py-4 text-xs font-semibold">شناسه</th>
                <th className="px-5 py-4 text-xs font-semibold">مقدار</th>
                <th className="px-5 py-4 text-xs font-semibold">ویژگی</th>
                <th className="px-5 py-4 text-xs font-semibold">واحد</th>
                <th className="px-5 py-4 text-xs font-semibold">نوع</th>
                <th className="px-5 py-4 text-xs font-semibold">تاریخ حذف</th>
                <th className="px-5 py-4 text-xs font-semibold">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {values.data.map((item, index) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    className={`border-b border-color last:border-0 hover:bg-hover ${isSelected ? "bg-hover" : ""}`}
                  >
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleValue(item.id)}
                        aria-label={`انتخاب ${item.value}`}
                        className="appearance-none relative h-5 w-5 cursor-pointer rounded border border-color bg-hover transition-all checked:border-accent checked:bg-hover before:absolute before:inset-0 before:flex before:items-center before:justify-center before:font-bold before:text-sm before:text-accent before:opacity-0 before:content-['✓'] checked:before:opacity-100 focus:ring-0"
                      />
                    </td>
                    <td className="px-5 py-4 text-sm text-gray">
                      <span className="font-bold">{index + 1}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-hover px-2.5 py-1 text-xs font-medium">
                        #{item.id}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-hover text-icon">
                          <i
                            className={`${item.categoryAttribute.category?.icon ?? "fa fa-list"}`}
                          ></i>
                        </div>
                        <span className="font-semibold text-primary">
                          {item.value}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-secondary">
                      {item.categoryAttribute?.name || "ویژگی نامشخص"}
                    </td>
                    <td className="px-5 py-4 text-sm text-secondary">
                      {item.categoryAttribute?.unit || "-"}
                    </td>
                    <td className="px-5 py-4 text-sm text-secondary">
                      {item.type === 1 ? "ویژه" : "عادی"}
                    </td>
                    <td className="px-5 py-4 text-sm text-secondary">
                      {converterToJalali(item.deleted_at)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <SingleRestoreAction
                          endpoint={`/api/admin/advertise/category-value/trash/${item.id}/restore`}
                          title="بازیابی مقدار ویژگی"
                          itemName={item.value}
                          itemId={item.id}
                          icon={`${item.categoryAttribute.category?.icon ?? "fa fa-list"}`}
                          onSuccess={() => {
                            setError(null);
                            router.push(
                              "/admin/category-value/trash?restoreSuccess=1",
                            );
                            router.refresh();
                          }}
                          onError={(message) => setError(message)}
                        />
                        <SingleDeleteAction
                          endpoint={`/api/admin/advertise/category-value/trash/${item.id}`}
                          title="حذف دائمی مقدار ویژگی"
                          itemName={item.value}
                          itemId={item.id}
                          icon="fa fa-trash"
                          description="آیا از حذف دائمی این مقدار ویژگی مطمئن هستید؟"
                          warning="هشدار: این عملیات غیرقابل بازگشت است."
                          deleteButtonText="حذف دائمی"
                          confirmText="بله، برای همیشه حذف شود"
                          cancelText="انصراف"
                          onSuccess={() => {
                            setSelectedIds((prev) =>
                              prev.filter((id) => id !== item.id),
                            );
                            setError(null);
                            router.push(
                              "/admin/category-value/trash?forceDeleteSuccess=1",
                            );
                            router.refresh();
                          }}
                          onError={(message) => setError(message)}
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

      <div className="grid grid-cols-1 gap-4 lg:hidden">
        <div className="flex items-center justify-between rounded-2xl border border-color bg-surface px-4 py-3">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              ref={selectAllRef}
              type="checkbox"
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
              : `${values.data.length} مورد`}
          </span>
        </div>

        {values.data.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <div
              key={item.id}
              className={`rounded-2xl border border-color bg-surface p-4 shadow-sm ${isSelected ? "bg-hover" : ""}`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleValue(item.id)}
                  aria-label={`انتخاب ${item.value}`}
                  className="appearance-none relative mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border border-color bg-hover before:absolute before:inset-0 before:flex before:items-center before:justify-center before:text-sm before:font-bold before:text-accent before:opacity-0 before:content-['✓'] checked:before:opacity-100"
                />
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-hover text-icon">
                  <i
                    className={`${item.categoryAttribute.category?.icon ?? "fa fa-list"}`}
                  ></i>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-bold text-primary">
                    {item.value}
                  </h3>
                  <p className="mt-1 text-xs text-muted">شناسه #{item.id}</p>
                  <p className="mt-1 text-xs text-muted">
                    ویژگی: {item.categoryAttribute?.name || "نامشخص"}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted">واحد</p>
                  <p className="mt-1 text-sm font-medium text-secondary">
                    {item.categoryAttribute?.unit || "-"}
                  </p>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted">تاریخ حذف</p>
                  <p className="mt-1 text-sm font-medium text-secondary">
                    {converterToJalali(item.deleted_at)}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2 border-t border-color pt-4">
                <SingleRestoreAction
                  endpoint={`/api/admin/advertise/category-value/trash/${item.id}/restore`}
                  title="بازیابی مقدار ویژگی"
                  extraClasses="flex-1"
                  btnText="بازیابی"
                  itemName={item.value}
                  itemId={item.id}
                  onSuccess={() => {
                    router.push("/admin/category-value/trash?restoreSuccess=1");
                    router.refresh();
                  }}
                  onError={(message) => setError(message)}
                />
                <SingleDeleteAction
                  endpoint={`/api/admin/advertise/category-value/trash/${item.id}`}
                  title="حذف دائمی مقدار ویژگی"
                  itemName={item.value}
                  itemId={item.id}
                  icon="fa fa-trash"
                  extraClasses="flex-1"
                  btnText="حذف"
                  description="آیا از حذف دائمی این مقدار ویژگی مطمئن هستید؟"
                  warning="این عملیات غیرقابل بازگشت است."
                  deleteButtonText="حذف دائمی"
                  confirmText="بله، برای همیشه حذف شود"
                  cancelText="انصراف"
                  onSuccess={() => {
                    router.push(
                      "/admin/category-value/trash?forceDeleteSuccess=1",
                    );
                    router.refresh();
                  }}
                  onError={(message) => setError(message)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default CategoryValueTrashList;
