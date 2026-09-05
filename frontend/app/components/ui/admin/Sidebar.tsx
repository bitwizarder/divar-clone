"use client";
import Link from "next/link";
import { useState } from "react";

function Sidebar({ onClose }: { onClose?: () => void }) {
  // وضعیت باز بودن منوی دسته‌ها (پیش‌فرض بسته)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const toggleCategoryMenu = () => setIsCategoryOpen((prev) => !prev);

  return (
    <div className="flex h-full flex-col bg-surface text-primary">
      {/* هدر سایدبار (بدون تغییر) */}
      <div className="flex h-20 items-center justify-between border-b border-color px-5">
        <Link
          href="/admin"
          onClick={onClose}
          className="flex items-center gap-3"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-white shadow-sm">
            <i className="fa fa-dashboard text-lg"></i>
          </div>
          <div>
            <p className="text-sm font-bold text-primary">پنل مدیریت</p>
            <p className="mt-0.5 text-xs text-muted">مدیریت سایت</p>
          </div>
        </Link>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-hover hover:text-primary lg:hidden"
          aria-label="بستن منو"
        >
          <i className="fa fa-times text-lg"></i>
        </button>
      </div>

      {/* ناوبری اصلی */}
      <nav className="admin-scrollbar flex-1 overflow-y-auto p-4">
        <div className="mb-3 px-2 text-xs font-medium text-muted">
          منوی اصلی
        </div>
        <div className="space-y-2">
          {/* داشبورد (تکی) */}
          <Link
            href="/admin"
            onClick={onClose}
            className="group flex items-center gap-3 rounded-xl px-3 py-3 text-primary transition-all hover:bg-hover"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-lighter text-secondary transition group-hover:text-icon">
              <i className="fa fa-home"></i>
            </span>
            <span className="text-sm font-medium">داشبورد</span>
          </Link>

          {/* منوی گروهی: مدیریت دسته‌ها */}
          <div>
            {/* دکمه بازکننده منو */}
            <button
              onClick={toggleCategoryMenu}
              className="group flex w-full items-center justify-between rounded-xl px-3 py-3 text-primary transition-all hover:bg-hover"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-lighter text-secondary transition group-hover:text-icon">
                  <i className="fa fa-sitemap"></i>
                </span>
                <span className="text-sm font-medium">مدیریت دسته‌ها</span>
              </div>
              <i
                className={`fa fa-chevron-down text-xs text-muted transition-transform duration-300 ${
                  isCategoryOpen ? "rotate-180" : ""
                }`}
              ></i>
            </button>

            {/* زیرمنو با انیمیشن ارتفاع */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isCategoryOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="mr-4 space-y-1 border-r border-color pr-2">
                {/* دسته‌بندی‌ها */}
                <Link
                  href="/admin/category"
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-primary transition-all hover:bg-hover"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-lighter text-secondary transition group-hover:text-icon">
                    <i className="fa fa-list-ul text-xs"></i>
                  </span>
                  <span>دسته‌بندی‌ها</span>
                </Link>

                {/* ویژگی دسته‌ها */}
                <Link
                  href="/admin/category-attribute"
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-primary transition-all hover:bg-hover"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-lighter text-secondary transition group-hover:text-icon">
                    <i className="fa fa-rectangle-list text-xs"></i>
                  </span>
                  <span>ویژگی‌ها</span>
                </Link>

                {/* مقادیر دسته‌ها */}
                <Link
                  href="/admin/category-value"
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-primary transition-all hover:bg-hover"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-lighter text-secondary transition group-hover:text-icon">
                    <i className="fa-regular fa-rectangle-list text-xs"></i>
                  </span>
                  <span>مقادیر</span>
                </Link>
              </div>
            </div>
          </div>

          <Link
            href="/admin/ads"
            onClick={onClose}
            className="group flex items-center gap-3 rounded-xl px-3 py-3 text-primary transition-all hover:bg-hover"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-lighter text-secondary transition group-hover:text-icon">
              <i className="fa fa-bullhorn"></i>
            </span>
            <span className="text-sm font-medium">آگهی ها</span>
          </Link>

          {/* سایر آیتم‌های تکی (مناطق، منوها، صفحات، تنظیمات، کاربران) */}
          <Link
            href="/admin/state"
            onClick={onClose}
            className="group flex items-center gap-3 rounded-xl px-3 py-3 text-primary transition-all hover:bg-hover"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-lighter text-secondary transition group-hover:text-icon">
              <i className="fa-solid fa-map-location-dot"></i>
            </span>
            <span className="text-sm font-medium">مناطق</span>
          </Link>

          <Link
            href="/admin/menu"
            onClick={onClose}
            className="group flex items-center gap-3 rounded-xl px-3 py-3 text-primary transition-all hover:bg-hover"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-lighter text-secondary transition group-hover:text-icon">
              <i className="fa-solid fa-bars"></i>
            </span>
            <span className="text-sm font-medium">منوها</span>
          </Link>
          <Link
            href="/admin/page"
            onClick={onClose}
            className="group flex items-center gap-3 rounded-xl px-3 py-3 text-primary transition-all hover:bg-hover"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-lighter text-secondary transition group-hover:text-icon">
              <i className="fa-regular fa-newspaper"></i>
            </span>
            <span className="text-sm font-medium">صفحات</span>
          </Link>
          <Link
            href="/admin/setting"
            onClick={onClose}
            className="group flex items-center gap-3 rounded-xl px-3 py-3 text-primary transition-all hover:bg-hover"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-lighter text-secondary transition group-hover:text-icon">
              <i className="fa fa-screwdriver-wrench"></i>
            </span>
            <span className="text-sm font-medium">تنظیمات</span>
          </Link>
          <Link
            href="/admin/user"
            onClick={onClose}
            className="group flex items-center gap-3 rounded-xl px-3 py-3 text-primary transition-all hover:bg-hover"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-lighter text-secondary transition group-hover:text-icon">
              <i className="fa fa-users"></i>
            </span>
            <span className="text-sm font-medium">کاربران</span>
          </Link>
        </div>
      </nav>

      {/* فوتر سایدبار (بدون تغییر) */}
      <div className="border-t border-color p-4">
        <div className="rounded-xl border border-color bg-surface p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-inverse">
              <i className="fa fa-user"></i>
            </div>
            <div className="min-w-0 space-y-2">
              <p className="truncate text-sm font-semibold text-primary">
                مدیر سیستم
              </p>
              <p className="truncate text-xs text-muted">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
