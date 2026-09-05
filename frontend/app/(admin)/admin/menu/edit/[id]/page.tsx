import React from "react";
import Link from "next/link";
import MenuEditForm from "./MenuEditForm";
import { notFound } from "next/navigation";
import { MenuListResponse, MenuResponse } from "@/app/types/menu";
import { serverGet } from "@/app/lib/serverFetch";
export const metadata = {
  title: "ویرایش منو جدید",
  description: "فرم ویرایش منو جدید در پنل مدیریت",
};
async function getMenu(id: number): Promise<MenuResponse> {
  return await serverGet(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/content/menu/${id}`,
  );
}

async function getMenus(): Promise<MenuListResponse> {
  return await serverGet(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/content/menu`,
  );
}

async function MenuEditPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    // ۱. باز کردن Promise params
    const { id } = await params;
    const numericId = Number(id); // تبدیل به عدد

    // اعتبارسنجی شناسه
    if (isNaN(numericId) || numericId <= 0) {
      notFound();
    }

    // ۲. دریافت داده‌ها
    // const menu = await getMenu(numericId);
    // const menus = await getMenus();

    // اجرای موازی (Parallel) با Promise.all
    //  زمان کلی کاهش می یابد
    // این دو مستقل هستند، همزمان اجرا می‌شوند
    const [menu, menus] = await Promise.all([getMenu(numericId), getMenus()]);
    // اگر یکی از آنها خطا دهد، کل Promise.all خطا می‌دهد.

    // بررسی وجود منو
    if (!menu?.data || !menu.data.id) {
      notFound();
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 rounded-2xl border border-color bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">ویرایش منو</h1>
            <p className="mt-2 text-sm text-gray">
              اطلاعات منو را ویرایش کنید.
            </p>
          </div>

          <Link
            href="/admin/menu"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-color bg-surface px-5 py-3 text-sm font-medium text-secondary hover:bg-hover hover:text-primary shadow-sm transition sm:w-auto"
          >
            <i className="fa fa-arrow-right"></i>
            بازگشت به منوها
          </Link>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-color bg-surface text-primary p-5 shadow-sm sm:p-7">
          <MenuEditForm menu={menu.data} menus={menus.data} />
        </div>
      </div>
    );
  } catch (error) {
    // اگر خطای ۴۰۴ باشد، منو ۴۰۴ نمایش داده شود
    if (error instanceof Error && error.message === "منو مورد نظر یافت نشد.") {
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
            {error instanceof Error ? error.message : "منو مورد نظر یافت نشد."}
          </p>
          <Link
            href="/admin/menu"
            className="mt-4 inline-block rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
          >
            بازگشت به لیست
          </Link>
        </div>
      </div>
    );
  }
}

export default MenuEditPage;
