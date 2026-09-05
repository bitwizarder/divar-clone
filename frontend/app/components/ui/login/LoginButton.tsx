"use client";

import React, { useState, useRef, useEffect } from "react";
import LoginModal from "./LoginModal";
import { useAuth } from "@/app/context/AuthContext";

function LoginButton() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const handleLoginSuccess = () => {
    // پس از لاگین موفق در مودال، نیازی به کاری نیست چون AuthContext قبلاً به‌روز شده
    // اما می‌توانید اینجا منطق دیگری اضافه کنید
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
      alert(error instanceof Error ? error.message : "خطا در خروج از حساب");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <button
          onClick={openLoginModal}
          className="bg-rose-700 px-5 py-3 rounded text-white font-bold hover:bg-rose-800 transition-colors duration-200 flex items-center gap-2"
        >
          <i className="fa fa-sign-in-alt"></i>
          <span>ورود</span>
        </button>
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={closeLoginModal}
          onSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  const displayName = user?.name || user?.mobile || "کاربر";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full px-3 py-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
        aria-label="منوی کاربر"
      >
        <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center text-sm font-semibold">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <i
          className={`fa fa-chevron-down text-xs transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
        ></i>
      </button>

      {isDropdownOpen && (
        <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {displayName}
            </p>
            {user?.email && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {user.email}
              </p>
            )}
            {user?.mobile && !user?.email && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {user.mobile}
              </p>
            )}
          </div>

          <div className="py-1">
            <a
              href="/panel"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <i className="fa fa-user w-5 text-center"></i>
              <span>پروفایل</span>
            </a>

            <a
              href="/panel/advertisements"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <i className="fa fa-list w-5 text-center"></i>
              <span>آگهی‌های من</span>
            </a>

            <hr className="my-1 border-gray-200 dark:border-gray-700" />

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              <i className="fa fa-sign-out-alt w-5 text-center"></i>
              <span>{isLoggingOut ? "در حال خروج..." : "خروج"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginButton;
