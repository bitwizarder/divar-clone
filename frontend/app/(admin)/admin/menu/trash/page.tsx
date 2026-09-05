import React, { Suspense } from "react";
import Link from "next/link";
import SuccessMessage from "@/app/components/ui/SuccessMessage";
import MenuTrashList from "./MenuTrashList";
import { serverGet } from "@/app/lib/serverFetch";
export const metadata = {
  title: "سطل زباله منو‌ها",
  description: "لیست منو‌ها‌ی دور ریخته شده",
};
async function MenuPage() {
  let menus;

  try {
    menus = await serverGet(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/content/menu/trash`,
    );
  } catch (error) {
    console.error("Error fetching menus:", error);

    menus = {
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

              <p className="mt-1 text-sm text-muted">مدیریت منوهای آگهی‌ها</p>
            </div>
          </div>
        </div>

        <Link
          href="/admin/menu"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-color bg-surface px-5 py-3 text-sm font-medium text-secondary hover:bg-hover hover:text-primary shadow-sm transition sm:w-auto"
        >
          <i className="fa fa-arrow-right"></i>
          بازگشت به منوها
        </Link>
      </div>

      {/* ================= SUCCESS MESSAGES ================= */}
      <Suspense fallback={null}>
        <SuccessMessage
          messages={{
            createSuccess: "منو با موفقیت ایجاد شد.",
            editSuccess: "منو با موفقیت ویرایش شد.",
            deleteSuccess: "منو با موفقیت حذف موقت شد.",
            restoreSuccess: "منو با موفقیت بازگردنده شد.",
            restoresSuccess: "منو با موفقیت بازگردنده شدند.",
            forceDeleteSuccess: "منو با موفقیت حذف دائم شدند.",
          }}
        />
      </Suspense>

      {/* ================= CATEGORY LIST ================= */}
      <MenuTrashList menus={menus} />
    </div>
  );
}

export default MenuPage;
