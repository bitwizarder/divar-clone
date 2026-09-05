"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { State } from "@/app/types/state";
import { useTimeout } from "@/app/hooks/useTimeout";
import { City } from "@/app/types/city";

function StateCreateForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(1);
  const [icon, setIcon] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  const [cityId, setCityId] = useState<number | null>(null);
  const [selectedParentCityId, setSelectedParentCityId] = useState<number | null>(null);

  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  const router = useRouter();

  // دریافت CSRF
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

  // دریافت لیست شهرها
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cities`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("خطا در دریافت شهرها");
        const result = await res.json();
        setCities(result.data || []);
      } catch (error) {
        console.error("خطا در دریافت شهرها:", error);
      }
    };
    fetchCities();
  }, []);

  // دریافت لیست مناطق (برای والد)
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/advertise/state`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("خطا در دریافت منطقه‌ها");
        const result = await res.json();
        setStates(result.data || []);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "خطا در دریافت منطقه‌ها";
        setError(message);
      }
    };
    fetchStates();
  }, []);

  // ========== منطق همگام‌سازی والد و شهر ==========
  useEffect(() => {
    if (parentId) {
      // پیدا کردن والد انتخاب‌شده
      const parent = states.find((s) => s.id === parentId);
      if (parent) {
        // اگر والد دارای city_id باشد، آن را برای فرزند تنظیم کن
        if (parent.city.id) {
          setCityId(parent.city.id);
          setSelectedParentCityId(parent.city.id);
        } else {
          // اگر والد city_id نداشت، شهر را خالی بگذار و به کاربر اجازه انتخاب بده
          setCityId(null);
          setSelectedParentCityId(null);
        }
      }
    } else {
      // اگر والد انتخاب نشده، شهر را خالی کن و اجازه انتخاب به کاربر بده
      setCityId(null);
      setSelectedParentCityId(null);
    }
  }, [parentId, states]);

  // ========== اعتبارسنجی ==========
  const validateForm = () => {
    if (name.trim().length < 2 || name.trim().length > 120) {
      setError("نام باید بین ۲ تا ۱۲۰ کاراکتر باشد.");
      return false;
    }
    if (description.trim().length < 2 || description.trim().length > 500) {
      setError("توضیحات باید بین ۲ تا ۵۰۰ کاراکتر باشد.");
      return false;
    }
    // اگر والد انتخاب شده، شهر باید از والد گرفته شود (و باید وجود داشته باشد)
    if (parentId && !cityId) {
      setError("والد انتخاب‌شده فاقد شهر است. لطفاً شهر را به‌صورت دستی انتخاب کنید یا والد دیگری انتخاب کنید.");
      return false;
    }
    // اگر والد انتخاب نشده، شهر الزامی است
    if (!parentId && !cityId) {
      setError("انتخاب شهر الزامی است.");
      return false;
    }
    if (status !== 0 && status !== 1) {
      setError("وضعیت نامعتبر است.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!csrfToken) {
      setError("CSRF token موجود نیست.");
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    const formData = {
      name: name.trim(),
      description: description.trim(),
      status,
      icon: icon.trim(),
      parent_id: parentId,
      city_id: cityId,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/advertise/state`,
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
          throw new Error(result.message || "اطلاعات وارد شده معتبر نیست.");
        }
        throw new Error(result.message || "خطایی در ایجاد منطقه رخ داد.");
      }

      setSuccess("منطقه با موفقیت ایجاد شد.");

      // ریست فرم
      setName("");
      setDescription("");
      setStatus(1);
      setIcon("");
      setCityId(null);
      setParentId(null);
      setSelectedParentCityId(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "خطا در ارسال اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  useTimeout(
    () => {
      if (success) {
        router.push("/admin/state?createSuccess=1");
      }
    },
    success ? 800 : null
  );

  // پیدا کردن نام شهر برای نمایش
  const selectedCityName = cities.find((c) => c.id === cityId)?.name || "";

  return (
    <div className="space-y-6">
      {/* خطاها و موفقیت */}
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

      <div className="space-y-6">
        <div>
          <div className="mb-5">
            <h2 className="text-lg font-bold text-secondary">اطلاعات منطقه</h2>
            <p className="mt-1 text-sm text-gray">اطلاعات اصلی منطقه را وارد کنید.</p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* نام */}
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-dark">
                نام منطقه
              </label>
              <div className="relative">
                <i className="fa fa-tag absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثلاً خودرو"
                  className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 py-3 pr-10 pl-4 text-sm text-primary outline-none transition focus:border-blue-500 focus:bg-surface"
                />
              </div>
              <p className="mt-2 text-xs text-gray-400">بین ۲ تا ۱۲۰ کاراکتر</p>
            </div>

            {/* آیکون */}
            <div>
              <label htmlFor="icon" className="mb-2 block text-sm font-medium text-gray-dark">
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
                  className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 py-3 pr-10 pl-4 text-sm text-primary outline-none transition focus:border-blue-500 focus:bg-surface"
                />
              </div>
              <p className="mt-2 text-xs text-gray-400">کلاس Font Awesome</p>
            </div>

            {/* والد */}
            <div>
              <label htmlFor="parent_id" className="mb-2 block text-sm font-medium text-gray-dark">
                منطقه والد
              </label>
              <select
                id="parent_id"
                value={parentId ?? ""}
                onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
                className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 px-4 py-3 text-sm text-primary outline-none transition focus:border-blue-500 focus:bg-surface"
              >
                <option value="">منطقه اصلی</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gray-400">
                در صورت انتخاب، این منطقه زیرمجموعه آن خواهد بود.
              </p>
            </div>

            {/* شهر */}
            <div>
              <label htmlFor="city_id" className="mb-2 block text-sm font-medium text-gray-dark">
                شهر {parentId ? "(از والد گرفته شده)" : "(الزامی)"}
              </label>
              <select
                id="city_id"
                value={cityId ?? ""}
                onChange={(e) => setCityId(e.target.value ? Number(e.target.value) : null)}
                disabled={!!parentId && !!selectedParentCityId}
                className={`w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 px-4 py-3 text-sm text-primary outline-none transition focus:border-blue-500 focus:bg-surface ${
                  !!parentId && !!selectedParentCityId ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                <option value="">انتخاب شهر</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
              {parentId && selectedParentCityId && (
                <p className="mt-1 text-xs text-blue-600">
                  شهر از والد ({states.find((s) => s.id === parentId)?.name}) گرفته شده است.
                </p>
              )}
              {parentId && !selectedParentCityId && (
                <p className="mt-1 text-xs text-orange-500">
                  والد انتخاب‌شده فاقد شهر است. لطفاً شهر را به‌صورت دستی انتخاب کنید.
                </p>
              )}
            </div>

            {/* وضعیت */}
            <div>
              <label htmlFor="status" className="mb-2 block text-sm font-medium text-gray-dark">
                وضعیت
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(Number(e.target.value))}
                className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 px-4 py-3 text-sm text-primary outline-none transition focus:border-blue-500 focus:bg-surface"
              >
                <option value={1}>فعال</option>
                <option value={0}>غیرفعال</option>
              </select>
            </div>

            {/* توضیحات */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-dark">
                توضیحات
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="توضیح مختصری درباره این منطقه بنویسید..."
                className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 px-4 py-3 text-sm text-primary outline-none transition focus:border-blue-500 focus:bg-surface placeholder:text-gray"
              />
              <div className="mt-2 flex justify-between text-xs text-gray-400">
                <span>بین ۲ تا ۵۰۰ کاراکتر</span>
                <span>{description.length}/500</span>
              </div>
            </div>
          </div>
        </div>

        {/* پیش‌نمایش */}
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
              <p className="font-semibold text-gray-dark">{name || "نام منطقه"}</p>
              <p className="mt-1 truncate text-xs text-gray-400">
                {description || "توضیحات منطقه"} {cityId && `• ${selectedCityName}`}
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

        {/* دکمه ارسال */}
        <div className="flex flex-col-reverse gap-3 border-t border-color pt-6 sm:flex-row sm:justify-start">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !csrfToken}
            className="flex items-center justify-center gap-2 rounded-xl bg-accent px-7 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {loading ? (
              <>
                <i className="fa fa-spinner fa-spin"></i> در حال ایجاد...
              </>
            ) : (
              <>
                <i className="fa fa-plus"></i> ایجاد منطقه
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StateCreateForm; 