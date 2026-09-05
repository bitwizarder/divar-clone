import React, { Suspense } from "react";
import Link from "next/link";
import SuccessMessage from "@/app/components/ui/SuccessMessage";
import CategoryValueTrashList from "./CategoryValueTrashList";
import { serverGet } from "@/app/lib/serverFetch";

export const metadata = {
  title: "سطل زباله مقادیر ویژگی",
  description: "لیست مقادیر ویژگی حذف‌شده",
};

async function CategoryValueTrashPage() {
  let categoryValues;

  try {
    categoryValues = await serverGet(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/advertise/category-value/trash`,
    );
  } catch (error) {
    console.error("Error fetching category values:", error);
    categoryValues = { data: [] };
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-color bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-hover text-icon">
              <i className="fa fa-trash text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary sm:text-2xl">
                سطل زباله مقادیر ویژگی
              </h1>
              <p className="mt-1 text-sm text-muted">
                مدیریت مقادیر ویژگی حذف‌شده
              </p>
            </div>
          </div>
        </div>
        <Link
          href="/admin/category-value"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-color bg-surface px-5 py-3 text-sm font-medium text-secondary hover:bg-hover hover:text-primary shadow-sm transition sm:w-auto"
        >
          <i className="fa fa-arrow-right"></i>
          بازگشت به مقادیر ویژگی
        </Link>
      </div>

      <Suspense fallback={null}>
        <SuccessMessage
          messages={{
            createSuccess: "مقدار ویژگی با موفقیت ایجاد شد.",
            editSuccess: "مقدار ویژگی با موفقیت ویرایش شد.",
            deleteSuccess: "مقدار ویژگی با موفقیت حذف شد.",
            restoreSuccess: "مقدار ویژگی با موفقیت بازگردانده شد.",
            restoresSuccess: "مقادیر ویژگی با موفقیت بازگردانده شدند.",
            forceDeleteSuccess: "مقادیر ویژگی با موفقیت حذف دائمی شدند.",
            forceDeletesSuccess: "مقادیر ویژگی با موفقیت حذف دائمی شدند.",
          }}
        />
      </Suspense>

      <CategoryValueTrashList values={categoryValues} />
    </div>
  );
}

export default CategoryValueTrashPage;
