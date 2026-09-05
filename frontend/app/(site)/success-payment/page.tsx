"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const authority = searchParams.get("Authority");
    const statusParam = searchParams.get("Status");

    if (statusParam === "OK" && authority) {
      setStatus("success");
      setMessage("پرداخت با موفقیت انجام شد. آگهی شما ویژه شد.");
      // بعد از ۳ ثانیه به پنل بازگردان
      //   setTimeout(() => {
      //     router.push("/panel/advertisements");
      //   }, 5000);
    } else {
      setStatus("error");
      setMessage("پرداخت ناموفق بود. لطفاً مجدداً تلاش کنید.");
    }
  }, [searchParams, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <i className="fa fa-spinner fa-spin text-3xl text-rose-600"></i>
          <p className="text-gray-500">در حال بررسی پرداخت...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl dark:bg-gray-800">
        {status === "success" ? (
          <>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <i className="fa fa-check text-4xl text-green-600"></i>
            </div>
            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
              پرداخت موفق
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{message}</p>
            <Link
              href="/panel/advertisements"
              className="mt-6 inline-block rounded-lg bg-rose-600 px-6 py-2 text-white transition hover:bg-rose-700"
            >
              بازگشت به آگهی‌های من
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <i className="fa fa-times text-4xl text-red-600"></i>
            </div>
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
              پرداخت ناموفق
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{message}</p>
            <Link
              href="/panel/advertisements"
              className="mt-6 inline-block rounded-lg bg-rose-600 px-6 py-2 text-white transition hover:bg-rose-700"
            >
              بازگشت به آگهی‌های من
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div>در حال بارگذاری...</div>}>
      <PaymentResultContent />
    </Suspense>
  );
}
