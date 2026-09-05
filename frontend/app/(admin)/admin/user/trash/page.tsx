import React, { Suspense } from "react";
import Link from "next/link";
import SuccessMessage from "@/app/components/ui/SuccessMessage";
import UserTrashList from "./UserTrashList";
import { serverGet } from "@/app/lib/serverFetch";
export const metadata = {
  title: "سطل زباله کاربرها",
  description: "لیست کاربرها‌ی دور ریخته شده",
};
async function UserPage() {
  let users;

  try {
    users = await serverGet(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/users/user/trash`,
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
              <i className="fa fa-trash text-lg"></i>
            </div>

            <div>
              <h1 className="text-xl font-bold text-primary sm:text-2xl">
                سطل زباله
              </h1>

              <p className="mt-1 text-sm text-muted">مدیریت کاربرهای آگهی‌ها</p>
            </div>
          </div>
        </div>

        <Link
          href="/admin/user"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-color bg-surface px-5 py-3 text-sm font-medium text-secondary hover:bg-hover hover:text-primary shadow-sm transition sm:w-auto"
        >
          <i className="fa fa-arrow-right"></i>
          بازگشت به کاربرها
        </Link>
      </div>

      {/* ================= SUCCESS MESSAGES ================= */}
      <Suspense fallback={null}>
        <SuccessMessage
          messages={{
            createSuccess: "کاربر با موفقیت ایجاد شد.",
            editSuccess: "کاربر با موفقیت ویرایش شد.",
            deleteSuccess: "کاربر با موفقیت حذف موقت شد.",
            restoreSuccess: "کاربر با موفقیت بازگردنده شد.",
            restoresSuccess: "کاربر با موفقیت بازگردنده شدند.",
            forceDeleteSuccess: "کاربر با موفقیت حذف دائم شدند.",
          }}
        />
      </Suspense>

      {/* ================= CATEGORY LIST ================= */}
      <UserTrashList users={users} />
    </div>
  );
}

export default UserPage;
