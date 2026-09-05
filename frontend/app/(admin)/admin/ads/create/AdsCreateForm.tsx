"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTimeout } from "@/app/hooks/useTimeout";
import ImageUploader from "@/app/components/ui/common/ImageUploader";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { WithContext as ReactTags, Tag } from "react-tag-input";
import { City } from "@/app/types/city";
import { State } from "@/app/types/state";

interface CategoryOption {
  id: number;
  name: string;
}
interface CategoryAttributeWithValues {
  id: number;
  name: string;
  unit: string;
  values: { id: number; value: string }[];
}
interface UserOption {
  id: number;
  name: string;
}

function AdsCreateForm() {
  // ========== State‌های مربوط به آگهی ==========
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [adsType, setAdsType] = useState("");
  const [adsStatus, setAdsStatus] = useState("as_good_as_new");
  const [price, setPrice] = useState<number | null>(null);
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState(1);
  const [isSpecial, setIsSpecial] = useState<0 | 1>(0);
  const [isLadder, setIsLadder] = useState<0 | 1>(0);
  const [willingToTrade, setWillingToTrade] = useState<0 | 1>(0);
  const [contact, setContact] = useState("");

  const [categoryAttributes, setCategoryAttributes] = useState<
    CategoryAttributeWithValues[]
  >([]);
  const [selectedCategoryValues, setSelectedCategoryValues] = useState<
    Record<number, number | null>
  >({});
  // ========== فیلد تگ‌ها ==========
  const [tags, setTags] = useState<Tag[]>([]);

  // ========== فیلدهای موقعیت جغرافیایی ==========
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  // ========== فیلدهای تاریخ ==========
  const [publishedAt, setPublishedAt] = useState<Date | null>(null);
  const [expiredAt, setExpiredAt] = useState<Date | null>(null);

  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [cityId, setCityId] = useState<number | null>(null);
  const [stateId, setStateId] = useState<number | null>(null);

  const [images, setImages] = useState<File[]>([]);

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [states, setStates] = useState<State[]>([]);

  const [filteredStates, setFilteredStates] = useState<State[]>([]);

  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter();

  // تابع تبدیل درخت محله‌ها به آرایه مسطح (برای نمایش در select)
  const flattenStates = (states: State[], prefix: string = ""): State[] => {
    let result: State[] = [];
    states.forEach((state) => {
      result.push({
        ...state,
        name: prefix + state.name,
      });
      if (state.children && state.children.length > 0) {
        result = result.concat(flattenStates(state.children, prefix + "—— "));
      }
    });
    return result;
  };

  // ========== دریافت CSRF Token ==========
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/sanctum/csrf-cookie`,
          { method: "GET", credentials: "include" },
        );
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("XSRF-TOKEN="))
          ?.split("=")[1];
        if (token) setCsrfToken(decodeURIComponent(token));
      } catch (error) {
        setError("خطا در دریافت CSRF token");
        console.error(error);
      }
    };
    fetchCsrfToken();
  }, []);

  // ========== دریافت لیست‌ها ==========
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, usersRes, citiesRes, statesRes] =
          await Promise.all([
            fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/advertise/category`,
              {
                headers: { Accept: "application/json" },
                credentials: "include",
              },
            ),
            fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/users/user`,
              {
                headers: { Accept: "application/json" },
                credentials: "include",
              },
            ),
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cities`, {
              headers: { Accept: "application/json" },
              credentials: "include",
            }),
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/states`, {
              headers: { Accept: "application/json" },
              credentials: "include",
            }),
          ]);

        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.data || []);
        }
        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(data.data || []);
        }
        if (citiesRes.ok) {
          const data = await citiesRes.json();
          setCities(data.data || []);
        }
        if (statesRes.ok) {
          const data = await statesRes.json();
          setStates(data.data || []);
        }
      } catch (error) {
        console.error("خطا در دریافت داده‌ها:", error);
      }
    };
    fetchData();
  }, []);

  // ========== فیلتر کردن محله‌ها بر اساس شهر انتخاب‌شده ==========
  useEffect(() => {
    if (!cityId) {
      setFilteredStates([]);
      return;
    }

    // دریافت محله‌های مربوط به شهر انتخاب‌شده از لیست کامل states
    const allStates = states; // states شامل تمام محله‌های همه شهرهاست
    const filtered = allStates.filter((state) => state.city_id === cityId);
    setFilteredStates(filtered);
  }, [cityId, states]);

  // ========== مدیریت تغییر شهر ==========
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCityId = e.target.value ? Number(e.target.value) : null;
    setCityId(newCityId);
    setStateId(null); // ریست محله قبلی
  };

  // ========== مدیریت تغییر محله ==========
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStateId = e.target.value ? Number(e.target.value) : null;
    setStateId(newStateId);

    // اگر محله‌ای انتخاب شده و city_id آن با cityId فعلی متفاوت است، شهر را به‌روز کن
    if (newStateId) {
      const selectedState = states.find((s) => s.id === newStateId);
      if (selectedState && selectedState.city_id !== cityId) {
        setCityId(selectedState.city_id);
      }
    }
  };

  // ========== ۲-۲. دریافت ویژگی‌ها هنگام تغییر دسته‌بندی ==========
  useEffect(() => {
    if (!categoryId) {
      setCategoryAttributes([]);
      setSelectedCategoryValues({});
      return;
    }

    const fetchAttributes = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/advertise/category-attributes/by-category/${categoryId}`,
          {
            headers: { Accept: "application/json" },
            credentials: "include",
          },
        );
        if (!res.ok) throw new Error("خطا در دریافت ویژگی‌ها");
        const data = await res.json();
        setCategoryAttributes(data);
        setSelectedCategoryValues({});
      } catch (error) {
        console.error("Error fetching category attributes:", error);
      }
    };

    fetchAttributes();
  }, [categoryId]);
  // ========== اعتبارسنجی ==========
  const validateForm = () => {
    if (title.trim().length < 3 || title.trim().length > 255) {
      setError("عنوان باید بین ۳ تا ۲۵۵ کاراکتر باشد.");
      return false;
    }
    if (description.trim().length < 10) {
      setError("توضیحات باید حداقل ۱۰ کاراکتر باشد.");
      return false;
    }
    if (!categoryId) {
      setError("لطفاً یک دسته‌بندی انتخاب کنید.");
      return false;
    }
    if (!userId) {
      setError("لطفاً یک کاربر انتخاب کنید.");
      return false;
    }
    if (!cityId) {
      setError("لطفاً یک شهر انتخاب کنید.");
      return false;
    }
    if (!stateId) {
      setError("لطفاً یک محل انتخاب کنید.");
      return false;
    }

    if (publishedAt && expiredAt && publishedAt > expiredAt) {
      setError("تاریخ انتشار نمی‌تواند بعد از تاریخ انقضا باشد.");
      return false;
    }

    return true;
  };

  // ========== ریدایرکت ==========
  useTimeout(
    () => {
      if (success) router.push("/admin/ads?createSuccess=1");
    },
    success ? 800 : null,
  );

  // ========== ارسال فرم ==========
  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!csrfToken) {
      setError("CSRF token موجود نیست.");
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("ads_type", adsType.trim() || "عمومی");
    formData.append("ads_status", adsStatus);
    formData.append("slug", slug.trim() || "");
    formData.append("status", String(status));
    formData.append("is_special", String(isSpecial));
    formData.append("is_ladder", String(isLadder));
    formData.append("willing_to_trade", String(willingToTrade));
    formData.append("contact", contact.trim());

    // ========== تبدیل تگ‌ها به رشته با کاما ==========
    formData.append("tags", tags.map((t) => t.text).join(", "));

    // ========== موقعیت جغرافیایی ==========
    if (lat.trim()) formData.append("lat", lat.trim());
    if (lng.trim()) formData.append("lng", lng.trim());

    formData.append("category_id", String(categoryId));
    formData.append("user_id", String(userId));
    formData.append("city_id", String(cityId));
    formData.append("state_id", String(stateId));

    if (price !== null) formData.append("price", String(price));
    formData.append("_method", "POST");

    if (publishedAt) {
      formData.append("published_at", publishedAt.toISOString());
    }
    if (expiredAt) {
      formData.append("expired_at", expiredAt.toISOString());
    }

    images.forEach((file) => {
      formData.append("images[]", file);
    });

    // ========== ارسال ویژگی‌ها ==========
    // ========== ارسال ویژگی‌ها به‌صورت آرایه ==========
    const categoryValueIds = Object.values(selectedCategoryValues).filter(
      (id) => id !== null,
    );

    // هر آیتم را به‌عنوان یک فیلد جداگانه با کلید یکسان اضافه کن
    categoryValueIds.forEach((id) => {
      formData.append("category_value_ids[]", String(id));
    });
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/advertise/advertisement`,
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
        if (res.status === 422) {
          const errors = result.errors as Record<string, string[]> | undefined;
          const firstError = errors ? Object.values(errors)[0]?.[0] : null;
          throw new Error(
            firstError || result.message || "اطلاعات وارد شده معتبر نیست.",
          );
        }
        throw new Error(result.message || "خطا در ایجاد آگهی");
      }

      setSuccess("آگهی با موفقیت ایجاد شد.");
      // ریست فرم
      setTitle("");
      setDescription("");
      setAdsType("");
      setAdsStatus("as_good_as_new");
      setPrice(null);
      setSlug("");
      setStatus(1);
      setIsSpecial(0);
      setIsLadder(0);
      setWillingToTrade(0);
      setContact("");
      setTags([]);
      setLat("");
      setLng("");
      setPublishedAt(null);
      setExpiredAt(null);
      setCategoryId(null);
      setUserId(null);
      setCityId(null);
      setImages([]);
    } catch (error) {
      setError(error instanceof Error ? error.message : "خطا در ارسال اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  // ========== توابع مدیریت تگ ==========
  const handleAddTag = (tag: Tag) => {
    setTags([...tags, tag]);
  };

  const handleDeleteTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // ========== رندر ==========
  return (
    <div className="space-y-6">
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
        <div className="mb-5">
          <h2 className="text-lg font-bold text-secondary">اطلاعات آگهی</h2>
          <p className="mt-1 text-sm text-gray">
            اطلاعات اصلی آگهی را وارد کنید.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* عنوان */}
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-gray-dark"
            >
              عنوان
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان آگهی"
              className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 py-3 px-4 text-sm text-primary outline-none transition focus:border-blue-500 focus:bg-surface"
            />
          </div>

          {/* اسلاگ */}
          <div>
            <label
              htmlFor="slug"
              className="mb-2 block text-sm font-medium text-gray-dark"
            >
              اسلاگ (اختیاری)
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="اسلاگ (مثلاً my-ad)"
              className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 py-3 px-4 text-sm text-primary outline-none transition focus:border-blue-500 focus:bg-surface"
            />
            <p className="mt-1 text-xs text-gray-400">
              اگر خالی بماند، به‌طور خودکار تنظیم می‌شود.
            </p>
          </div>

          {/* نوع آگهی */}
          <div>
            <label
              htmlFor="ads_type"
              className="mb-2 block text-sm font-medium text-gray-dark"
            >
              نوع آگهی
            </label>
            <input
              id="ads_type"
              type="text"
              value={adsType}
              onChange={(e) => setAdsType(e.target.value)}
              placeholder="نوع (مثلاً خودرو، بازی)"
              className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 py-3 px-4 text-sm text-primary outline-none transition focus:border-blue-500 focus:bg-surface"
            />
          </div>

          {/* وضعیت ظاهری */}
          <div>
            <label
              htmlFor="ads_status"
              className="mb-2 block text-sm font-medium text-gray-dark"
            >
              وضعیت ظاهری
            </label>
            <select
              id="ads_status"
              value={adsStatus}
              onChange={(e) => setAdsStatus(e.target.value)}
              className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 px-4 py-3 text-sm text-primary outline-none transition focus:border-blue-500 focus:bg-surface"
            >
              <option value="new">نو</option>
              <option value="as_good_as_new">در حد نو</option>
              <option value="good">خوب</option>
              <option value="acceptable">قابل قبول</option>
            </select>
          </div>

          {/* قیمت */}
          <div>
            <label
              htmlFor="price"
              className="mb-2 block text-sm font-medium text-gray-dark"
            >
              قیمت (اختیاری)
            </label>
            <input
              id="price"
              type="number"
              value={price ?? ""}
              onChange={(e) =>
                setPrice(e.target.value ? Number(e.target.value) : null)
              }
              placeholder="قیمت به تومان"
              className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 py-3 px-4 text-sm text-primary outline-none transition focus:border-blue-500 focus:bg-surface"
            />
          </div>

          {/* تماس */}
          <div>
            <label
              htmlFor="contact"
              className="mb-2 block text-sm font-medium text-gray-dark"
            >
              شماره تماس (اختیاری)
            </label>
            <input
              id="contact"
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="شماره تماس"
              className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 py-3 px-4 text-sm text-primary outline-none transition focus:border-blue-500 focus:bg-surface"
            />
          </div>

          {/* ========== فیلد تگ‌ها ========== */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-dark">
              برچسب‌ها (اختیاری)
            </label>
            <div className="rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 p-2 transition focus-within:border-blue-500">
              <ReactTags
                tags={tags}
                handleAddition={handleAddTag}
                handleDelete={handleDeleteTag}
                placeholder="یک برچسب وارد کنید و Enter بزنید..."
                classNames={{
                  tags: "ReactTags__remove flex flex-wrap gap-1",
                  tag: "inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full px-3 py-1 text-sm",
                  remove:
                    "cursor-pointer hover:text-red-500 text-blue-500 dark:text-blue-400 ml-1 font-bold",

                  tagInputField:
                    "w-full bg-transparent outline-none text-sm text-primary p-1",
                }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">
              هر برچسب را با Enter اضافه کنید و با کلیک روی × حذف کنید.
            </p>
          </div>

          {/* ========== موقعیت جغرافیایی ========== */}
          <div>
            <label
              htmlFor="lat"
              className="mb-2 block text-sm font-medium text-gray-dark"
            >
              عرض جغرافیایی (اختیاری)
            </label>
            <input
              id="lat"
              type="text"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="مثلاً 35.6892"
              className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 py-3 px-4 text-sm text-primary outline-none transition focus:border-blue-500 focus:bg-surface"
            />
          </div>

          <div>
            <label
              htmlFor="lng"
              className="mb-2 block text-sm font-medium text-gray-dark"
            >
              طول جغرافیایی (اختیاری)
            </label>
            <input
              id="lng"
              type="text"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="مثلاً 51.3890"
              className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 py-3 px-4 text-sm text-primary outline-none transition focus:border-blue-500 focus:bg-surface"
            />
          </div>

          {/* دسته‌بندی */}
          <div>
            <label
              htmlFor="category_id"
              className="mb-2 block text-sm font-medium text-gray-dark"
            >
              دسته‌بندی
            </label>
            <select
              id="category_id"
              value={categoryId ?? ""}
              onChange={(e) =>
                setCategoryId(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 px-4 py-3 text-sm text-primary outline-none transition focus:border-blue-500 focus:bg-surface"
            >
              <option value="">انتخاب دسته‌بندی</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* ========== ویژگی‌های دسته‌بندی ========== */}
          {categoryAttributes.length > 0 && (
            <div className="md:col-span-2">
              <div className="border border-color py-4 px-2 rounded-xl mt-4">
                <h3 className="text-md font-semibold text-secondary mb-4">
                  ویژگی‌های دسته‌بندی
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryAttributes.map((attr) => (
                    <div key={attr.id}>
                      <label className="mb-1 block text-sm font-medium text-gray-dark">
                        {attr.name} {attr.unit && `(${attr.unit})`}
                      </label>
                      <select
                        value={selectedCategoryValues[attr.id] ?? ""}
                        onChange={(e) =>
                          setSelectedCategoryValues((prev) => ({
                            ...prev,
                            [attr.id]: e.target.value
                              ? Number(e.target.value)
                              : null,
                          }))
                        }
                        className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 px-4 py-2.5 text-sm text-primary outline-none transition focus:border-blue-500"
                      >
                        <option value="">انتخاب کنید</option>
                        {attr.values.map((val) => (
                          <option key={val.id} value={val.id}>
                            {val.value}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* کاربر */}
          <div>
            <label
              htmlFor="user_id"
              className="mb-2 block text-sm font-medium text-gray-dark"
            >
              کاربر
            </label>
            <select
              id="user_id"
              value={userId ?? ""}
              onChange={(e) =>
                setUserId(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 px-4 py-3 text-sm text-primary outline-none transition focus:border-blue-500 focus:bg-surface"
            >
              <option value="">انتخاب کاربر</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          {/* شهر (اجباری) */}
          <div>
            <label
              htmlFor="city_id"
              className="mb-2 block text-sm font-medium text-gray-dark"
            >
              شهر <span className="text-red-500">*</span>
            </label>
            <select
              id="city_id"
              value={cityId ?? ""}
              onChange={handleCityChange}
              className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 px-4 py-3 text-sm text-primary outline-none transition focus:border-blue-500 focus:bg-surface"
            >
              <option value="">انتخاب شهر</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* محل */}
          <div>
            <label
              htmlFor="state_id"
              className="mb-2 block text-sm font-medium text-gray-dark"
            >
              محل <span className="text-red-500">*</span>
            </label>
            <select
              id="state_id"
              value={stateId ?? ""}
              onChange={handleStateChange}
              className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 px-4 py-3 text-sm text-primary outline-none transition focus:border-blue-500 focus:bg-surface"
            >
              <option value="">انتخاب محل</option>
              {flattenStates(filteredStates).map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
            {cityId && filteredStates.length === 0 && (
              <p className="mt-1 text-xs text-amber-500">
                هیچ محله‌ای برای این شهر یافت نشد.
              </p>
            )}
          </div>

          {/* وضعیت کلی */}
          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-medium text-gray-dark"
            >
              وضعیت کلی
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(Number(e.target.value))}
              className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 px-4 py-3 text-sm text-primary outline-none transition focus:border-blue-500 focus:bg-surface"
            >
              <option value={1}>فعال</option>
              <option value={2}>در انتظار</option>
              <option value={3}>در انتظار تایید</option>
              <option value={4}>منقضی</option>
            </select>
          </div>

          {/* تاریخ‌ها */}
          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-dark"
              htmlFor="published_at"
            >
              تاریخ انتشار (اختیاری)
            </label>
            <DatePicker
              id="published_at"
              calendar={persian}
              locale={persian_fa}
              value={publishedAt}
              onChange={(date) => {
                if (date) {
                  setPublishedAt(
                    date.toDate ? date.toDate() : new Date(date.valueOf()),
                  );
                } else {
                  setPublishedAt(null);
                }
              }}
              placeholder="انتخاب تاریخ انتشار"
              inputClass="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 px-4 py-2.5 text-sm text-primary outline-none transition focus:border-blue-500 focus:bg-surface"
              containerClassName="w-full"
            />
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-gray-dark"
              htmlFor="expired_at"
            >
              تاریخ انقضا (اختیاری)
            </label>
            <DatePicker
              id="expired_at"
              calendar={persian}
              locale={persian_fa}
              value={expiredAt}
              onChange={(date) => {
                if (date) {
                  setExpiredAt(
                    date.toDate ? date.toDate() : new Date(date.valueOf()),
                  );
                } else {
                  setExpiredAt(null);
                }
              }}
              placeholder="انتخاب تاریخ انقضا"
              inputClass="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 px-4 py-2.5 text-sm text-primary outline-none transition focus:border-blue-500 focus:bg-surface"
              containerClassName="w-full"
            />
            <p className="mt-1 text-xs text-gray-400">
              اگر خالی بماند، به‌طور خودکار تنظیم می‌شود.
            </p>
          </div>

          {/* چک‌باکس‌ها */}
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm text-gray-dark">
              <input
                type="checkbox"
                checked={isSpecial === 1}
                onChange={(e) => setIsSpecial(e.target.checked ? 1 : 0)}
                className="h-4 w-4 rounded border-color"
              />
              ویژه
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-dark">
              <input
                type="checkbox"
                checked={isLadder === 1}
                onChange={(e) => setIsLadder(e.target.checked ? 1 : 0)}
                className="h-4 w-4 rounded border-color"
              />
              نردبانی
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-dark">
              <input
                type="checkbox"
                checked={willingToTrade === 1}
                onChange={(e) => setWillingToTrade(e.target.checked ? 1 : 0)}
                className="h-4 w-4 rounded border-color"
              />
              قابلیت معاوضه
            </label>
          </div>

          {/* توضیحات */}
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
              placeholder="توضیحات کامل آگهی..."
              className="w-full rounded-xl border border-color bg-gray-50 dark:bg-gray-50/5 px-4 py-3 text-sm text-primary outline-none transition focus:border-blue-500 focus:bg-surface"
            />
            <p className="mt-2 text-xs text-gray-400">
              {description.length}/۱۰۰۰
            </p>
          </div>

          {/* تصویر */}
          <div className="md:col-span-2">
            <ImageUploader
              label="تصاویر آگهی"
              value={images[0] || null}
              preview=""
              onChange={(file) => setImages(file ? [file] : [])}
              accept={[
                "image/jpeg",
                "image/png",
                "image/jpg",
                "image/gif",
                "image/webp",
              ]}
              maxSize={5}
            />
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
                <i className="fa fa-plus"></i> ایجاد آگهی
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdsCreateForm;
