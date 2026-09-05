import React from "react";
import Link from "next/link";
import StateEditForm from "./StateEditForm";
import { serverGet } from "@/app/lib/serverFetch";
export const metadata = {
  title: "ویرایش منطقه جدید",
  description: "فرم ویرایش منطقه جدید در پنل مدیریت",
};
async function getState(id: number) {
  return await serverGet(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/advertise/state/${id}`,
  );
}

async function getStates() {
  return await serverGet(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/advertise/state`,
  );
}

async function StateEditPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    // ۱. باز کردن Promise params
    const { id } = await params;
    const numericId = Number(id); // تبدیل به عدد

    // ۲. دریافت داده‌ها
    const state = await getState(numericId);
    const states = await getStates();

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 rounded-2xl border border-color bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">ویرایش منطقه</h1>
            <p className="mt-2 text-sm text-gray">
              اطلاعات منطقه را ویرایش کنید.
            </p>
          </div>

          <Link
            href="/admin/state"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-color bg-surface px-5 py-3 text-sm font-medium text-secondary hover:bg-hover hover:text-primary shadow-sm transition sm:w-auto"
          >
            <i className="fa fa-arrow-right"></i>
            بازگشت به منطقه‌ها
          </Link>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-color bg-surface text-primary p-5 shadow-sm sm:p-7">
          <StateEditForm
            state={state.data} // ✅ اصلاح
            states={states.data} // ✅ اصلاح (date -> data)
          />
        </div>
      </div>
    );
  } catch (error) {
    // مدیریت خطا در صورت نیاز
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
              : "منطقه مورد نظر یافت نشد."}
          </p>
          <Link
            href="/admin/state"
            className="mt-4 inline-block rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
          >
            بازگشت به لیست
          </Link>
        </div>
      </div>
    );
  }
}

export default StateEditPage;
