import React from "react";
import Link from "next/link";
import PageEditForm from "./PageEditForm";
import { notFound } from "next/navigation";
import { PageListResponse, PageResponse } from "@/app/types/page";
import { serverGet } from "@/app/lib/serverFetch";

export const metadata = {
  title: "ویرایش صفحه جدید",
  description: "فرم ویرایش صفحه جدید در پنل مدیریت",
};
async function getPage(id: number): Promise<PageResponse> {
  return await serverGet(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/content/page/${id}`,
  );
}

async function getPages(): Promise<PageListResponse> {
  return await serverGet(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/content/page`,
  );
}

async function PageEditPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    // ۱. باز کردن Promise params
    const { id } = await params;
    const numericId = Number(id); // تبدیل به عدد

    // اعتبارسنجی شناسه
    if (isNaN(numericId) || numericId <= 0) {
      notFound();
    }

    // ۲. دریافت داده‌ها
    // const page = await getPage(numericId);
    // const pages = await getPages();

    // اجرای موازی (Parallel) با Promise.all
    //  زمان کلی کاهش می یابد
    // این دو مستقل هستند، همزمان اجرا می‌شوند
    const [page, pages] = await Promise.all([getPage(numericId), getPages()]);
    // اگر یکی از آنها خطا دهد، کل Promise.all خطا می‌دهد.

    // بررسی وجود صفحه
    if (!page?.data || !page.data.id) {
      notFound();
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 rounded-2xl border border-color bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">ویرایش صفحه</h1>
            <p className="mt-2 text-sm text-gray">
              اطلاعات صفحه را ویرایش کنید.
            </p>
          </div>

          <Link
            href="/admin/page"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-color bg-surface px-5 py-3 text-sm font-medium text-secondary hover:bg-hover hover:text-primary shadow-sm transition sm:w-auto"
          >
            <i className="fa fa-arrow-right"></i>
            بازگشت به صفحه‌ها
          </Link>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-color bg-surface text-primary p-5 shadow-sm sm:p-7">
          <PageEditForm page={page.data} pages={pages.data} />
        </div>
      </div>
    );
  } catch (error) {
    // اگر خطای ۴۰۴ باشد، صفحه ۴۰۴ نمایش داده شود
    if (error instanceof Error && error.message === "صفحه مورد نظر یافت نشد.") {
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
            {error instanceof Error ? error.message : "صفحه مورد نظر یافت نشد."}
          </p>
          <Link
            href="/admin/page"
            className="mt-4 inline-block rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
          >
            بازگشت به لیست
          </Link>
        </div>
      </div>
    );
  }
}

export default PageEditPage;
