"use client";

import React, { useEffect, useState } from "react";

import ImageUploader from "@/app/components/ui/common/ImageUploader";
import { SettingFormProps } from "@/app/types/setting";
import { useRouter } from "next/navigation";
import { useTimeout } from "@/app/hooks/useTimeout";
import { toPersianNumber } from "@/app/helpers";
import { getImageUrl } from "@/app/helpers/image";

function SettingForm({ setting }: SettingFormProps) {
  const [title, setTitle] = useState(setting?.title || "");
  const [description, setDescription] = useState(setting?.description || "");
  const [logo, setLogo] = useState<File | null>(null);
  const [favicon, setFavicon] = useState<File | null>(null);

  const [email, setEmail] = useState(setting.email || "");
  const [phone, setPhone] = useState(setting.phone || "");
  const [keywords, setKeywords] = useState(setting.keywords || "");

  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter();

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

  const validateForm = () => {
    if ((title && title.trim().length < 2) || title.trim().length > 255) {
      setError("عنوان باید بین ۲ تا ۲۵۵ کاراکتر باشد.");
      return false;
    }

    if (description.trim().length < 2 || description.trim().length > 255) {
      setError("توضیحات باید بین ۲ تا ۲۵۵ کاراکتر باشد.");
      return false;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (email && emailRegex && !emailRegex.test(email.trim())) {
      setError("لطفاً یک ایمیل معتبر وارد کنید (مثال: info@site.com).");
      return false;
    }
    // ۴. شماره تلفن (اختیاری - پشتیبانی از موبایل و ثابت)
    const phoneRegex = /^0[1-9][0-9]{1,2}[0-9]{7,8}$/;
    if (phone && phone.trim() && !phoneRegex.test(phone.trim())) {
      setError(
        "شماره تلفن باید با ۰ شروع و حداقل ۱۰ رقم باشد (مثال: ۰۲۱۱۲۳۴۵۶۷۸ یا ۰۹۱۲۳۴۵۶۷۸۹).",
      );
      return false;
    }
    if (
      (keywords && keywords.trim().length < 2) ||
      keywords.trim().length > 255
    ) {
      setError("کلمات کلیدی باید بین ۲ تا ۲۵۵ کاراکتر باشد.");
      return false;
    }

    return true;
  };

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

    const formData = new FormData();

    formData.append("title", title?.trim() || "");
    formData.append("description", description?.trim() || "");
    formData.append("email", email?.trim() || "");
    formData.append("phone", phone?.trim() || "");
    formData.append("keywords", keywords?.trim() || "");
    formData.append("_method", "PUT");
    if (logo) {
      formData.append("logo", logo);
    }

    if (favicon) {
      formData.append("favicon", favicon);
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/setting/${setting.id}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "X-XSRF-TOKEN": csrfToken,
          },
          credentials: "include",
          body: formData,
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
          throw new Error(result.message || "اطلاعات وارد شده معتبر نیست.");
        }

        throw new Error(result.message || "خطایی در ویرایش تنظیمات رخ داد.");
      }

      setSuccess("تنظیمات با موفقیت ویرایش شد.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "خطا در ارسال اطلاعات");
    } finally {
      setLoading(false);
    }
  };
  useTimeout(
    () => {
      if (success) {
        router.push("/admin/setting?editSuccess=1");
      }
    },
    success ? 800 : null,
  );

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

      {/* Form */}
      <div className="space-y-6">
        {/* Basic Info */}
        <div>
          <div className="mb-5">
            <h2 className="text-lg font-bold text-secondary">
              اطلاعات تنظیمات
            </h2>

            <p className="mt-1 text-sm text-gray">
              اطلاعات اصلی تنظیمات را وارد کنید.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Name */}
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-gray-dark"
              >
                عنوان سایت
              </label>

              <div className="relative">
                <i className="fa fa-tag absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>

                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثلاً سایت دیوار"
                  className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 py-3 pr-10 pl-4 text-sm text-primary outline-none transition focus:border-blue-500 dark:focus:border-blue-100/10 focus:bg-surface focus:ring-0"
                />
              </div>

              <p className="mt-2 text-xs text-gray-400">بین ۲ تا ۲۲۵ کاراکتر</p>
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
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ایمیل"
                  className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 py-3 pr-10 pl-4 text-sm text-primary outline-none transition focus:border-blue-500 dark:focus:border-blue-100/10 focus:bg-surface focus:ring-0"
                />
              </div>

              <p className="mt-2 text-xs text-gray-400">بین ۲ تا ۲۲۵ کاراکتر</p>
            </div>
            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-gray-dark"
              >
                شماره تلفن
              </label>

              <div className="relative">
                <i className="fa fa-phone absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>

                <input
                  id="phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="مثلاً ۰۹۱۲۹۱۸۲۷۶۶"
                  className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 py-3 pr-10 pl-4 text-sm text-primary outline-none transition focus:border-blue-500 dark:focus:border-blue-100/10 focus:bg-surface focus:ring-0"
                />
              </div>

              <p className="mt-2 text-xs text-gray-400">بین ۲ تا ۲۲۵ کاراکتر</p>
            </div>
            {/* Keywords */}
            <div>
              <label
                htmlFor="keywords"
                className="mb-2 block text-sm font-medium text-gray-dark"
              >
                کلمات کلیدی
              </label>

              <div className="relative">
                <i className="fa fa-envelope absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>

                <input
                  id="keywords"
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="کلمه کلیدی"
                  className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 py-3 pr-10 pl-4 text-sm text-primary outline-none transition focus:border-blue-500 dark:focus:border-blue-100/10 focus:bg-surface focus:ring-0"
                />
              </div>

              <p className="mt-2 text-xs text-gray-400">بین ۲ تا ۲۲۵ کاراکتر</p>
            </div>

            {/* Logo */}
            <ImageUploader
              label="لوگو"
              value={logo}
              // preview={setting?.logo || ""}
              preview={setting.logo ? getImageUrl(setting.logo) : ""}
              onChange={setLogo}
              maxSize={2}
              aspect="square"
              priority
              accept={[
                "image/jpeg",
                "image/png",
                "image/jpg",
                "image/gif",
                "image/webp",
              ]}
            />

            {/* Favicon */}
            <ImageUploader
              label="فاوآیکون"
              value={favicon}
              priority
              preview={setting.favicon ? getImageUrl(setting.favicon) : ""}
              onChange={setFavicon}
              maxSize={2}
              aspect="square"
              accept={[
                "image/jpeg",
                "image/png",
                "image/jpg",
                "image/gif",
                "image/webp",
                "image/x-icon",
                "image/vnd.microsoft.icon",
              ]}
            />

            {/* Description */}
            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-gray-dark"
              >
                توضیحات
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="توضیح مختصری درباره سایت خود بنویسید..."
                className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 px-4 py-3 text-sm text-primary outline-none transition focus:border-blue-500 dark:focus:border-blue-100/10 focus:bg-surface focus:ring-0 placeholder:text-gray"
              />

              <div className="mt-2 flex justify-between text-xs text-gray-400">
                <span>بین ۲ تا ۵۰۰ کاراکتر</span>

                <span>{toPersianNumber(description.length)}/۵۰۰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col-reverse gap-3 border-t border-color pt-6 sm:flex-row sm:justify-start">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !csrfToken}
            className="flex items-center justify-center gap-2 rounded-xl bg-accent px-7 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-300/50 disabled:opacity-100"
          >
            {loading ? (
              <>
                <i className="fa fa-spinner fa-spin"></i>
                در حال بروزرسانی...
              </>
            ) : (
              <>
                <i className="fa-solid fa-pen-to-square"></i>
                بروزرسانی
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingForm;
