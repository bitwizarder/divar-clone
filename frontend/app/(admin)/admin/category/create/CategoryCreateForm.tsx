"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTimeout } from "@/app/hooks/useTimeout";

interface Category {
  id: number;
  name: string;
}

function CategoryCreateForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(1);
  const [icon, setIcon] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);

  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/advertise/category`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            credentials: "include",
          },
        );

        if (!res.ok) {
          throw new Error("خطا در دریافت دسته‌بندی‌ها");
        }

        const result = await res.json();

        setCategories(result.data || []);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "خطا در دریافت دسته‌بندی‌ها";

        setError(message);
      }
    };

    fetchCategories();
  }, []);

  const validateForm = () => {
    if (name.trim().length < 2 || name.trim().length > 120) {
      setError("نام باید بین ۲ تا ۱۲۰ کاراکتر باشد.");
      return false;
    }

    if (description.trim().length < 2 || description.trim().length > 500) {
      setError("توضیحات باید بین ۲ تا ۵۰۰ کاراکتر باشد.");
      return false;
    }

    if (icon.trim().length < 2 || icon.trim().length > 120) {
      setError("آیکون باید بین ۲ تا ۱۲۰ کاراکتر باشد.");
      return false;
    }

    if (status !== 0 && status !== 1) {
      setError("وضعیت نامعتبر است.");
      return false;
    }

    return true;
  };

  useTimeout(
    () => {
      if (success) {
        router.push("/admin/category?createSuccess=1");
      }
    },
    success ? 800 : null,
  );
  const handleSubmit = async () => {
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
      description: description.trim(),
      status,
      icon: icon.trim(),
      parent_id: parentId,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/advertise/category`,
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
          throw new Error(result.message || "اطلاعات وارد شده معتبر نیست.");
        }

        throw new Error(result.message || "خطایی در ایجاد دسته‌بندی رخ داد.");
      }

      setSuccess("دسته‌بندی با موفقیت ایجاد شد.");

      setName("");
      setDescription("");
      setStatus(1);
      setIcon("");
      setParentId(null);
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
        <div className="flex items-start gap-3 rounded-xl border border-green-200dark:border-green-200/50 bg-green-50 dark:bg-green-50/20 p-4 text-green-700 dark:text-green-400">
          <i className="fa fa-check-circle mt-0.5 text-lg"></i>

          <div>
            <p className="text-sm font-medium">عملیات موفق</p>

            <p className="mt-1 text-sm">{success}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="space-y-6">
        {/* Basic Info */}
        <div>
          <div className="mb-5">
            <h2 className="text-lg font-bold text-secondary">
              اطلاعات دسته‌بندی
            </h2>

            <p className="mt-1 text-sm text-gray">
              اطلاعات اصلی دسته‌بندی را وارد کنید.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-dark"
              >
                نام دسته‌بندی
              </label>

              <div className="relative">
                <i className="fa fa-tag absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثلاً خودرو"
                  className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 py-3 pr-10 pl-4 text-sm text-primary outline-none transition focus:border-blue-500 dark:focus:border-blue-100/10 focus:bg-surface focus:ring-0"
                />
              </div>

              <p className="mt-2 text-xs text-gray-400">بین ۲ تا ۱۲۰ کاراکتر</p>
            </div>

            {/* Icon */}
            <div>
              <label
                htmlFor="icon"
                className="mb-2 block text-sm font-medium text-gray-dark"
              >
                آیکون
              </label>

              <div className="relative">
                <i className="fa fa-image absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>

                <input
                  id="icon"
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="مثلاً fa fa-car"
                  className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 py-3 pr-10 pl-4 text-sm text-primary outline-none transition focus:border-blue-500 dark:focus:border-blue-100/10 focus:bg-surface focus:ring-0"
                />
              </div>

              <p className="mt-2 text-xs text-gray-400">کلاس Font Awesome</p>
            </div>

            {/* Parent */}
            <div>
              <label
                htmlFor="parent_id"
                className="mb-2 block text-sm font-medium text-gray-dark"
              >
                دسته والد
              </label>

              <select
                id="parent_id"
                value={parentId ?? ""}
                onChange={(e) =>
                  setParentId(e.target.value ? Number(e.target.value) : null)
                }
                className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 px-4 py-3 text-sm text-primary outline-none transition focus:border-blue-500 dark:focus:border-blue-100/10 focus:bg-surface focus:ring-0"
              >
                <option value="">دسته اصلی</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs text-gray-400">
                در صورت انتخاب، این دسته زیرمجموعه آن خواهد بود.
              </p>
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-medium text-gray-dark"
              >
                وضعیت
              </label>

              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(Number(e.target.value))}
                className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 px-4 py-3 text-sm text-primary outline-none transition focus:border-blue-500 dark:focus:border-blue-100/10 focus:bg-surface focus:ring-0"
              >
                <option value={1}>فعال</option>

                <option value={0}>غیرفعال</option>
              </select>
            </div>

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
                placeholder="توضیح مختصری درباره این دسته‌بندی بنویسید..."
                className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 px-4 py-3 text-sm text-primary outline-none transition focus:border-blue-500 dark:focus:border-blue-100/10 focus:bg-surface focus:ring-0 placeholder:text-gray"
              />

              <div className="mt-2 flex justify-between text-xs text-gray-400">
                <span>بین ۲ تا ۵۰۰ کاراکتر</span>

                <span>{description.length}/500</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-2xl bg-gray-lighter p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <i className="fa fa-eye text-gray"></i>

            <h3 className="text-sm font-bold text-gray-dark">پیش‌نمایش</h3>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-color bg-surface p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-hover text-icon">
              <i className={icon || "fa fa-folder"}></i>
            </div>

            <div className="min-w-0">
              <p className="font-semibold text-gray-dark">
                {name || "نام دسته‌بندی"}
              </p>

              <p className="mt-1 truncate text-xs text-gray-400">
                {description || "توضیحات دسته‌بندی"}
              </p>
            </div>

            <span
              className={`mr-auto rounded-full px-3 py-1 text-xs font-medium ${
                status
                  ? "bg-green-100 dark:bg-green-300/5 text-green-700 dark:text-green-300"
                  : "bg-red-100 dark:bg-red-300/5 text-red-700 dark:text-red-300"
              }`}
            >
              {status ? "فعال" : "غیرفعال"}
            </span>
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
                در حال ایجاد...
              </>
            ) : (
              <>
                <i className="fa fa-plus"></i>
                ایجاد دسته‌بندی
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CategoryCreateForm;
