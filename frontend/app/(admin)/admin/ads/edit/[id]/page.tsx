import React from "react";
import Link from "next/link";
import AdsEditForm from "./AdsEditForm";
import { notFound } from "next/navigation";
import { AdsListResponse, AdsResponse } from "@/app/types/ads";
import { serverGet } from "@/app/lib/serverFetch";

export const metadata = {
  title: "ویرایش آگهی",
  description: "فرم ویرایش آگهی در پنل مدیریت",
};

async function getAds(id: number): Promise<AdsResponse> {
  return await serverGet(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/advertise/advertisement/${id}`,
  );
}

async function AdsEditPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const numericId = Number(id);

    if (isNaN(numericId) || numericId <= 0) {
      notFound();
    }

    // اجرای موازی با Promise.all
    const [ads] = await Promise.all([getAds(numericId)]);

    if (!ads?.data || !ads.data.id) {
      notFound();
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 rounded-2xl border border-color bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">ویرایش آگهی</h1>
            <p className="mt-2 text-sm text-gray">
              اطلاعات آگهی را ویرایش کنید.
            </p>
          </div>

          <Link
            href="/admin/ads"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-color bg-surface px-5 py-3 text-sm font-medium text-secondary hover:bg-hover hover:text-primary shadow-sm transition sm:w-auto"
          >
            <i className="fa fa-arrow-right"></i>
            بازگشت به آگهی‌ها
          </Link>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-color bg-surface text-primary p-5 shadow-sm sm:p-7">
          <AdsEditForm ads={ads.data} />
        </div>
      </div>
    );
  } catch (error) {
    // تشخیص خطای ۴۰۴
    if (error instanceof Error && error.message === "آگهی مورد نظر یافت نشد.") {
      notFound();
    }

    // نمایش سایر خطاها
    return (
      <div className="flex min-h-100 items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <div>
          <i className="fa fa-exclamation-triangle text-3xl text-red-500"></i>
          <h2 className="mt-3 text-xl font-bold text-red-700">
            خطا در دریافت اطلاعات
          </h2>
          <p className="mt-2 text-sm text-red-600">
            {error instanceof Error ? error.message : "خطای ناشناخته"}
          </p>
          <Link
            href="/admin/ads"
            className="mt-4 inline-block rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
          >
            بازگشت به لیست
          </Link>
        </div>
      </div>
    );
  }
}

export default AdsEditPage;
