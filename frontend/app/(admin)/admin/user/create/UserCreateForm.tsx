"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTimeout } from "@/app/hooks/useTimeout";

function UserCreateForm() {
  // Stateهای مربوط به کاربر
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [cityId, setCityId] = useState<number | null>(null);
  const [cities, setCities] = useState<{ id: number; name: string }[]>([]); // لیست شهرها

  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter();

  // دریافت CSRF Token
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/sanctum/csrf-cookie`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("XSRF-TOKEN="))
          ?.split("=")[1];

        if (token) {
          setCsrfToken(decodeURIComponent(token));
        }
      } catch (error) {
        setError("خطا در دریافت CSRF token");
        console.error(error);
      }
    };

    fetchCsrfToken();
  }, []);

  // دریافت لیست شهرها (اختیاری - در صورت نیاز)
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cities`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            credentials: "include",
          },
        );

        if (!res.ok) {
          throw new Error("خطا در دریافت شهرها");
        }

        const result = await res.json();
        setCities(result.data || []);
      } catch (error) {
        console.error("خطا در دریافت شهرها:", error);
      }
    };

    fetchCities();
  }, []);

  // اعتبارسنجی سمت کلاینت (مطابق با قوانین لاراول)
  const validateForm = () => {
    // name
    if (name.trim().length < 2 || name.trim().length > 255) {
      setError("نام باید بین ۲ تا ۲۵۵ کاراکتر باشد.");
      return false;
    }

    // email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (email && (!email.trim() || !emailRegex.test(email.trim()))) {
      setError("لطفاً یک ایمیل معتبر وارد کنید.");
      return false;
    }

    // mobile (۱۱ رقم، شروع با ۰۹)
    const mobileRegex = /^09[0-9]{9}$/;
    if (!mobile.trim() || !mobileRegex.test(mobile.trim())) {
      setError("شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.");
      return false;
    }

    // password (حداقل ۸ و حداکثر ۱۵ کاراکتر)
    if (password.length < 8 || password.length > 15) {
      setError("رمز عبور باید بین ۸ تا ۱۵ کاراکتر باشد.");
      return false;
    }

    // تطابق رمز عبور
    if (password !== passwordConfirmation) {
      setError("رمز عبور و تکرار آن مطابقت ندارند.");
      return false;
    }

    return true;
  };

  // ریدایرکت پس از موفقیت
  useTimeout(
    () => {
      if (success) {
        router.push("/admin/user?createSuccess=1");
      }
    },
    success ? 800 : null,
  );

  // ارسال فرم
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);

    if (!csrfToken) {
      setError("CSRF token موجود نیست.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const formData = {
      name: name.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      password: password,
      password_confirmation: passwordConfirmation,
      is_active: isActive ? 1 : 0,
      city_id: cityId,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/users/user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-XSRF-TOKEN": csrfToken,
          },
          credentials: "include",
          body: JSON.stringify(formData),
        },
      );

      const result = await res.json();

      if (!res.ok) {
        if (res.status === 419) {
          throw new Error("CSRF token منقضی شده است. لطفاً دوباره تلاش کنید.");
        }

        if (res.status === 403) {
          throw new Error("شما دسترسی لازم برای این عملیات را ندارید.");
        }

        if (res.status === 422) {
          // نمایش خطاهای اعتبارسنجی از سرور
          const errors = result.errors;
          if (errors) {
            throw new Error(result.message || "اطلاعات وارد شده معتبر نیست.");
          }
          throw new Error(result.message || "اطلاعات وارد شده معتبر نیست.");
        }

        throw new Error(result.message || "خطایی در ایجاد کاربر رخ داد.");
      }

      setSuccess("کاربر با موفقیت ایجاد شد.");

      // ریست کردن فرم
      setName("");
      setEmail("");
      setMobile("");
      setPassword("");
      setPasswordConfirmation("");
      setIsActive(true);
      setCityId(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "خطا در ارسال اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-200/50 bg-red-50 dark:bg-red-50/20 p-4 text-red-700 dark:text-red-400">
          <i className="fa fa-exclamation-circle mt-0.5 text-lg"></i>
          <div>
            <p className="text-sm font-medium">خطا</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 dark:border-green-200/50 bg-green-50 dark:bg-green-50/20 p-4 text-green-700 dark:text-green-400">
          <i className="fa fa-check-circle mt-0.5 text-lg"></i>
          <div>
            <p className="text-sm font-medium">عملیات موفق</p>
            <p className="mt-1 text-sm">{success}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-secondary">اطلاعات کاربر</h2>
          <p className="mt-1 text-sm text-gray">
            اطلاعات اصلی کاربر را وارد کنید.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-dark"
            >
              نام کامل
            </label>
            <div className="relative">
              <i className="fa fa-user absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً علی محمدی"
                className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 py-3 pr-10 pl-4 text-sm text-primary outline-none transition focus:border-blue-500 dark:focus:border-blue-100/10 focus:bg-surface focus:ring-0"
              />
            </div>
            <p className="mt-2 text-xs text-gray-400">بین ۲ تا ۲۵۵ کاراکتر</p>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-dark"
            >
              ایمیل
            </label>
            <div className="relative">
              <i className="fa fa-envelope absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@example.com"
                className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 py-3 pr-10 pl-4 text-sm text-primary outline-none transition focus:border-blue-500 dark:focus:border-blue-100/10 focus:bg-surface focus:ring-0"
              />
            </div>
            <p className="mt-2 text-xs text-gray-400">
              یک ایمیل معتبر وارد کنید
            </p>
          </div>

          {/* Mobile */}
          <div>
            <label
              htmlFor="mobile"
              className="mb-2 block text-sm font-medium text-gray-dark"
            >
              شماره موبایل
            </label>
            <div className="relative">
              <i className="fa fa-phone absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                id="mobile"
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 py-3 pr-10 pl-4 text-sm text-primary outline-none transition focus:border-blue-500 dark:focus:border-blue-100/10 focus:bg-surface focus:ring-0"
              />
            </div>
            <p className="mt-2 text-xs text-gray-400">
              ۱۱ رقم و با ۰۹ شروع شود
            </p>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-dark"
            >
              رمز عبور
            </label>
            <div className="relative">
              <i className="fa fa-lock absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 py-3 pr-10 pl-4 text-sm text-primary outline-none transition focus:border-blue-500 dark:focus:border-blue-100/10 focus:bg-surface focus:ring-0"
              />
            </div>
            <p className="mt-2 text-xs text-gray-400">بین ۸ تا ۱۵ کاراکتر</p>
          </div>

          {/* Password Confirmation */}
          <div>
            <label
              htmlFor="password_confirmation"
              className="mb-2 block text-sm font-medium text-gray-dark"
            >
              تکرار رمز عبور
            </label>
            <div className="relative">
              <i className="fa fa-lock absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                id="password_confirmation"
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 py-3 pr-10 pl-4 text-sm text-primary outline-none transition focus:border-blue-500 dark:focus:border-blue-100/10 focus:bg-surface focus:ring-0"
              />
            </div>
            <p className="mt-2 text-xs text-gray-400">تکرار رمز عبور</p>
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="is_active"
              className="mb-2 block text-sm font-medium text-gray-dark"
            >
              وضعیت
            </label>
            <select
              id="is_active"
              value={isActive ? 1 : 0}
              onChange={(e) => setIsActive(Number(e.target.value) === 1)}
              className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 px-4 py-3 text-sm text-primary outline-none transition focus:border-blue-500 dark:focus:border-blue-100/10 focus:bg-surface focus:ring-0"
            >
              <option value={1}>فعال</option>
              <option value={0}>غیرفعال</option>
            </select>
          </div>

          {/* City */}
          <div>
            <label
              htmlFor="parent_id"
              className="mb-2 block text-sm font-medium text-gray-dark"
            >
              دسته والد
            </label>

            <select
              id="parent_id"
              value={cityId ?? ""}
              onChange={(e) =>
                setCityId(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 px-4 py-3 text-sm text-primary outline-none transition focus:border-blue-500 dark:focus:border-blue-100/10 focus:bg-surface focus:ring-0"
            >
              <option value="">انتخاب شهر</option>

              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>

            <p className="mt-2 text-xs text-gray-400">اختیاری</p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col-reverse gap-3 border-t border-color pt-6 sm:flex-row sm:justify-start">
          <button
            type="submit"
            disabled={loading || !csrfToken}
            className="flex items-center justify-center gap-2 rounded-xl bg-accent px-7 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-300/50 disabled:opacity-100"
          >
            {loading ? (
              <>
                <i className="fa fa-spinner fa-spin"></i>
                در حال ایجاد...
              </>
            ) : (
              <>
                <i className="fa fa-plus"></i>
                ایجاد کاربر
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserCreateForm;
