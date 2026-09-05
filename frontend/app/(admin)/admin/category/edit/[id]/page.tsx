import React from "react";
import Link from "next/link";
import CategoryEditForm from "./CategoryEditForm";
import { serverGet } from "@/app/lib/serverFetch";

export const metadata = {
  title: "ویرایش دسته‌بندی جدید",
  description: "فرم ویرایش دسته‌بندی جدید در پنل مدیریت",
};

async function getCategory(id: number) {
  return serverGet(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/advertise/category/${id}`,
  );
}

async function getCategories() {
  return serverGet(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/advertise/category`,
  );
}

async function CategoryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const numericId = Number(id);

    const [category, categories] = await Promise.all([
      getCategory(numericId),
      getCategories(),
    ]);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 rounded-2xl border border-color bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              ویرایش دسته‌بندی
            </h1>
            <p className="mt-2 text-sm text-gray">
              اطلاعات دسته‌بندی را ویرایش کنید.
            </p>
          </div>
          <Link
            href="/admin/category"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-color bg-surface px-5 py-3 text-sm font-medium text-secondary hover:bg-hover hover:text-primary shadow-sm transition sm:w-auto"
          >
            <i className="fa fa-arrow-right"></i>
            بازگشت به دسته‌بندی‌ها
          </Link>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-color bg-surface text-primary p-5 shadow-sm sm:p-7">
          <CategoryEditForm
            category={category.data}
            categories={categories.data}
          />
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="flex min-h-100 items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <div>
          <i className="fa fa-exclamation-triangle text-3xl text-red-500"></i>
          <h2 className="mt-3 text-xl font-bold text-red-700">
            خطا در دریافت اطلاعات
          </h2>
          <p className="mt-2 text-sm text-red-600">
            {error instanceof Error
              ? error.message
              : "دسته‌بندی مورد نظر یافت نشد."}
          </p>
          <Link
            href="/admin/category"
            className="mt-4 inline-block rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
          >
            بازگشت به لیست
          </Link>
        </div>
      </div>
    );
  }
}

export default CategoryEditPage;
