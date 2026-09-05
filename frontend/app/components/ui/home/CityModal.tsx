"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFilter } from "@/app/context/FilterContext";
import Modal from "./modal/Modal";
import { toPersianNumber } from "@/app/helpers";
import { City } from "@/app/types/city";

interface CityModalProps {
  cities: City[] | null;
}

function CityModal({ cities }: CityModalProps) {
  const { selectedCities, setSelectedCities } = useFilter();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // هنگام باز شدن مودال، انتخاب‌های فعلی را کپی می‌کنیم و جستجو را ریست می‌کنیم
  useEffect(() => {
    if (isOpen) {
      setTempSelected(selectedCities);
      setSearchTerm("");
    }
  }, [isOpen, selectedCities]);

  const handleToggle = (city: any) => {
    setTempSelected((prev) => {
      const exists = prev.some((c) => c.id === city.id);
      if (exists) {
        return prev.filter((c) => c.id !== city.id);
      } else {
        return [...prev, city];
      }
    });
  };

  const handleClear = () => {
    setTempSelected([]);
  };

  const handleDone = () => {
    if (tempSelected.length === 0) return;
    setSelectedCities(tempSelected);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  // حذف یک شهر از انتخاب‌ها
  const removeCity = (cityId: number) => {
    setTempSelected((prev) => prev.filter((c) => c.id !== cityId));
  };

  // فیلتر کردن لیست بر اساس جستجو
  const filteredCities = cities?.filter((city) =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // متن نمایشی در دکمه‌ی بازکننده
  const displayText =
    selectedCities.length === 0
      ? "تعیین شهر"
      : selectedCities.length === 1
        ? selectedCities[0].name
        : `${toPersianNumber(selectedCities.length)} شهر`;

  // غیرفعال بودن دکمه تأیید
  const isConfirmDisabled = tempSelected.length === 0;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-gray-600 space-x-1 text-sm flex flex-nowrap shrink-0 items-center"
      >
        <i className="fa fa-location-dot text-gray content-center"></i>
        <span>{displayText}</span>
        <i className="fa fa-angle-down text-gray content-center"></i>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        title={`انتخاب شهر (${toPersianNumber(tempSelected.length)} انتخاب)`}
        size="md"
        closeOnOutsideClick={true}
        showCloseButton={true}
      >
        <div className="space-y-4">
          {/* جستجوی شهر */}
          <div className="relative">
            <input
              type="text"
              placeholder="جستجوی شهر..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 text-sm outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>

          {/* نمایش شهرهای انتخاب‌شده به‌صورت برچسب (Chips) */}
          {tempSelected.length > 0 && (
            <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3 dark:border-gray-700">
              {tempSelected.map((city) => (
                <span
                  key={city.id}
                  className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                >
                  {city.name}
                  <button
                    onClick={() => removeCity(city.id)}
                    className="cursor-pointer text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-200"
                  >
                    <i className="fa fa-times text-xs"></i>
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* لیست شهرها */}
          <div className="max-h-60 overflow-y-auto">
            {filteredCities?.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-4">
                شهری با این نام یافت نشد.
              </p>
            ) : (
              filteredCities?.map((city) => (
                <label
                  key={city.id}
                  className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <input
                    type="checkbox"
                    checked={tempSelected.some((c) => c.id === city.id)}
                    onChange={() => handleToggle(city)}
                    className="h-5 w-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {city.name}
                  </span>
                </label>
              ))
            )}
          </div>

          {/* دکمه‌های پایین */}
          <div className="flex items-center justify-between gap-3 border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
              onClick={handleClear}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <i className="fa fa-trash ml-1"></i>
              پاک کردن همه
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                انصراف
              </button>
              <button
                onClick={handleDone}
                disabled={isConfirmDisabled}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
                  isConfirmDisabled
                    ? "bg-gray-400 cursor-not-allowed opacity-50"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                تأیید
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default CityModal;
