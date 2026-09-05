"use client";

import React, { useState, useEffect } from "react";
import { State } from "@/app/types/state";
import { useFilter } from "@/app/context/FilterContext";
import Picker from "./modal/Picker";

async function fetchStates(): Promise<State[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/states`,
      {
        headers: { Accept: "application/json" },
        cache: "no-cache",
      },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

function StateModal() {
  const { selectedCities, selectedState, setSelectedState } = useFilter();
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStates()
      .then((data) => setStates(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // فقط اگر دقیقاً یک شهر انتخاب شده باشد، محله‌ها را فیلتر کن
  const isSingleCitySelected = selectedCities.length === 1;
  const selectedCity = isSingleCitySelected ? selectedCities[0] : null;

  // فیلتر محله‌ها بر اساس city_id شهر انتخاب‌شده
  const filteredStates = selectedCity
    ? states.filter((state) => state.city_id === selectedCity.id)
    : [];

  // محله‌های ریشه (بدون والد) برای نمایش در Picker
  const rootStates = filteredStates.filter((state) => state.parent_id === null);

  const handleChange = (state: State | null) => {
    setSelectedState(state);
  };

  if (loading) {
    return <div className="p-2 text-sm text-gray-500">در حال بارگذاری...</div>;
  }

  if (!isSingleCitySelected) {
    return (
      <div className="p-2 text-sm text-gray-500 text-center">
        برای مشاهده محله‌ها، یک شهر انتخاب کنید.
      </div>
    );
  }

  if (filteredStates.length === 0) {
    return (
      <div className="p-2 text-sm text-gray-500 text-center">
        این شهر فاقد محله است.
      </div>
    );
  }

  // تابع بازگشتی برای نمایش درخت محله‌ها
  const renderStateTree = (state: State): React.ReactNode => {
    const hasChildren = state.children && state.children.length > 0;
    const isSelected = selectedState?.id === state.id;

    return (
      <div className="w-full">
        <div
          className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer transition-colors ${
            isSelected
              ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
              : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
          }`}
          onClick={(e) => {
            e.stopPropagation(); // جلوگیری از bubble به والد
            handleChange(state);
          }}
        >
          {state.icon && <i className={`${state.icon} text-sm`}></i>}
          <span className="text-sm font-medium">{state.name}</span>
          {hasChildren && (
            <span className="text-xs text-gray-400 mr-auto">
              ({state.children?.length})
            </span>
          )}
          {isSelected && <i className="fa fa-check text-rose-600 text-xs"></i>}
        </div>
        {hasChildren && (
          <div className="mr-4 border-r-2 border-gray-200 dark:border-gray-700 pr-3 space-y-1 mt-1">
            {state.children!.map((child) => (
              <div key={child.id}>{renderStateTree(child)}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Picker
      items={rootStates}
      placeholder="تعیین محل"
      modalTitle={`انتخاب محله (${selectedCity?.name})`}
      showClear={true}
      clearText="همه محله‌ها"
      value={selectedState}
      onChange={handleChange}
      renderItem={(state) => renderStateTree(state)}
    />
  );
}

export default StateModal;
