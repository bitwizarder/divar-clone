import React from "react";
import Link from "next/link";
import UserEditForm from "./UserEditForm";
import { notFound } from "next/navigation";
import { UserListResponse, UserResponse } from "@/app/types/user";
import { serverGet } from "@/app/lib/serverFetch";
export const metadata = {
  title: "ویرایش کاربر جدید",
  description: "فرم ویرایش کاربر جدید در پنل مدیریت",
};
async function getUser(id: number): Promise<UserResponse> {
  return await serverGet(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/users/user/${id}`,
  );
}

async function getUsers(): Promise<UserListResponse> {
  return await serverGet(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/users/user`,
  );
}

async function UserEditPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    // ۱. باز کردن Promise params
    const { id } = await params;
    const numericId = Number(id); // تبدیل به عدد

    // اعتبارسنجی شناسه
    if (isNaN(numericId) || numericId <= 0) {
      notFound();
    }

    // ۲. دریافت داده‌ها
    // const user = await getUser(numericId);
    // const users = await getUsers();

    // اجرای موازی (Parallel) با Promise.all
    //  زمان کلی کاهش می یابد
    // این دو مستقل هستند، همزمان اجرا می‌شوند
    const [user, users] = await Promise.all([getUser(numericId), getUsers()]);
    // اگر یکی از آنها خطا دهد، کل Promise.all خطا می‌دهد.

    // بررسی وجود کاربر
    if (!user?.data || !user.data.id) {
      notFound();
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 rounded-2xl border border-color bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">ویرایش کاربر</h1>
            <p className="mt-2 text-sm text-gray">
              اطلاعات کاربر را ویرایش کنید.
            </p>
          </div>

          <Link
            href="/admin/user"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-color bg-surface px-5 py-3 text-sm font-medium text-secondary hover:bg-hover hover:text-primary shadow-sm transition sm:w-auto"
          >
            <i className="fa fa-arrow-right"></i>
            بازگشت به کاربرها
          </Link>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-color bg-surface text-primary p-5 shadow-sm sm:p-7">
          <UserEditForm user={user.data} users={users.data} />
        </div>
      </div>
    );
  } catch (error) {
    // اگر خطای ۴۰۴ باشد، کاربر ۴۰۴ نمایش داده شود
    if (
      error instanceof Error &&
      error.message === "کاربر مورد نظر یافت نشد."
    ) {
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
            {error instanceof Error
              ? error.message
              : "کاربر مورد نظر یافت نشد."}
          </p>
          <Link
            href="/admin/user"
            className="mt-4 inline-block rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
          >
            بازگشت به لیست
          </Link>
        </div>
      </div>
    );
  }
}

export default UserEditPage;
