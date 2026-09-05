"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Ads } from "@/app/types/ads";
import { converterToJalali } from "@/app/helpers/date";
import { getImageUrl } from "@/app/helpers/image";
import { Gallery } from "@/app/types/gallery";

interface AdsShowProps {
  ad: Ads;
  gallery?: Gallery[];
}

const adsStatusMap: Record<string, string> = {
  new: "نو",
  as_good_as_new: "در حد نو",
  good: "خوب",
  acceptable: "قابل قبول",
};

function AdsShow({ ad, gallery = [] }: AdsShowProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const imageUrl = ad.image?.indexArray?.medium
    ? getImageUrl(ad.image.indexArray.medium)
    : null;

  const tagsArray = ad.tags ? ad.tags.split(", ").filter(Boolean) : [];
  const activeGallery = gallery.filter((item) => item.status === 1);

  // بستن Lightbox با کلید Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxImage(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="space-y-6">
      {/* ========== Header ========== */}
      <div className="flex flex-col gap-4 rounded-2xl border border-color bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">{ad.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
            <span>شناسه: #{ad.id}</span>
            <span>•</span>
            <span>{ad.ads_type || "بدون نوع"}</span>
            {ad.slug && (
              <>
                <span>•</span>
                <span className="font-mono text-xs">اسلاگ: {ad.slug}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/ads/edit/${ad.id}`}
            className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
          >
            <i className="fa fa-pencil"></i>
            ویرایش
          </Link>
          <Link
            href="/admin/ads"
            className="flex items-center gap-2 rounded-xl border border-color bg-surface px-5 py-2.5 text-sm font-medium text-secondary transition hover:bg-hover hover:text-primary"
          >
            <i className="fa fa-arrow-right"></i>
            بازگشت
          </Link>
        </div>
      </div>

      {/* ========== Main Content ========== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ===== Image Section ===== */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-color bg-surface p-4 shadow-sm">
            {/* تصویر اصلی */}
            {imageUrl ? (
              <div
                className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 cursor-pointer"
                onClick={() => setLightboxImage(imageUrl)}
              >
                <Image
                  src={imageUrl}
                  alt={ad.title}
                  fill
                  className="object-contain"
                  unoptimized
                  priority
                />
              </div>
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <i className="fa fa-image text-5xl"></i>
                  <span className="text-sm">بدون تصویر</span>
                </div>
              </div>
            )}

            {/* ===== گالری تصاویر ===== */}
            {activeGallery.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-medium text-muted">
                  تصاویر گالری ({activeGallery.length})
                </h4>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                  {activeGallery.map((item) => {
                    const galleryImageUrl = item.image?.indexArray?.medium
                      ? getImageUrl(item.image.indexArray.medium)
                      : null;

                    if (!galleryImageUrl) return null;

                    return (
                      <div
                        key={item.id}
                        className="group relative aspect-square overflow-hidden rounded-lg border border-color bg-gray-50 transition hover:shadow-md cursor-pointer"
                        onClick={() => setLightboxImage(galleryImageUrl)}
                      >
                        <Image
                          src={galleryImageUrl}
                          alt={`گالری ${item.id}`}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          unoptimized
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Thumbnails (تصاویر کوچک آگهی اصلی) */}
            {!activeGallery.length && ad.image?.indexArray && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {Object.entries(ad.image.indexArray).map(([size, path]) => (
                  <div
                    key={size}
                    className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-color cursor-pointer"
                    onClick={() =>
                      setLightboxImage(getImageUrl(path as string))
                    }
                  >
                    <Image
                      src={getImageUrl(path as string)}
                      alt={`تصویر ${size}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===== Info Cards ===== */}
        <div className="space-y-4">
          {/* ... (بقیه کارت‌ها بدون تغییر - به دلیل طولانی شدن کد، فقط یک نمونه نوشته شده است) */}
          {/* وضعیت */}
          <div className="rounded-2xl border border-color bg-surface p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-muted">
              وضعیت آگهی
            </h3>
            <div className="flex flex-wrap items-center gap-2">
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

              {ad.ads_status && (
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 dark:bg-blue-50/5 dark:text-blue-400">
                  <i className="fa fa-tag"></i>
                  {adsStatusMap[ad.ads_status] || ad.ads_status}
                </span>
              )}

              {ad.is_special === 1 && (
                <span className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 dark:bg-purple-50/5 dark:text-purple-400">
                  <i className="fa fa-star"></i>
                  ویژه
                </span>
              )}

              {ad.is_ladder === 1 && (
                <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:bg-indigo-50/5 dark:text-indigo-400">
                  <i className="fa fa-arrow-up"></i>
                  نردبانی
                </span>
              )}

              {ad.willing_to_trade === 1 && (
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 dark:bg-amber-50/5 dark:text-amber-400">
                  <i className="fa fa-exchange-alt"></i>
                  قابل معاوضه
                </span>
              )}
            </div>
          </div>

          {/* اطلاعات اصلی */}
          <div className="rounded-2xl border border-color bg-surface p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-muted">
              اطلاعات اصلی
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">قیمت</dt>
                <dd className="font-medium text-primary">
                  {ad.price ? `${ad.price.toLocaleString()} تومان` : "توافقی"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">بازدید</dt>
                <dd className="font-medium text-primary">{ad.view}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">تماس‌ها</dt>
                <dd className="font-medium text-primary">
                  {ad.contact ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">نوع آگهی</dt>
                <dd className="font-medium text-primary">
                  {ad.ads_type || "—"}
                </dd>
              </div>
            </dl>
          </div>

          {/* دسته‌بندی و مکان */}
          <div className="rounded-2xl border border-color bg-surface p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-muted">
              دسته‌بندی و مکان
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">دسته‌بندی</dt>
                <dd className="font-medium text-primary">
                  {ad.category?.name || "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">شهر</dt>
                <dd className="font-medium text-primary">
                  {ad.city?.name || "—"}
                </dd>
              </div>
              {ad.lat && ad.lng && (
                <div className="flex justify-between">
                  <dt className="text-muted">موقعیت</dt>
                  <dd className="font-medium text-primary">
                    {ad.lat}, {ad.lng}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* تاریخ‌ها */}
          <div className="rounded-2xl border border-color bg-surface p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-muted">تاریخ‌ها</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">تاریخ ایجاد</dt>
                <dd className="font-medium text-primary">
                  {converterToJalali(ad.created_at)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">آخرین بروزرسانی</dt>
                <dd className="font-medium text-primary">
                  {converterToJalali(ad.updated_at)}
                </dd>
              </div>
              {ad.published_at && (
                <div className="flex justify-between">
                  <dt className="text-muted">تاریخ انتشار</dt>
                  <dd className="font-medium text-primary">
                    {converterToJalali(ad.published_at)}
                  </dd>
                </div>
              )}
              {ad.expired_at && (
                <div className="flex justify-between">
                  <dt className="text-muted">تاریخ انقضا</dt>
                  <dd className="font-medium text-primary">
                    {converterToJalali(ad.expired_at)}
                  </dd>
                </div>
              )}
              {ad.deleted_at && (
                <div className="flex justify-between text-red-600">
                  <dt className="text-muted">تاریخ حذف</dt>
                  <dd className="font-medium">
                    {converterToJalali(ad.deleted_at)}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* برچسب‌ها */}
          {tagsArray.length > 0 && (
            <div className="rounded-2xl border border-color bg-surface p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-muted">
                <i className="fa fa-tags ml-1"></i>
                برچسب‌ها
              </h3>
              <div className="flex flex-wrap gap-2">
                {tagsArray.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========== Description ========== */}
      <div className="rounded-2xl border border-color bg-surface p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-muted">توضیحات</h3>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p className="whitespace-pre-wrap text-secondary">
            {ad.description || "توضیحاتی ثبت نشده است."}
          </p>
        </div>
      </div>

      {/* ========== User Info ========== */}
      <div className="rounded-2xl border border-color bg-surface p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-muted">اطلاعات کاربر</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted">نام</p>
            <p className="font-medium text-primary">{ad.user?.name || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted">ایمیل</p>
            <p className="font-medium text-primary">{ad.user?.email || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted">موبایل</p>
            <p className="font-medium text-primary">{ad.user?.mobile || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted">نوع کاربر</p>
            <p className="font-medium text-primary">
              {ad.user?.user_type === 1 ? "ادمین" : "کاربر عادی"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted">وضعیت کاربر</p>
            <p className="font-medium text-primary">
              {ad.user?.is_active ? "فعال" : "غیرفعال"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted">تاریخ ثبت‌نام</p>
            <p className="font-medium text-primary">
              {converterToJalali(ad.user?.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* ========== Lightbox Modal ========== */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <button
              className="absolute -right-4 -top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-2xl font-bold text-gray-800 shadow-lg hover:bg-gray-100 z-20"
              onClick={() => setLightboxImage(null)}
            >
              ×
            </button>
            <div className="relative h-auto w-auto">
              <Image
                src={lightboxImage}
                alt="تصویر بزرگ‌نمایی"
                width={1200}
                height={800}
                className="h-[60vh] w-auto rounded-lg object-contain"
                unoptimized
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdsShow;
