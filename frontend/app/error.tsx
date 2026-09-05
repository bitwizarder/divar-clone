"use client";

import { useEffect } from "react";
import React from "react";
import { getFriendlyErrorMessage } from "@/app/lib/errorHandler"; // ✅ اضافه کردن import

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // لاگ خطا در کنسول برای دیباگ (همچنان انگلیسی)
    console.error(error);
  }, [error]);

  // تبدیل خطا به پیام فارسی
  const friendlyMessage = getFriendlyErrorMessage(error);
  // (اختیاری) نمایش پیام فنی در حالت توسعه
  const technicalMessage = process.env.NODE_ENV === "development" ? error.message : "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* آیکون یا تصویر خطا */}
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-4">
            <svg
              className="h-12 w-12 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* عنوان خطا */}
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          مشکلی پیش آمده!
        </h1>

        {/* ✅ پیام خطا به فارسی */}
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {friendlyMessage}
        </p>

        {/* (اختیاری) نمایش پیام فنی در حالت توسعه برای دیباگ */}
        {technicalMessage && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            {technicalMessage}
          </p>
        )}

        {/* دکمه تلاش مجدد */}
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150 shadow-sm"
        >
          تلاش مجدد
        </button>

        {/* توضیح کمکی */}
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          در صورت تکرار خطا، لطفاً با پشتیبانی تماس بگیرید.
        </p>
      </div>
    </div>
  );
}