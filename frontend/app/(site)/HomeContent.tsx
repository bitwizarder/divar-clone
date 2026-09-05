"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFilter } from "@/app/context/FilterContext";
import AdvertisementList from "../components/ui/home/AdvertisementList";
interface HomeContentProps {
  sidebar: React.ReactNode; // Sidebar از والد سروری دریافت می‌شود
}
function HomeContent({ sidebar }: HomeContentProps) {
  const router = useRouter();
  const { isLoading, selectedCities } = useFilter();

  // اگر شهری انتخاب نشده، به صفحه انتخاب شهر برو
  useEffect(() => {
    if (!isLoading && selectedCities.length === 0) {
      router.push("/select-city");
    }
  }, [isLoading, selectedCities, router]);
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <i className="fa fa-spinner fa-spin text-3xl text-rose-600"></i>
          <p className="text-gray-500">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!selectedCities) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <i className="fa fa-spinner fa-spin text-3xl text-rose-600"></i>
          <p className="text-gray-500">در حال هدایت به صفحه انتخاب شهر...</p>
        </div>
      </div>
    );
  }

  const citiesText = selectedCities.map((c) => c.name).join("، ");

  return (
    <section className="flex container mt-10 pb-20 gap-x-5">
      {sidebar}
      <main className="lg:w-4/5">
        {/* بخش دسته‌بندی‌های موبایل (اختیاری) */}
        <section className="flex-center md:justify-start flex-wrap gap-x-4 gap-y-3 [&_h4]:text-sm [&_h4]:mt-5 lg:hidden">
          <div className="size-28 flex flex-col items-center justify-center">
            <div className="size-16 bg-gray-100 text-red-700 text-3xl flex items-center justify-center p-1 rounded-lg">
              <i className="fa fa-home"></i>
            </div>
            <h4 className="whitespace-nowrap">املاک</h4>
          </div>

          <div className="size-28 flex flex-col items-center justify-center">
            <div className="size-16 bg-gray-100 text-red-700 text-3xl flex items-center justify-center p-1 rounded-lg">
              <i className="fa fa-car"></i>
            </div>
            <h4 className="whitespace-nowrap">وسایل نقلیه</h4>
          </div>

          <div className="size-28 flex flex-col items-center justify-center">
            <div className="size-16 bg-gray-100 text-red-700 text-3xl flex items-center justify-center p-1 rounded-lg">
              <i className="fa fa-laptop"></i>
            </div>
            <h4 className="whitespace-nowrap">کالای دیجیتال</h4>
          </div>

          <div className="size-28 flex flex-col items-center justify-center">
            <div className="size-16 bg-gray-100 text-red-700 text-3xl flex items-center justify-center p-1 rounded-lg">
              <i className="fa fas fa-diamond"></i>
            </div>
            <h4 className="whitespace-nowrap">خانه و آشپزخانه</h4>
          </div>

          <div className="size-28 flex flex-col items-center justify-center">
            <div className="size-16 bg-gray-100 text-red-700 text-3xl flex items-center justify-center p-1 rounded-lg">
              <i className="fa fa-cogs"></i>
            </div>
            <h4 className="whitespace-nowrap">خدمات</h4>
          </div>

          <div className="size-28 flex flex-col items-center justify-center">
            <div className="size-16 bg-gray-100 text-red-700 text-3xl flex items-center justify-center p-1 rounded-lg">
              <i className="fa fa-user"></i>
            </div>
            <h4 className="whitespace-nowrap">وسایل شخصی</h4>
          </div>

          <div className="size-28 flex flex-col items-center justify-center">
            <div className="size-16 bg-gray-100 text-red-700 text-3xl flex items-center justify-center p-1 rounded-lg">
              <i className="fa fa-gamepad"></i>
            </div>
            <h4 className="whitespace-nowrap">سرگرمی و فراغت</h4>
          </div>

          <div className="size-28 flex flex-col items-center justify-center">
            <div className="size-16 bg-gray-100 text-red-700 text-3xl flex items-center justify-center p-1 rounded-lg">
              <i className="fa fa-users"></i>
            </div>
            <h4 className="whitespace-nowrap">اجتماعی</h4>
          </div>

          <div className="size-28 flex flex-col items-center justify-center">
            <div className="size-16 bg-gray-100 text-red-700 text-3xl flex items-center justify-center p-1 rounded-lg">
              <i className="fa fa-briefcase"></i>
            </div>
            <h4 className="whitespace-nowrap">استخدام و کاریابی</h4>
          </div>
        </section>

        <section>
          <section>
            <h6 className="text-xs text-gray my-5">
              {selectedCities
                ? `انواع آگهی ها و خدمات در ${citiesText}`
                : "دیوار تهران : انواع آگهی ها و خدمات در تهران"}
            </h6>
          </section>
          <section className="flex flex-wrap">
            <AdvertisementList />
          </section>
        </section>
      </main>
    </section>
  );
}

export default HomeContent;
