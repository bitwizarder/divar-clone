import React, { Suspense } from "react";
import Link from "next/link";
import CategoryList from "./CategoryList";
import SuccessMessage from "../../../components/ui/SuccessMessage";
import { cookies } from "next/headers";
export const metadata = {
  title: "پنل مدیریت | صفحات",
  description: "لیست دسته‌بندی‌ها در پنل مدیریت",
};
async function CategoryPage() {
  let categories;
  let error = null;

  try {
    // دریافت کوکی‌ها از درخواست فعلی
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/advertise/category`,
      {
        headers: {
          Accept: "application/json",
          Cookie: cookieHeader, // ارسال کوکی‌ها به API
          Referer: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          Origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        },
        cache: "no-cache",
      },
    );
    console.log("cookieHeader", cookieHeader);

    if (!res.ok) {
      throw new Error("خطا در دریافت اطلاعات");
    }

    categories = await res.json();
  } catch (err) {
    console.error("Error fetching categories:", err);
    error = err instanceof Error ? err.message : "خطا در دریافت اطلاعات";
    categories = { data: [], category_count: 0, trash_count: 0 };
  }

  return (
    <div className="space-y-6">
      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col gap-4 rounded-2xl border border-color bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-hover text-icon">
              <i className="fa fa-list-ul text-lg"></i>
            </div>

            <div>
              <h1 className="text-xl font-bold text-primary sm:text-2xl">
                دسته‌بندی‌ها
              </h1>

              <p className="mt-1 text-sm text-muted flex items-center flex-wrap gap-2">
                <span>مدیریت دسته‌بندی‌های آگهی‌ها</span>
                {categories.category_count && (
                  <span className="bg-hover px-3 py-1 text-gray rounded-full">
                    تعداد رکورد ها ({categories.category_count})
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/category/trash"
            className="inline-flex flex-1 items-center justify-between gap-2 rounded-xl border border-color bg-surface px-4 py-2.5 text-sm font-medium text-secondary transition hover:bg-hover hover:text-primary"
          >
            <div className="gap-x-2 flex-center">
              <i className="fa fa-trash"></i>
              <span className="text-nowrap">سطل زباله</span>
            </div>

            {categories.trash_count && (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-hover dark:bg-hover px-1.5 py-0.5 text-[11px] font-bold leading-5 text-primary border border-color">
                ({categories.trash_count})
              </span>
            )}
          </Link>

          <Link
            href="/admin/category/create"
            className="flex flex-1 w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-medium text-btn shadow-sm transition hover:opacity-90 sm:w-auto"
          >
            <i className="fa fa-plus"></i>
            <span className="text-nowrap">ایجاد دسته‌بندی جدید</span>
          </Link>
        </div>
      </div>

      {/* ================= SUCCESS MESSAGES ================= */}
      <Suspense fallback={null}>
        <SuccessMessage
          messages={{
            createSuccess: "دسته‌بندی با موفقیت ایجاد شد.",
            editSuccess: "دسته‌بندی با موفقیت ویرایش شد.",
            deleteSuccess: "دسته‌بندی با موفقیت حذف شد.",
            deletesSuccess: "دسته‌بندی های انتخاب شده با موفقیت حذف شدند.",
          }}
        />
      </Suspense>

      {/* ================= CATEGORY LIST ================= */}
      <CategoryList categories={categories} />
    </div>
  );
}

export default CategoryPage;
