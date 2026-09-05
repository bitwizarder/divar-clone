// app/auth/login-register/page.tsx (یا هر مسیری که داری)
"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { getFriendlyErrorMessage } from "@/app/lib/errorHandler";
import OtpInput from "@/app/components/ui/OtpInput"; // مسیر درست را تنظیم کن

function LoginRegister() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";
  const { isAuthenticated, sendOtp, login } = useAuth();

  const [step, setStep] = useState<"login" | "verify">("login");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState(""); // اینجا کل کد ۶ رقمی ذخیره می‌شود
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [token, setToken] = useState<string>("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // ref برای فوکوس اولیه در مرحله لاگین (اختیاری)
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, redirectPath, router]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // فوکوس روی فیلد اول لاگین
  useEffect(() => {
    if (step === "login" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [step]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!identifier.trim()) {
      setError("لطفاً شماره موبایل یا ایمیل خود را وارد کنید.");
      setLoading(false);
      return;
    }

    try {
      const result = await sendOtp(identifier.trim());
      setToken(result.token);
      setSuccess("کد تایید با موفقیت ارسال شد.");
      setStep("verify");
      setResendCooldown(60);
      // ریست کد OTP هنگام رفتن به مرحله verify
      setOtp("");
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (otp.length < 4) {
      setError("لطفاً کد تایید ۴ یا ۶ رقمی را کامل وارد کنید.");
      setLoading(false);
      return;
    }

    try {
      await login(identifier.trim(), otp, token);
      setSuccess("ورود با موفقیت انجام شد.");
      setTimeout(() => {
        router.push(redirectPath);
      }, 1000);
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setStep("login");
    setOtp("");
    setError(null);
  };

  // تابع برای ارسال مجدد کد (از دکمه داخل مرحله verify)
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const result = await sendOtp(identifier.trim());
      setToken(result.token);
      setSuccess("کد تایید مجدداً ارسال شد.");
      setResendCooldown(60);
      setOtp(""); // reset
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Link href="/">
              <Image
                src="/images/logo.png"
                width={80}
                height={80}
                alt="لوگو"
                className="h-20 w-auto"
                priority
              />
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-rose-700 dark:text-rose-500">
            {step === "login" ? "ورود به حساب کاربری" : "تأیید کد"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            {step === "login"
              ? "شماره موبایل یا ایمیل خود را وارد کنید"
              : `کد تایید ارسال‌شده به ${identifier} را وارد کنید`}
          </p>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-600 dark:text-green-400">
            {success}
          </div>
        )}

        {step === "login" ? (
          <form onSubmit={handleSendOtp} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                شماره موبایل یا ایمیل
              </label>
              <input
                ref={inputRef}
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="مثلاً 09123456789 یا info@example.com"
                className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 dark:bg-gray-700 dark:text-white outline-none transition"
                disabled={loading}
                suppressHydrationWarning
              />
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                کد تایید به این شماره یا ایمیل ارسال خواهد شد.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-medium rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "در حال ارسال..." : "ارسال کد تایید"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="mt-6 space-y-6">
            {/* کامپوننت OtpInput جایگزین input ساده شده */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
                کد تایید را وارد کنید
              </label>
              <OtpInput
                length={6}
                value={otp}
                onChange={(newOtp) => setOtp(newOtp)}
                disabled={loading}
                className="justify-center"
              />
              <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
                {resendCooldown > 0
                  ? `ارسال مجدد کد پس از ${resendCooldown} ثانیه`
                  : "کد را می‌توانید با کلیک روی ارسال مجدد، دوباره دریافت کنید"}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="w-full py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-medium rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "در حال تأیید..." : "تأیید و ورود"}
            </button>

            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-sm text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 transition"
              >
                ← برگشت به مرحله قبل
              </button>

              {resendCooldown === 0 && step === "verify" && (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-sm text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 transition"
                >
                  ارسال مجدد کد
                </button>
              )}
            </div>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-400 dark:text-gray-500">
          <a
            href="/"
            className="hover:text-rose-600 dark:hover:text-rose-400 transition"
          >
            بازگشت به صفحه اصلی
          </a>
        </div>
      </div>
    </div>
  );
}

export default LoginRegister;
