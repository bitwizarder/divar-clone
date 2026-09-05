"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTimeout } from "@/app/hooks/useTimeout";
import { CategoryValue } from "@/app/types/categoryValue";

interface CategoryAttributeOption {
  id: number;
  name: string;
  unit: string;
}

function CategoryValueCreateForm() {
  // ========== State‌های مربوط به مقدار ==========
  const [value, setValue] = useState(""); // مقدار اصلی
  const [type, setType] = useState<0 | 1>(0); // 0 = عادی, 1 = ویژه
  const [status, setStatus] = useState(1);
  const [attributeId, setAttributeId] = useState<number | null>(null); // شناسه ویژگی دسته‌بندی
  const [attributes, setAttributes] = useState<CategoryAttributeOption[]>([]);

  // ========== State‌های CSRF و وضعیت ==========
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter();

  // ========== دریافت CSRF Token ==========
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/sanctum/csrf-cookie`,
          {
            method: "GET",
            credentials: "include",
          }
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

  // ========== دریافت لیست ویژگی‌های دسته‌بندی ==========
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/advertise/category-attribute`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error("خطا در دریافت ویژگی‌های دسته‌بندی");
        }

        const result = await res.json();
        setAttributes(result.data || []);
      } catch (error) {
        console.error("خطا در دریافت ویژگی‌های دسته‌بندی:", error);
      }
    };

    fetchAttributes();
  }, []);

  // ========== اعتبارسنجی سمت کلاینت ==========
  const validateForm = () => {
    // مقدار (value)
    if (value.trim().length < 1 || value.trim().length > 255) {
      setError("مقدار باید بین ۱ تا ۲۵۵ کاراکتر باشد.");
      return false;
    }

    // انتخاب ویژگی (اجباری)
    if (!attributeId) {
      setError("لطفاً یک ویژگی دسته‌بندی را انتخاب کنید.");
      return false;
    }

    // نوع (۰ یا ۱)
    if (type !== 0 && type !== 1) {
      setError("نوع مقدار نامعتبر است.");
      return false;
    }

    // وضعیت (۰ یا ۱)
    if (status !== 0 && status !== 1) {
      setError("وضعیت نامعتبر است.");
      return false;
    }

    return true;
  };

  // ========== ریدایرکت پس از موفقیت ==========
  useTimeout(
    () => {
      if (success) {
        router.push("/admin/category-value?createSuccess=1");
      }
    },
    success ? 800 : null
  );

  // ========== ارسال فرم ==========
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
      value: value.trim(),
      category_attribute_id: attributeId,
      type: type,
      status: status,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/advertise/category-value`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-XSRF-TOKEN": csrfToken,
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
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
          const errors = result.errors as Record<string, string[]> | undefined;
          const firstErrorMessage = errors
            ? Object.values(errors)[0]?.[0]
            : null;
          throw new Error(
            firstErrorMessage ||
              result.message ||
              "اطلاعات وارد شده معتبر نیست."
          );
        }

        throw new Error(
          result.message || "خطایی در ایجاد مقدار ویژگی دسته‌بندی رخ داد."
        );
      }

      setSuccess("مقدار ویژگی دسته‌بندی با موفقیت ایجاد شد.");

      // ریست کردن فرم
      setValue("");
      setType(0);
      setStatus(1);
      setAttributeId(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "خطا در ارسال اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  // ========== رندر ==========
  return (
    <div className="space-y-6">
      {/* پیام‌های خطا و موفقیت */}
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

      {/* فرم */}
      <div className="space-y-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-secondary">
            اطلاعات مقدار ویژگی
          </h2>
          <p className="mt-1 text-sm text-gray">
            اطلاعات اصلی مقدار ویژگی را وارد کنید.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* مقدار */}
          <div>
            <label
              htmlFor="value"
              className="mb-2 block text-sm font-medium text-gray-dark"
            >
              مقدار
            </label>
            <div className="relative">
              <i className="fa fa-tag absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                id="value"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="مثلاً 41000 یا قرمز"
                className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 py-3 pr-10 pl-4 text-sm text-primary outline-none transition focus:border-blue-500 dark:focus:border-blue-100/10 focus:bg-surface focus:ring-0"
              />
            </div>
            <p className="mt-2 text-xs text-gray-400">بین ۱ تا ۲۵۵ کاراکتر</p>
          </div>

          {/* انتخاب ویژگی دسته‌بندی */}
          <div>
            <label
              htmlFor="attribute_id"
              className="mb-2 block text-sm font-medium text-gray-dark"
            >
              ویژگی دسته‌بندی
            </label>
            <select
              id="attribute_id"
              value={attributeId ?? ""}
              onChange={(e) =>
                setAttributeId(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 px-4 py-3 text-sm text-primary outline-none transition focus:border-blue-500 dark:focus:border-blue-100/10 focus:bg-surface focus:ring-0"
            >
              <option value="">انتخاب ویژگی</option>
              {attributes.map((attr) => (
                <option key={attr.id} value={attr.id}>
                  {attr.name} ({attr.unit || "بدون واحد"})
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-400">
              ویژگی‌ای که مقدار به آن تعلق دارد.
            </p>
          </div>

          {/* نوع */}
          <div>
            <label
              htmlFor="type"
              className="mb-2 block text-sm font-medium text-gray-dark"
            >
              نوع مقدار
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(Number(e.target.value) as 0 | 1)}
              className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 px-4 py-3 text-sm text-primary outline-none transition focus:border-blue-500 dark:focus:border-blue-100/10 focus:bg-surface focus:ring-0"
            >
              <option value={0}>عادی</option>
              <option value={1}>ویژه</option>
            </select>
            <p className="mt-2 text-xs text-gray-400">ویژه برای مقادیر مهم</p>
          </div>

          {/* وضعیت */}
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
        </div>

        {/* دکمه ارسال */}
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
                ایجاد مقدار ویژگی
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CategoryValueCreateForm;