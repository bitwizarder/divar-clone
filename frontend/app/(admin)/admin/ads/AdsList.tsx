"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import BulkDeleteAction from "../../../components/ui/admin/BulkDeleteAction";
import SingleDeleteAction from "../../../components/ui/admin/SingleDeleteAction";
import { AdsListResponse } from "@/app/types/ads";
import { converterToJalali } from "@/app/helpers/date";
import { getImageUrl } from "@/app/helpers/image"; // ✅ استفاده از تابع صحیح

function AdsList({ adses }: { adses: AdsListResponse }) {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const selectAllRef = useRef<HTMLInputElement | null>(null);

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
        : [...prev, id],
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
          <i className="fa fa-folder-open text-xl"></i>
        </div>
        <h3 className="mt-4 text-base font-bold text-primary">
          آگهی‌ای وجود ندارد
        </h3>
        <p className="mt-2 text-sm text-secondary">
          هنوز هیچ آگهی‌ای برای نمایش ثبت نشده است.
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

      <BulkDeleteAction
        selectedIds={selectedIds}
        endpoint="/api/admin/advertise/advertisement/bulk"
        title="حذف آگهی‌ها"
        itemName={`${selectedIds.length} آگهی`}
        description={`آیا از حذف ${selectedIds.length} آگهی انتخاب‌شده مطمئن هستید؟`}
        warning="این عملیات قابل بازگشت نیست."
        deleteButtonText="حذف انتخاب‌شده‌ها"
        confirmText="بله، حذف شوند"
        cancelText="انصراف"
        onSuccess={() => {
          setSelectedIds([]);
          setError(null);
          router.push("/admin/ads?deletesSuccess=1");
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
                    aria-label="انتخاب همه آگهی‌ها"
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
                <th className="px-3 py-4 text-xs font-semibold">تاریخ ایجاد</th>
                <th className="px-3 py-4 text-xs font-semibold">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {adses.data.map((ad, index) => {
                const isSelected = selectedIds.includes(ad.id);
                const imageUrl = ad.image?.indexArray?.medium
                  ? getImageUrl(ad.image.indexArray.medium) // ✅ استفاده از getImageUrl
                  : null;

                return (
                  <tr
                    key={ad.id}
                    className={`group border-b border-color transition-colors last:border-0 hover:bg-hover ${
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
                    <td className="px-3 py-4 text-sm text-gray text-center">
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
                        <div className="min-w-0">
                          <p className="font-semibold text-primary">
                            {ad.title}
                          </p>
                          <p className="text-xs text-muted line-clamp-1">
                            {ad.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <span className="text-sm text-secondary">
                        {ad.category?.name || "-"}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <span className="text-sm text-secondary">
                        {ad.user?.name || "-"}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <span className="text-sm text-secondary">
                        {ad.city?.name || "-"}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <span className="text-sm text-secondary">
                        {ad.price
                          ? `${ad.price.toLocaleString()} تومان`
                          : "توافقی"}
                      </span>
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
                      {converterToJalali(ad.created_at)}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/ads/edit/${ad.id}`}
                          title="ویرایش"
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100 dark:bg-blue-50/5 dark:text-blue-400 dark:hover:bg-blue-100/10"
                        >
                          <i className="fa fa-pencil"></i>
                        </Link>
                        <SingleDeleteAction
                          endpoint={`/api/admin/advertise/advertisement/${ad.id}`}
                          title="حذف آگهی"
                          itemName={ad.title}
                          itemId={ad.id}
                          icon="fa fa-trash"
                          description="آیا از حذف این آگهی مطمئن هستید؟"
                          warning="این عملیات قابل بازگشت است."
                          deleteButtonText="حذف"
                          confirmText="بله، حذف شود"
                          cancelText="انصراف"
                          onSuccess={() => {
                            setError(null);
                            setSelectedIds((prev) =>
                              prev.filter((id) => id !== ad.id),
                            );
                            router.push("/admin/ads?deleteSuccess=1");
                            router.refresh();
                          }}
                          onError={(message) => setError(message)}
                        />
                        <Link
                          href={`/admin/ads/show/${ad.id}`}
                          title="مشاهده"
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-600 transition hover:bg-gray-100 dark:bg-gray-50/5 dark:text-gray-400 dark:hover:bg-gray-100/10"
                        >
                          <i className="fa fa-eye"></i>
                        </Link>
                        <Link
                          href={`/admin/ads/${ad.id}/gallery`}
                          title="گالری"
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 transition hover:bg-green-100 dark:bg-green-50/5 dark:text-green-400 dark:hover:bg-green-100/10"
                        >
                          <i className="fa fa-images"></i>
                        </Link>
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
              aria-label="انتخاب همه آگهی‌ها"
              className="appearance-none relative h-5 w-5 cursor-pointer rounded border border-color bg-hover transition-all checked:border-accent checked:bg-hover before:absolute before:inset-0 before:flex before:items-center before:justify-center before:font-bold before:text-sm before:text-accent before:opacity-0 before:content-['✓'] checked:before:opacity-100 focus:ring-0"
            />
            <span className="text-sm font-medium text-primary">انتخاب همه</span>
          </label>
          <span className="text-xs text-muted">
            {selectedIds.length > 0
              ? `${selectedIds.length} انتخاب شده`
              : `${adses.data.length} آگهی`}
          </span>
        </div>

        {adses.data.map((ad) => {
          const isSelected = selectedIds.includes(ad.id);
          const imageUrl = ad.image?.indexArray?.medium
            ? getImageUrl(ad.image.indexArray.medium) // ✅ استفاده از getImageUrl
            : null;

          return (
            <div
              key={ad.id}
              className={`rounded-2xl border border-color bg-surface p-4 shadow-sm ${isSelected ? "bg-hover" : ""}`}
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
                  <h3 className="truncate font-bold text-primary">
                    {ad.title}
                  </h3>
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
                  <p className="text-xs text-muted">تاریخ ایجاد</p>
                  <p className="mt-1 text-sm font-medium text-secondary">
                    {converterToJalali(ad.created_at)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2 border-t border-color pt-4">
                <Link
                  href={`/admin/ads/edit/${ad.id}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-50 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-100 dark:bg-blue-50/5 dark:text-blue-400 dark:hover:bg-blue-100/10"
                >
                  <i className="fa fa-pencil"></i>
                  ویرایش
                </Link>
                <SingleDeleteAction
                  endpoint={`/api/admin/advertise/advertisement/${ad.id}`}
                  title="حذف آگهی"
                  itemName={ad.title}
                  itemId={ad.id}
                  icon="fa fa-trash"
                  btnText="حذف"
                  extraClasses="flex-1"
                  description="آیا از حذف این آگهی مطمئن هستید؟"
                  warning="این عملیات قابل بازگشت است."
                  deleteButtonText="حذف"
                  confirmText="بله، حذف شود"
                  cancelText="انصراف"
                  onSuccess={() => {
                    setError(null);
                    setSelectedIds((prev) => prev.filter((id) => id !== ad.id));
                    router.push("/admin/ads/?deleteSuccess=1");
                    router.refresh();
                  }}
                  onError={(message) => setError(message)}
                />
                <Link
                  href={`/admin/ads/show/${ad.id}`}
                  title="مشاهده"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-600 transition hover:bg-gray-100 dark:bg-gray-50/5 dark:text-gray-400 dark:hover:bg-gray-100/10"
                >
                  <i className="fa fa-eye"></i>
                </Link>
                <Link
                  href={`/admin/ads/${ad.id}/gallery`}
                  title="گالری"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 transition hover:bg-green-100 dark:bg-green-50/5 dark:text-green-400 dark:hover:bg-green-100/10"
                >
                  <i className="fa fa-images"></i>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default AdsList;
