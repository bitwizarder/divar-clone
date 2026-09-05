import React from "react";
import Link from "next/link";
import CategoryValueCreateForm from "./CategoryValueCreateForm";

export const metadata = {
  title: "ایجاد مقدار ویژگی جدید",
  description: "فرم ایجاد مقدار ویژگی جدید در پنل مدیریت",
};

function CategoryValueCreatePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-color bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            ایجاد مقدار ویژگی جدید
          </h1>

          <p className="mt-2 text-sm text-gray">
            اطلاعات مقدار ویژگی جدید را وارد کنید.
          </p>
        </div>

        <Link
          href="/admin/category-value"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-color bg-surface px-5 py-3 text-sm font-medium text-secondary hover:bg-hover hover:text-primary shadow-sm transition sm:w-auto"
        >
          <i className="fa fa-arrow-right"></i>
          بازگشت به مقادیر ویژگی
        </Link>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-color bg-surface text-primary p-5 shadow-sm sm:p-7">
        <CategoryValueCreateForm />
      </div>
    </div>
  );
}

export default CategoryValueCreatePage;