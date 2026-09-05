"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import ImageUploader from "@/app/components/ui/common/ImageUploader";
import { WithContext as ReactTags, Tag } from "react-tag-input";
import Image from "next/image";
import { getImageUrl } from "@/app/helpers/image";
import { Ads } from "@/app/types/ads";
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
interface CityOption {
  id: number;
  name: string;
}


interface UserAdsEditFormProps {
  advertisementId: number;
}

function UserAdsEditForm({ advertisementId }: UserAdsEditFormProps) {
  const router = useRouter();
  const { user } = useAuth();

  // ========== State‌ها ==========
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  // ========== داده‌های آگهی ==========
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [adsType, setAdsType] = useState("");
  const [adsStatus, setAdsStatus] = useState("as_good_as_new");
  const [price, setPrice] = useState<number | null>(null);
  const [slug, setSlug] = useState("");
  const [contact, setContact] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [cityId, setCityId] = useState<number | null>(null);
  const [stateId, setStateId] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  // ========== ویژگی‌ها ==========
  const [categoryAttributes, setCategoryAttributes] = useState<
    CategoryAttributeWithValues[]
  >([]);
  const [selectedCategoryValues, setSelectedCategoryValues] = useState<
    Record<number, number | null>
  >({});

  // ========== لیست‌ها و فیلتر محله‌ها ==========
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [filteredStates, setFilteredStates] = useState<State[]>([]);

  // ========== نگاشت وضعیت ظاهری (معکوس) ==========
  const statusToKeyMap: Record<string, string> = {
    "1": "new",
    "2": "as_good_as_new",
    "3": "good",
    "4": "acceptable",
    new: "new",
    as_good_as_new: "as_good_as_new",
    good: "good",
    acceptable: "acceptable",
  };

  // ========== دریافت CSRF ==========
  useEffect(() => {
    const fetchCsrf = async () => {
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
        console.error("Error fetching CSRF:", error);
      }
    };
    fetchCsrf();
  }, []);

  // ========== دریافت لیست‌ها ==========
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, citiesRes, statesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/all-categories`, {
            headers: { Accept: "application/json" },
            credentials: "include",
          }),
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
        if (citiesRes.ok) {
          const data = await citiesRes.json();
          setCities(data.data || []);
        }
        if (statesRes.ok) {
          const data = await statesRes.json();
          setStates(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // ========== دریافت اطلاعات آگهی ==========
  useEffect(() => {
    const fetchAdvertisement = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/panel/advertise/advertisement/${advertisementId}`,
          { credentials: "include" },
        );
        if (!res.ok) throw new Error("خطا در دریافت اطلاعات آگهی");
        const result = await res.json();
        const data = result.data as Ads;

        // پر کردن فرم
        setTitle(data.title || "");
        setDescription(data.description || "");
        setAdsType(data.ads_type || "");
        const statusKey = statusToKeyMap[data.ads_status] || "as_good_as_new";
        setAdsStatus(statusKey);
        setPrice(data.price ?? null);
        setSlug(data.slug || "");
        setContact(data.contact || "");
        setCategoryId(data.category?.id ?? null);
        setCityId(data.city?.id ?? null);
        setStateId(data.state?.id ?? null);
        setLat(data.lat || "");
        setLng(data.lng || "");

        if (data.image?.indexArray?.medium) {
          setCurrentImage(getImageUrl(data.image.indexArray.medium));
        }

        if (data.tags) {
          const tagList = data.tags.split(",").map((t: string) => ({
            id: t.trim(),
            text: t.trim(),
            className: "",
          }));
          setTags(tagList);
        }

        // مقادیر اولیه ویژگی‌ها
        const initialVals: Record<number, number> = {};
        if (data.category_attributes_with_values) {
          data.category_attributes_with_values.forEach((attr: any) => {
            if (
              attr.value !== null &&
              attr.value !== undefined &&
              attr.value !== ""
            ) {
              const matchedValue = data.category_values?.find(
                (cv: any) => cv.value === attr.value,
              );
              if (matchedValue) {
                initialVals[attr.id] = matchedValue.id;
              }
            }
          });
        }
        setSelectedCategoryValues(initialVals);
      } catch (err) {
        setError(err instanceof Error ? err.message : "خطا");
      } finally {
        setLoading(false);
      }
    };
    fetchAdvertisement();
  }, [advertisementId]);

  // ========== دریافت ویژگی‌های دسته‌بندی ==========
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
        // مقادیر انتخابی از قبل تنظیم شده‌اند
      } catch (error) {
        console.error("Error fetching category attributes:", error);
      }
    };
    fetchAttributes();
  }, [categoryId]);

  // ========== فیلتر کردن محله‌ها بر اساس شهر ==========
  useEffect(() => {
    if (!cityId) {
      setFilteredStates([]);
      return;
    }
    const filtered = states.filter((state) => state.city_id === cityId);
    setFilteredStates(filtered);
  }, [cityId, states]);

  // ========== مدیریت تغییر شهر و محله ==========
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCityId = e.target.value ? Number(e.target.value) : null;
    setCityId(newCityId);
    setStateId(null); // ریست محله
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStateId = e.target.value ? Number(e.target.value) : null;
    setStateId(newStateId);
    if (newStateId) {
      const selectedState = states.find((s) => s.id === newStateId);
      if (selectedState && selectedState.city_id !== cityId) {
        setCityId(selectedState.city_id);
      }
    }
  };

  // ========== تابع تبدیل درخت محله‌ها به آرایه مسطح ==========
  const flattenStates = (
    states: State[],
    prefix: string = "",
  ): State[] => {
    let result: State[] = [];
    states.forEach((state) => {
      const newState = { ...state, name: prefix + state.name };
      result.push(newState);
      if (state.children && state.children.length > 0) {
        result = result.concat(flattenStates(state.children, prefix + "—— "));
      }
    });
    return result;
  };

  // ========== اعتبارسنجی ==========
  const validateForm = () => {
    if (title.trim().length < 3) {
      setError("عنوان باید حداقل ۳ کاراکتر باشد.");
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
    if (!cityId) {
      setError("لطفاً یک شهر انتخاب کنید.");
      return false;
    }
    if (!stateId) {
      setError("لطفاً یک محل انتخاب کنید.");
      return false;
    }
    return true;
  };

  // ========== ارسال فرم ==========
  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!csrfToken) {
      setError("CSRF token موجود نیست.");
      return;
    }

    if (!validateForm()) return;

    setSubmitting(true);

    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("ads_type", adsType.trim() || "عمومی");
    formData.append("ads_status", adsStatus);
    formData.append("slug", slug.trim() || "");
    formData.append("contact", contact.trim() || user?.mobile || "");
    formData.append("price", price !== null ? String(price) : "");
    formData.append("tags", tags.map((t) => t.text).join(", "));
    formData.append("category_id", String(categoryId));
    formData.append("city_id", String(cityId));
    formData.append("state_id", String(stateId));
    formData.append("willing_to_trade", "0");

    if (lat.trim()) formData.append("lat", lat.trim());
    if (lng.trim()) formData.append("lng", lng.trim());

    if (removeImage) {
      formData.append("remove_image", "1");
    } else if (imageFile) {
      formData.append("image", imageFile);
    }

    const categoryValueIds = Object.values(selectedCategoryValues).filter(
      (id) => id !== null,
    );
    categoryValueIds.forEach((id) => {
      formData.append("category_value_ids[]", String(id));
    });

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/panel/advertise/advertisement/${advertisementId}`,
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
        throw new Error(result.message || "خطا در ویرایش آگهی");
      }

      setSuccess("آگهی با موفقیت ویرایش شد.");
      setTimeout(() => {
        router.push("/panel/advertisements?edited=1");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ارسال اطلاعات");
    } finally {
      setSubmitting(false);
    }
  };

  // ========== توابع مدیریت تگ ==========
  const handleAddTag = (tag: Tag) => setTags([...tags, tag]);
  const handleDeleteTag = (index: number) =>
    setTags(tags.filter((_, i) => i !== index));

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <i className="fa fa-spinner fa-spin text-3xl text-rose-600"></i>
          <p className="text-gray-500">در حال بارگذاری اطلاعات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <p className="font-medium">خطا</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
          <p className="font-medium">موفق</p>
          <p className="text-sm">{success}</p>
        </div>
      )}

      {/* تصویر فعلی و گزینه حذف */}
      {currentImage && !removeImage && !imageFile && (
        <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-24 overflow-hidden rounded-lg">
              <Image
                src={currentImage}
                alt="تصویر فعلی"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                تصویر فعلی
              </p>
              <label className="mt-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <input
                  type="checkbox"
                  checked={removeImage}
                  onChange={(e) => setRemoveImage(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                حذف تصویر فعلی
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* عنوان */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            عنوان <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="عنوان آگهی"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-rose-500 focus:bg-white dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* نوع آگهی */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            نوع آگهی
          </label>
          <input
            type="text"
            value={adsType}
            onChange={(e) => setAdsType(e.target.value)}
            placeholder="مثلاً خودرو، موبایل، ملک"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-rose-500 focus:bg-white dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* وضعیت ظاهری */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            وضعیت ظاهری
          </label>
          <select
            value={adsStatus}
            onChange={(e) => setAdsStatus(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-rose-500 focus:bg-white dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="new">نو</option>
            <option value="as_good_as_new">در حد نو</option>
            <option value="good">خوب</option>
            <option value="acceptable">قابل قبول</option>
          </select>
        </div>

        {/* قیمت */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            قیمت (تومان)
          </label>
          <input
            type="number"
            value={price ?? ""}
            onChange={(e) =>
              setPrice(e.target.value ? Number(e.target.value) : null)
            }
            placeholder="قیمت به تومان"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-rose-500 focus:bg-white dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* شماره تماس */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            شماره تماس
          </label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="شماره تماس"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-rose-500 focus:bg-white dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-400">
            اگر خالی بگذارید، شماره موبایل شما نمایش داده می‌شود.
          </p>
        </div>

        {/* دسته‌بندی */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            دسته‌بندی <span className="text-red-500">*</span>
          </label>
          <select
            value={categoryId ?? ""}
            onChange={(e) =>
              setCategoryId(e.target.value ? Number(e.target.value) : null)
            }
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-rose-500 focus:bg-white dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">انتخاب دسته‌بندی</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* ویژگی‌های دسته‌بندی */}
        {categoryAttributes.length > 0 && (
          <div className="md:col-span-2">
            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                ویژگی‌های دسته‌بندی
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {categoryAttributes.map((attr) => (
                  <div key={attr.id}>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                      className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-rose-500 focus:bg-white dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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

        {/* شهر */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            شهر <span className="text-red-500">*</span>
          </label>
          <select
            value={cityId ?? ""}
            onChange={handleCityChange}
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-rose-500 focus:bg-white dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            محل <span className="text-red-500">*</span>
          </label>
          <select
            value={stateId ?? ""}
            onChange={handleStateChange}
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-rose-500 focus:bg-white dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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

        {/* برچسب‌ها */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            برچسب‌ها (اختیاری)
          </label>
          <div className="rounded-xl border border-gray-300 bg-gray-50 p-2 transition focus-within:border-rose-500 dark:border-gray-600 dark:bg-gray-800">
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
        </div>

        {/* موقعیت جغرافیایی */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            عرض جغرافیایی (اختیاری)
          </label>
          <input
            type="text"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="مثلاً 35.6892"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-rose-500 focus:bg-white dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            طول جغرافیایی (اختیاری)
          </label>
          <input
            type="text"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="مثلاً 51.3890"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-rose-500 focus:bg-white dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* توضیحات */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            توضیحات <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="توضیحات کامل آگهی..."
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-rose-500 focus:bg-white dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-400">
            {description.length}/۱۰۰۰
          </p>
        </div>

        {/* تصویر اصلی */}
        <div className="md:col-span-2">
          <ImageUploader
            label="تصویر اصلی آگهی (در صورت انتخاب، تصویر فعلی جایگزین می‌شود)"
            value={imageFile}
            preview=""
            onChange={(file) => {
              if (file) setRemoveImage(false);
              setImageFile(file);
            }}
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
      <div className="flex gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
        <button
          onClick={handleSubmit}
          disabled={submitting || !csrfToken}
          className="flex items-center gap-2 rounded-xl bg-rose-600 px-7 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <>
              <i className="fa fa-spinner fa-spin"></i> در حال ذخیره...
            </>
          ) : (
            <>
              <i className="fa fa-save"></i> ذخیره تغییرات
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-gray-300 px-7 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          انصراف
        </button>
      </div>
    </div>
  );
}

export default UserAdsEditForm;
