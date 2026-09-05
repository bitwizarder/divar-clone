"use client";

import BulkRestoreAction from "@/app/components/ui/admin/Restore/BulkRestoreAction";
import SingleRestoreAction from "@/app/components/ui/admin/Restore/SingleRestoreAction";
import SingleDeleteAction from "@/app/components/ui/admin/SingleDeleteAction";
import BulkDeleteAction from "@/app/components/ui/admin/BulkDeleteAction";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { converterToJalali } from "@/app/helpers/date";
import { getImageUrl } from "@/app/helpers/image";
import { AdsListResponse } from "@/app/types/ads";

function AdsTrashList({ adses }: { adses: AdsListResponse }) {
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const selectAllRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const allSelected =
    adses.data.length > 0 && selectedIds.length === adses.data.length;
  const someSelected =
    selectedIds.length > 0 && selectedIds.length < adses.data.length;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const toggleAds = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(adses.data.map((ad) => ad.id));
  };

  if (!adses.data?.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-color bg-surface px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-hover text-icon">
          <i className="fa fa-trash text-xl"></i>
        </div>
        <h3 className="mt-4 text-base font-bold text-primary">سطل زباله خالی است</h3>
        <p className="mt-2 text-sm text-secondary">هیچ آگهی حذف‌شده‌ای وجود ندارد.</p>
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
        endpoint="/api/admin/advertise/advertisement/trash/restore"
        title="بازیابی آگهی‌ها"
        itemName={`${selectedIds.length} آگهی`}
        description={`آیا از بازیابی ${selectedIds.length} آگهی انتخاب‌شده مطمئن هستید؟`}
        warning="آگهی‌های انتخاب‌شده از سطل زباله خارج و به لیست اصلی بازگردانده می‌شوند."
        onSuccess={() => {
          setSelectedIds([]);
          setError(null);
          router.push("/admin/ads/trash?restoresSuccess=1");
        }}
        onError={(message) => setError(message)}
      />

      {/* Bulk Permanent Delete */}
      <BulkDeleteAction
        selectedIds={selectedIds}
        endpoint="/api/admin/advertise/advertisement/trash"
        title="حذف دائمی آگهی‌ها"
        itemName={`${selectedIds.length} آگهی`}
        description={`آیا از حذف دائمی ${selectedIds.length} آگهی انتخاب‌شده مطمئن هستید؟`}
        warning="هشدار: این عملیات غیرقابل بازگشت است و آگهی‌ها برای همیشه از پایگاه داده حذف خواهند شد."
        deleteButtonText="حذف دائمی انتخاب‌شده‌ها"
        confirmText="بله، برای همیشه حذف شوند"
        cancelText="انصراف"
        onSuccess={() => {
          setSelectedIds([]);
          setError(null);
          router.push("/admin/ads/trash?forceDeletesSuccess=1");
          router.refresh();
        }}
        onError={(message) => setError(message)}
      />

      {/* Desktop Table */}
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
                <th className="px-3 py-4 text-xs font-semibold">عنوان</th>
                <th className="px-3 py-4 text-xs font-semibold">دسته‌بندی</th>
                <th className="px-3 py-4 text-xs font-semibold">کاربر</th>
                <th className="px-3 py-4 text-xs font-semibold">شهر</th>
                <th className="px-3 py-4 text-xs font-semibold">قیمت</th>
                <th className="px-3 py-4 text-xs font-semibold">وضعیت</th>
                <th className="px-3 py-4 text-xs font-semibold">تاریخ حذف</th>
                <th className="px-3 py-4 text-xs font-semibold">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {adses.data.map((ad, index) => {
                const isSelected = selectedIds.includes(ad.id);
                const imageUrl = ad.image?.indexArray?.medium
                  ? getImageUrl(ad.image.indexArray.medium)
                  : null;

                return (
                  <tr
                    key={ad.id}
                    className={`border-b border-color last:border-0 hover:bg-hover ${
                      isSelected ? "bg-hover" : ""
                    }`}
                  >
                    <td className="px-3 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleAds(ad.id)}
                        aria-label={`انتخاب ${ad.title}`}
                        className="appearance-none relative h-5 w-5 cursor-pointer rounded border border-color bg-hover transition-all checked:border-accent checked:bg-hover before:absolute before:inset-0 before:flex before:items-center before:justify-center before:font-bold before:text-sm before:text-accent before:opacity-0 before:content-['✓'] checked:before:opacity-100 focus:ring-0"
                      />
                    </td>
                    <td className="px-3 py-4 text-sm text-gray">
                      <span className="font-bold">{index + 1}</span>
                    </td>
                    <td className="px-3 py-4">
                      <span className="rounded-lg bg-hover px-2.5 py-1 text-xs font-medium">
                        #{ad.id}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        {imageUrl ? (
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-hover">
                            <Image
                              src={imageUrl}
                              alt={ad.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-hover text-icon">
                            <i className="fa fa-image"></i>
                          </div>
                        )}
                        <span className="font-semibold text-primary">{ad.title}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-secondary">
                      {ad.category?.name || "-"}
                    </td>
                    <td className="px-3 py-4 text-sm text-secondary">
                      {ad.user?.name || "-"}
                    </td>
                    <td className="px-3 py-4 text-sm text-secondary">
                      {ad.city?.name || "-"}
                    </td>
                    <td className="px-3 py-4 text-sm text-secondary">
                      {ad.price ? `${ad.price.toLocaleString()} تومان` : "توافقی"}
                    </td>
                    <td className="px-3 py-4">
                      {ad.status === 1 ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 dark:bg-green-50/5 dark:text-green-500">
                          <span className="h-2 w-2 rounded-full bg-success"></span>
                          فعال
                        </span>
                      ) : ad.status === 3 ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 dark:bg-red-50/5 dark:text-red-400/90">
                          <span className="h-2 w-2 rounded-full bg-danger"></span>
                          غیرفعال
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1.5 text-xs font-medium text-yellow-700 dark:bg-yellow-50/5 dark:text-yellow-500">
                          <span className="h-2 w-2 rounded-full bg-warning"></span>
                          در انتظار
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-4 text-sm text-secondary">
                      {converterToJalali(ad.deleted_at)}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-2">
                        <SingleRestoreAction
                          endpoint={`/api/admin/advertise/advertisement/trash/${ad.id}/restore`}
                          title="بازیابی آگهی"
                          itemName={ad.title}
                          itemId={ad.id}
                          icon="fa fa-rotate-left"
                          onSuccess={() => {
                            setError(null);
                            router.push("/admin/ads/trash?restoreSuccess=1");
                            router.refresh();
                          }}
                          onError={(message) => setError(message)}
                        />
                        <SingleDeleteAction
                          endpoint={`/api/admin/advertise/advertisement/trash/${ad.id}`}
                          title="حذف دائمی آگهی"
                          itemName={ad.title}
                          itemId={ad.id}
                          icon="fa fa-trash"
                          description="آیا از حذف دائمی این آگهی مطمئن هستید؟"
                          warning="هشدار: این عملیات غیرقابل بازگشت است."
                          deleteButtonText="حذف دائمی"
                          confirmText="بله، برای همیشه حذف شود"
                          cancelText="انصراف"
                          onSuccess={() => {
                            setSelectedIds((prev) =>
                              prev.filter((id) => id !== ad.id)
                            );
                            setError(null);
                            router.push("/admin/ads/trash?forceDeleteSuccess=1");
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

      {/* Mobile */}
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
              : `${adses.data.length} مورد`}
          </span>
        </div>

        {adses.data.map((ad) => {
          const isSelected = selectedIds.includes(ad.id);
          const imageUrl = ad.image?.indexArray?.medium
            ? getImageUrl(ad.image.indexArray.medium)
            : null;

          return (
            <div
              key={ad.id}
              className={`rounded-2xl border border-color bg-surface p-4 shadow-sm ${
                isSelected ? "bg-hover" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleAds(ad.id)}
                  aria-label={`انتخاب ${ad.title}`}
                  className="appearance-none relative mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border border-color bg-hover before:absolute before:inset-0 before:flex before:items-center before:justify-center before:text-sm before:font-bold before:text-accent before:opacity-0 before:content-['✓'] checked:before:opacity-100"
                />
                {imageUrl ? (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-hover">
                    <Image
                      src={imageUrl}
                      alt={ad.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-hover text-icon">
                    <i className="fa fa-image text-2xl"></i>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-bold text-primary">{ad.title}</h3>
                  <p className="mt-1 text-xs text-muted">شناسه #{ad.id}</p>
                  <p className="mt-1 text-xs text-muted">
                    دسته: {ad.category?.name || "-"}
                  </p>
                </div>
                {ad.status === 1 ? (
                  <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-300/5 dark:text-green-300">
                    فعال
                  </span>
                ) : ad.status === 3 ? (
                  <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-300/5 dark:text-red-300">
                    غیرفعال
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-300/5 dark:text-yellow-300">
                    در انتظار
                  </span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted">کاربر</p>
                  <p className="mt-1 text-sm font-medium text-secondary">
                    {ad.user?.name || "-"}
                  </p>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted">شهر</p>
                  <p className="mt-1 text-sm font-medium text-secondary">
                    {ad.city?.name || "-"}
                  </p>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted">قیمت</p>
                  <p className="mt-1 text-sm font-medium text-secondary">
                    {ad.price ? `${ad.price.toLocaleString()} تومان` : "توافقی"}
                  </p>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted">تاریخ حذف</p>
                  <p className="mt-1 text-sm font-medium text-secondary">
                    {converterToJalali(ad.deleted_at)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2 border-t border-color pt-4">
                <SingleRestoreAction
                  endpoint={`/api/admin/advertise/advertisement/trash/${ad.id}/restore`}
                  title="بازیابی آگهی"
                  extraClasses="flex-1"
                  btnText="بازیابی"
                  itemName={ad.title}
                  itemId={ad.id}
                  onSuccess={() => {
                    router.push("/admin/ads/trash?restoreSuccess=1");
                    router.refresh();
                  }}
                  onError={(message) => setError(message)}
                />
                <SingleDeleteAction
                  endpoint={`/api/admin/advertise/advertisement/trash/${ad.id}`}
                  title="حذف دائمی آگهی"
                  itemName={ad.title}
                  itemId={ad.id}
                  icon="fa fa-trash"
                  extraClasses="flex-1"
                  btnText="حذف"
                  description="آیا از حذف دائمی این آگهی مطمئن هستید؟"
                  warning="این عملیات غیرقابل بازگشت است."
                  deleteButtonText="حذف دائمی"
                  confirmText="بله، برای همیشه حذف شود"
                  cancelText="انصراف"
                  onSuccess={() => {
                    router.push("/admin/ads/trash?forceDeleteSuccess=1");
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

export default AdsTrashList;