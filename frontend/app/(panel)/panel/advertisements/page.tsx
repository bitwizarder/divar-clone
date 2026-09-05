"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getImageUrl } from "@/app/helpers/image";
import { converterToJalali } from "@/app/helpers/date";
import { useAuth } from "@/app/context/AuthContext";
import { Ads } from "@/app/types/ads";

function UserAdvertisementsList() {
  const [ads, setAds] = useState<Ads[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [processingFeatured, setProcessingFeatured] = useState<number | null>(
    null,
  );

  const getCsrfToken = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/sanctum/csrf-cookie`,
      { method: "GET", credentials: "include" },
    );
    if (!res.ok) throw new Error("خطا در دریافت CSRF token");
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("XSRF-TOKEN="))
      ?.split("=")[1];
    if (!token) throw new Error("CSRF token موجود نیست");
    return decodeURIComponent(token);
  };

  const fetchAds = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/panel/advertise/advertisement`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("خطا در دریافت آگهی‌ها");
      const data = await res.json();
      setAds(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("آیا از حذف این آگهی مطمئن هستید؟")) return;

    try {
      setDeletingId(id);
      const csrf = await getCsrfToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/panel/advertise/advertisement/${id}`,
        {
          method: "DELETE",
          headers: {
            "X-XSRF-TOKEN": csrf,
            Accept: "application/json",
          },
          credentials: "include",
        },
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "خطا در حذف آگهی");
      }
      await fetchAds();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در حذف");
    } finally {
      setDeletingId(null);
    }
  };

  // ========== ویژه کردن آگهی ==========
  const handleMakeFeatured = async (adId: number) => {
    try {
      setProcessingFeatured(adId);
      const csrf = await getCsrfToken();

      // درخواست ایجاد پرداخت
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payments/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-XSRF-TOKEN": csrf,
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            amount: 1000000, // مبلغ ویژه کردن (۱۰۰ هزار تومان)
            description: `ویژه کردن آگهی #${adId}`,
            advertisement_id: adId,
          }),
        },
      );

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "خطا در ایجاد پرداخت");
      }

      // هدایت به درگاه پرداخت
      if (result.payement_url) {
        window.location.href = result.payement_url;
      } else {
        throw new Error("آدرس پرداخت دریافت نشد");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ویژه کردن آگهی");
    } finally {
      setProcessingFeatured(null);
    }
  };

  // بررسی اینکه آیا آگهی ویژه فعال دارد (از طریق is_special و تاریخ انقضا)
  // فرض می‌کنیم is_special=1 به معنی ویژه است و تاریخ انقضا در frontend بررسی نمی‌شود
  // در صورت نیاز، می‌توانید یک فیلد ویژه_expires_at به پاسخ API اضافه کنید

  const statusLabels: Record<number, { label: string; color: string }> = {
    1: { label: "فعال", color: "bg-green-100 text-green-700" },
    2: { label: "در انتظار", color: "bg-yellow-100 text-yellow-700" },
    3: { label: "در انتظار تایید", color: "bg-blue-100 text-blue-700" },
    4: { label: "منقضی", color: "bg-red-100 text-red-700" },
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <i className="fa fa-spinner fa-spin text-3xl text-rose-600"></i>
          <p className="text-gray-500">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
        <p className="font-medium">خطا</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
        <i className="fa fa-file-text text-5xl text-gray-300"></i>
        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
          هیچ آگهی ثبت نکرده‌اید
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          اولین آگهی خود را ثبت کنید.
        </p>
        <Link
          href="/panel/advertisements/create"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-white transition hover:bg-rose-700"
        >
          <i className="fa fa-plus"></i>
          ایجاد آگهی جدید
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          آگهی‌های من
        </h1>
        <Link
          href="/panel/advertisements/create"
          className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700"
        >
          <i className="fa fa-plus"></i>
          آگهی جدید
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ads.map((ad) => {
          const imageUrl = ad.image?.indexArray?.medium
            ? getImageUrl(ad.image.indexArray.medium)
            : null;
          const status = statusLabels[ad.status] || statusLabels[3];
          const isFeatured = ad.is_special === true;

          return (
            <div
              key={ad.id}
              className="group rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <Link href={`/ads/${ad.id}`} target="_blank">
                <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl bg-gray-100">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={ad.title}
                      fill
                      className="object-cover transition group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <i className="fa fa-image text-4xl text-gray-300"></i>
                    </div>
                  )}
                  {isFeatured && (
                    <span className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white shadow">
                      <span>ویژه </span>
                      {ad.featured_expires_at && (
                        <span className="">
                          تا  {" "}
                          {new Date(ad.featured_expires_at).toLocaleDateString(
                            "fa-IR",
                          )}
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </Link>

              <div className="p-4">
                <div className="flex items-start justify-between">
                  <Link href={`/ads/${ad.id}`} target="_blank">
                    <h3 className="font-semibold text-gray-900 hover:text-rose-600 dark:text-white dark:hover:text-rose-400">
                      {ad.title}
                    </h3>
                  </Link>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}
                  >
                    {status.label}
                  </span>
                </div>

                <p className="mt-1 text-lg font-bold text-rose-600 dark:text-rose-400">
                  {ad.price ? `${ad.price.toLocaleString()} تومان` : "توافقی"}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {converterToJalali(ad.created_at)}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-700">
                  <Link
                    href={`/panel/advertisements/edit/${ad.id}`}
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  >
                    <i className="fa fa-edit"></i>
                    ویرایش
                  </Link>
                  <Link
                    href={`/panel/advertisements/${ad.id}/gallery`}
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-purple-600 transition hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
                  >
                    <i className="fa fa-images"></i>
                    گالری
                  </Link>
                  <button
                    onClick={() => handleDelete(ad.id)}
                    disabled={deletingId === ad.id}
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    {deletingId === ad.id ? (
                      <i className="fa fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fa fa-trash"></i>
                    )}
                    حذف
                  </button>

                  {/* دکمه ویژه کردن */}
                  {!isFeatured ? (
                    <button
                      onClick={() => handleMakeFeatured(ad.id)}
                      disabled={processingFeatured === ad.id}
                      className="flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-amber-600 disabled:opacity-50"
                    >
                      {processingFeatured === ad.id ? (
                        <i className="fa fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fa fa-star"></i>
                      )}
                      ویژه کردن
                    </button>
                  ) : (
                    <span className="rounded-lg bg-green-100 px-3 py-1.5 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <i className="fa fa-check ml-1"></i>
                      ویژه فعال
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default UserAdvertisementsList;
