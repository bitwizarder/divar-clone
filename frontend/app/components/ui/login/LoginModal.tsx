"use client";

import React, { useState, useEffect } from "react";
import Modal from "../home/modal/Modal";
import { useAuth } from "@/app/context/AuthContext";
import { getFriendlyErrorMessage } from "@/app/lib/errorHandler";
import OtpInput from "@/app/components/ui/OtpInput"; // مسیر صحیح را تنظیم کن

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const { sendOtp, login } = useAuth();
  const [step, setStep] = useState<"login" | "verify">("login");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [token, setToken] = useState<string>("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // ریست حالت‌ها هنگام بسته شدن مودال
  useEffect(() => {
    if (!isOpen) {
      setStep("login");
      setIdentifier("");
      setOtp("");
      setToken("");
      setError(null);
      setSuccess(null);
      setLoading(false);
      setResendCooldown(0);
    }
  }, [isOpen]);

  // تایمر برای کادرداون ارسال مجدد
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

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
      setOtp(""); // ریست کد
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
        onClose();
        if (onSuccess) onSuccess();
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

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const result = await sendOtp(identifier.trim());
      setToken(result.token);
      setSuccess("کد تایید مجدداً ارسال شد.");
      setResendCooldown(60);
      setOtp("");
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === "login" ? "ورود به حساب کاربری" : "تأیید کد"}
      size="sm"
      showCloseButton={true}
      closeOnOutsideClick={false}
    >
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">
          {success}
        </div>
      )}

      {step === "login" ? (
        <form onSubmit={handleSendOtp}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              شماره موبایل یا ایمیل
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="مثلاً 09123456789 یا info@example.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              disabled={loading}
              autoFocus
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              کد تایید به این شماره یا ایمیل ارسال خواهد شد.
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-rose-700 py-2.5 text-sm font-medium text-white transition hover:bg-rose-800 disabled:opacity-50"
          >
            {loading ? "در حال ارسال..." : "ارسال کد تایید"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <div className="mb-4">
            <label className="mb-3 block text-center text-sm font-medium text-gray-700 dark:text-gray-300">
              کد تایید ارسال‌شده به {identifier} را وارد کنید
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
            className="w-full rounded-lg bg-rose-700 py-2.5 text-sm font-medium text-white transition hover:bg-rose-800 disabled:opacity-50"
          >
            {loading ? "در حال تأیید..." : "تأیید و ورود"}
          </button>

          <div className="mt-3 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="text-sm text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 transition"
            >
              ← برگشت به مرحله قبل
            </button>

            {resendCooldown === 0 && (
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
    </Modal>
  );
}

export default LoginModal;
