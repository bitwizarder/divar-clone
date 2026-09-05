"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import ImageUploader from "@/app/components/ui/common/ImageUploader";

import { WithContext as ReactTags, Tag } from "react-tag-input";
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

type Step = 1 | 2 | 3 | 4;

function UserAdsCreateForm() {
  const router = useRouter();
  const { user } = useAuth();

  // ========== استیت‌های فرم ==========
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

  // ========== ویژگی‌های دسته‌بندی ==========
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

  // ========== CSRF و وضعیت ==========
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // ========== استیت‌های Wizard ==========
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [stepErrors, setStepErrors] = useState<Record<Step, string | null>>({
    1: null,
    2: null,
    3: null,
    4: null,
  });

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

  // ========== دریافت ویژگی‌ها ==========
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
    setStateId(null);
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

  // ========== تبدیل درخت محله‌ها به آرایه مسطح ==========
  const flattenStates = (states: State[], prefix: string = ""): State[] => {
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

  // ========== اعتبارسنجی هر مرحله ==========
  const validateStep = (step: Step): boolean => {
    let isValid = true;
    let errorMsg: string | null = null;

    switch (step) {
      case 1:
        if (title.trim().length < 3) {
          errorMsg = "عنوان باید حداقل ۳ کاراکتر باشد.";
          isValid = false;
        } else if (description.trim().length < 10) {
          errorMsg = "توضیحات باید حداقل ۱۰ کاراکتر باشد.";
          isValid = false;
        }
        break;

      case 2:
        if (!categoryId) {
          errorMsg = "لطفاً یک دسته‌بندی انتخاب کنید.";
          isValid = false;
        }
        break;

      case 3:
        if (!cityId) {
          errorMsg = "لطفاً یک شهر انتخاب کنید.";
          isValid = false;
        } else if (!stateId) {
          errorMsg = "لطفاً یک محل انتخاب کنید.";
          isValid = false;
        } else if (lat.trim() && isNaN(Number(lat.trim()))) {
          errorMsg = "عرض جغرافیایی باید یک عدد معتبر باشد.";
          isValid = false;
        } else if (lng.trim() && isNaN(Number(lng.trim()))) {
          errorMsg = "طول جغرافیایی باید یک عدد معتبر باشد.";
          isValid = false;
        } else if (
          lat.trim() &&
          (Number(lat.trim()) < -90 || Number(lat.trim()) > 90)
        ) {
          errorMsg = "عرض جغرافیایی باید بین ۹۰- تا ۹۰+ درجه باشد.";
          isValid = false;
        } else if (
          lng.trim() &&
          (Number(lng.trim()) < -180 || Number(lng.trim()) > 180)
        ) {
          errorMsg = "طول جغرافیایی باید بین ۱۸۰- تا ۱۸۰+ درجه باشد.";
          isValid = false;
        }
        break;

      case 4:
        // مرحله آخر فقط نمایش و ارسال است، اعتبارسنجی خاصی ندارد
        break;
    }

    setStepErrors((prev) => ({ ...prev, [step]: errorMsg }));
    return isValid;
  };

  // ========== رفتن به مرحله بعد ==========
  const goToNextStep = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step);
      // ریست کردن خطای مرحله جدید
      setStepErrors((prev) => ({ ...prev, [(currentStep + 1) as Step]: null }));
    }
  };

  // ========== رفتن به مرحله قبل ==========
  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  // ========== اعتبارسنجی نهایی و ارسال ==========
  const handleSubmit = async () => {
    // اعتبارسنجی همه مراحل
    const isStep1Valid = validateStep(1);
    const isStep2Valid = validateStep(2);
    const isStep3Valid = validateStep(3);

    if (!isStep1Valid || !isStep2Valid || !isStep3Valid) {
      // اگر خطایی وجود داشت، به اولین مرحله‌ای که خطا دارد برو
      if (!isStep1Valid) setCurrentStep(1);
      else if (!isStep2Valid) setCurrentStep(2);
      else if (!isStep3Valid) setCurrentStep(3);
      return;
    }

    if (!csrfToken) {
      setError("CSRF token موجود نیست.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
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

    if (imageFile) formData.append("image", imageFile);

    const categoryValueIds = Object.values(selectedCategoryValues).filter(
      (id) => id !== null,
    );
    categoryValueIds.forEach((id) => {
      formData.append("category_value_ids[]", String(id));
    });

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/panel/advertise/advertisement`,
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

      setTimeout(() => {
        router.push("/panel/advertisements?created=1");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ارسال اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  // ========== رندر گام‌ها ==========
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
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
            <div className="md:col-span-2">
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
          </div>
        );

      case 2:
        return (
          <div className="grid grid-cols-1 gap-5">
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
            )}
          </div>
        );

      case 3:
        return (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* برچسب‌ها */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  برچسب‌ها (اختیاری)
                </label>
                <div className="rounded-xl border border-gray-300 bg-gray-50 p-2 transition focus-within:border-rose-500 dark:border-gray-600 dark:bg-gray-800">
                  <ReactTags
                    tags={tags}
                    handleAddition={(tag) => setTags([...tags, tag])}
                    handleDelete={(index) =>
                      setTags(tags.filter((_, i) => i !== index))
                    }
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

              {/* تصویر اصلی */}
              <div className="md:col-span-2">
                <ImageUploader
                  label="تصویر اصلی آگهی"
                  value={imageFile}
                  preview=""
                  onChange={(file) => setImageFile(file)}
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

              {/* خلاصه اطلاعات */}
              <div className="md:col-span-2 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <h4 className="mb-3 font-semibold text-gray-900 dark:text-white">
                  خلاصه آگهی
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">عنوان:</span>{" "}
                    <span className="font-medium">{title || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">نوع:</span>{" "}
                    <span className="font-medium">{adsType || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">دسته‌بندی:</span>{" "}
                    <span className="font-medium">
                      {categories.find((c) => c.id === categoryId)?.name || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">قیمت:</span>{" "}
                    <span className="font-medium">
                      {price ? `${price.toLocaleString()} تومان` : "توافقی"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">شهر:</span>{" "}
                    <span className="font-medium">
                      {cities.find((c) => c.id === cityId)?.name || "—"}
                    </span>
                    {" • "}
                    <span className="text-gray-500">محله:</span>{" "}
                    <span className="font-medium">
                      {states.find((s) => s.id === stateId)?.name || "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  // ========== رندر ==========
  return (
    <div className="space-y-6">
      {/* نمایش خطاهای عمومی */}
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

      {/* ========== Stepper ========== */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                    currentStep === step
                      ? "bg-rose-600 text-white"
                      : currentStep > step
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  {currentStep > step ? <i className="fa fa-check"></i> : step}
                </div>
                <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {step === 1 && "اطلاعات پایه"}
                  {step === 2 && "دسته‌بندی"}
                  {step === 3 && "موقعیت"}
                  {step === 4 && "تکمیل"}
                </span>
              </div>
              {step < 4 && (
                <div
                  className={`mx-2 h-0.5 flex-1 transition-colors ${
                    currentStep > step
                      ? "bg-green-500"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
        {/* نمایش خطای مرحله فعلی */}
        {stepErrors[currentStep] && (
          <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <i className="fa fa-exclamation-circle ml-2"></i>
            {stepErrors[currentStep]}
          </div>
        )}
      </div>

      {/* ========== محتوای مرحله ========== */}
      <div className="min-h-75">{renderStepContent()}</div>

      {/* ========== دکمه‌های ناوبری ========== */}
      <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
        <button
          type="button"
          onClick={goToPrevStep}
          disabled={currentStep === 1}
          className="rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <i className="fa fa-arrow-right ml-2"></i>
          مرحله قبل
        </button>

        {currentStep < 4 ? (
          <button
            type="button"
            onClick={goToNextStep}
            className="rounded-xl bg-rose-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-rose-700"
          >
            مرحله بعد
            <i className="fa fa-arrow-left mr-2"></i>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !csrfToken}
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <i className="fa fa-spinner fa-spin"></i> در حال ایجاد...
              </>
            ) : (
              <>
                <i className="fa fa-check"></i> ثبت آگهی
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default UserAdsCreateForm;
