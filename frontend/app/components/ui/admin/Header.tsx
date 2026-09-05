"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/app/context/AuthContext";

function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // بستن منو با کلیک خارج از آن
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      setError(null);
      setIsLoggingOut(true);
      await logout();
      router.push("/auth/login-register");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در خروج");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayName = user?.name || user?.mobile || "ادمین";

  return (
    <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6">
      <nav className="flex min-h-16 items-center justify-between rounded-2xl border border-color bg-surface px-3 shadow-sm sm:px-4">
        {/* سمت راست - منو و عنوان */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-hover text-primary transition hover:opacity-80 lg:hidden"
            aria-label="باز کردن منو"
          >
            <i className="fa fa-bars"></i>
          </button>
          <div>
            <h1 className="text-lg font-bold text-primary sm:text-xl">
              پنل مدیریت
            </h1>
            <p className="hidden text-xs text-muted sm:block">
              مدیریت و کنترل سایت
            </p>
          </div>
        </div>

        {/* سمت چپ - دکمه‌ها و منوی کاربر */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {error && (
            <span className="text-xs text-red-500 dark:text-red-400">
              {error}
            </span>
          )}

          <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-color bg-surface text-secondary transition hover:border-accent hover:text-primary">
            <i className="fa fa-bell"></i>
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent"></span>
          </button>

          {/* منوی کاربری */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full bg-rose-100 px-3 py-2 transition-colors duration-200 hover:bg-rose-200 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
              aria-label="منوی کاربر"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-sm font-semibold text-white">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden text-sm font-medium text-gray-700 dark:text-gray-200 sm:inline">
                {displayName}
              </span>
              <i
                className={`fa fa-chevron-down text-xs text-gray-500 transition-transform duration-200 dark:text-gray-400 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              ></i>
            </button>

            {/* منوی کشویی */}
            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {displayName}
                  </p>
                  {user?.email && (
                    <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  )}
                  {user?.mobile && !user?.email && (
                    <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                      {user.mobile}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    نقش: {user?.user_type === 1 ? "مدیر" : "کاربر"}
                  </p>
                </div>

                <div className="py-1">
                  <a
                    href="/admin/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    <i className="fa fa-user w-5 text-center"></i>
                    <span>پروفایل</span>
                  </a>

                  <a
                    href="/admin/setting"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    <i className="fa fa-cog w-5 text-center"></i>
                    <span>تنظیمات</span>
                  </a>

                  <hr className="my-1 border-gray-200 dark:border-gray-700" />

                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <i className="fa fa-sign-out-alt w-5 text-center"></i>
                    <span>{isLoggingOut ? "در حال خروج..." : "خروج"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
