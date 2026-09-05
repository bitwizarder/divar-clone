import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import CategoryAttributeEditForm from "./CategoryAttributeEditForm";
import {
  CategoryAttributeResponse,
  CategoryAttributeListResponse,
} from "@/app/types/categoryAttribute";
import { serverGet } from "@/app/lib/serverFetch";

async function getAttribute(id: number): Promise<CategoryAttributeResponse> {
  return await serverGet(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/advertise/category-attribute/${id}`,
  );
}

async function getAttributes(): Promise<{
  data: { id: number; name: string }[];
}> {
  return await serverGet(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/advertise/category`,
  );
}

export const metadata = {
  title: "ویرایش ویژگی دسته‌بندی",
  description: "فرم ویرایش ویژگی دسته‌بندی در پنل مدیریت",
};

async function CategoryAttributeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    const numericId = Number(id);

    if (isNaN(numericId) || numericId <= 0) {
      notFound();
    }

    const [attribute, categories] = await Promise.all([
      getAttribute(numericId),
      getAttributes(),
    ]);

    if (!attribute?.data) {
      notFound();
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 rounded-2xl border border-color bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              ویرایش ویژگی دسته‌بندی
            </h1>
            <p className="mt-2 text-sm text-gray">
              اطلاعات ویژگی دسته‌بندی را ویرایش کنید.
            </p>
          </div>

          <Link
            href="/admin/category-attribute"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-color bg-surface px-5 py-3 text-sm font-medium text-secondary hover:bg-hover hover:text-primary shadow-sm transition sm:w-auto"
          >
            <i className="fa fa-arrow-right"></i>
            بازگشت به ویژگی‌های دسته‌بندی
          </Link>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-color bg-surface text-primary p-5 shadow-sm sm:p-7">
          <CategoryAttributeEditForm
            attribute={attribute.data}
            categories={categories.data || []}
          />
        </div>
      </div>
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ویژگی دسته‌بندی مورد نظر یافت نشد."
    ) {
      notFound();
    }

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
              : "خطای ناشناخته رخ داده است."}
          </p>
          <Link
            href="/admin/category-attribute"
            className="mt-4 inline-block rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
          >
            بازگشت به لیست
          </Link>
        </div>
      </div>
    );
  }
}

export default CategoryAttributeEditPage;
