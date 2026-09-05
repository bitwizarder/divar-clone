import React, { Suspense } from "react";
import Link from "next/link";
import SuccessMessage from "@/app/components/ui/SuccessMessage";
import CategoryAttributeTrashList from "./CategoryAttributeTrashList";
import { serverGet } from "@/app/lib/serverFetch";

export const metadata = {
  title: "سطل زباله ویژگی‌های دسته‌بندی",
  description: "لیست ویژگی‌های دسته‌بندی حذف‌شده",
};

async function CategoryAttributeTrashPage() {
  let categoryAttributes;

  try {
    categoryAttributes = await serverGet(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/advertise/category-attribute/trash`,
    );
  } catch (error) {
    console.error("Error fetching category attributes:", error);
    categoryAttributes = {
      data: [],
    };
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-color bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-hover text-icon">
              <i className="fa fa-trash text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary sm:text-2xl">
                سطل زباله ویژگی‌های دسته‌بندی
              </h1>
              <p className="mt-1 text-sm text-muted">
                مدیریت ویژگی‌های دسته‌بندی حذف‌شده
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/admin/category-attribute"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-color bg-surface px-5 py-3 text-sm font-medium text-secondary hover:bg-hover hover:text-primary shadow-sm transition sm:w-auto"
        >
          <i className="fa fa-arrow-right"></i>
          بازگشت به ویژگی‌های دسته‌بندی
        </Link>
      </div>

      {/* Success Messages */}
      <Suspense fallback={null}>
        <SuccessMessage
          messages={{
            createSuccess: "ویژگی دسته‌بندی با موفقیت ایجاد شد.",
            editSuccess: "ویژگی دسته‌بندی با موفقیت ویرایش شد.",
            deleteSuccess: "ویژگی دسته‌بندی با موفقیت حذف شد.",
            restoreSuccess: "ویژگی دسته‌بندی با موفقیت بازگردانده شد.",
            restoresSuccess: "ویژگی‌های دسته‌بندی با موفقیت بازگردانده شدند.",
            forceDeleteSuccess: "ویژگی‌های دسته‌بندی با موفقیت حذف دائمی شدند.",
            forceDeletesSuccess:
              "ویژگی‌های دسته‌بندی با موفقیت حذف دائمی شدند.",
          }}
        />
      </Suspense>

      {/* Trash List */}
      <CategoryAttributeTrashList attributes={categoryAttributes} />
    </div>
  );
}

export default CategoryAttributeTrashPage;
