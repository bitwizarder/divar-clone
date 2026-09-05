import React, { Suspense } from "react";
import Link from "next/link";
import UserList from "./UserList";
import SuccessMessage from "../../../components/ui/SuccessMessage";
import { serverGet } from "@/app/lib/serverFetch";
export const metadata = {
  title: "پنل مدیریت | کاربر‌ها",
  description: "لیست کاربر‌ها در پنل مدیریت",
};
async function UserPage() {
  let users;

  try {
    users = await serverGet(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/users/user`,
    );
  } catch (error) {
    console.error("Error fetching users:", error);

    users = {
      data: [],
    };
  }

  return (
    <div className="space-y-6">
      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col gap-4 rounded-2xl border border-color bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-hover text-icon">
              <i className="fa fa-users text-lg"></i>
            </div>

            <div>
              <h1 className="text-xl font-bold text-primary sm:text-2xl">
                کاربرها
              </h1>

              <p className="mt-1 text-sm text-muted flex items-center flex-wrap gap-2">
                <span>مدیریت کاربرهای آگهی‌ها</span>
                {users.user_count && (
                  <span className="bg-hover px-3 py-1 text-gray rounded-full">
                    تعداد رکورد ها ({users.user_count})
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/user/trash"
            className="inline-flex flex-1 items-center justify-between gap-2 rounded-xl border border-color bg-surface px-4 py-2.5 text-sm font-medium text-secondary transition hover:bg-hover hover:text-primary"
          >
            <div className="gap-x-2 flex-center">
              <i className="fa fa-trash"></i>
              <span className="text-nowrap">سطل زباله</span>
            </div>

            {users.trash_count && (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-hover dark:bg-hover px-1.5 py-0.5 text-[11px] font-bold leading-5 text-primary border border-color">
                ({users.trash_count})
              </span>
            )}
          </Link>

          <Link
            href="/admin/user/create"
            className="flex flex-1 w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-medium text-btn shadow-sm transition hover:opacity-90 sm:w-auto"
          >
            <i className="fa fa-plus"></i>
            <span className="text-nowrap">ایجاد کاربر جدید</span>
          </Link>
        </div>
      </div>

      {/* ================= SUCCESS MESSAGES ================= */}
      <Suspense fallback={null}>
        <SuccessMessage
          messages={{
            createSuccess: "کاربر با موفقیت ایجاد شد.",
            editSuccess: "کاربر با موفقیت ویرایش شد.",
            deleteSuccess: "کاربر با موفقیت حذف شد.",
            deletesSuccess: "کاربر های انتخاب شده با موفقیت حذف شدند.",
          }}
        />
      </Suspense>

      {/* ================= User LIST ================= */}
      <UserList users={users} />
    </div>
  );
}

export default UserPage;
