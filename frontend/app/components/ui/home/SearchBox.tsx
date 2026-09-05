"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFilter } from "@/app/context/FilterContext";
import SearchSuggestions from "./SearchSuggestions";
import { useDebounce } from "@/app/hooks/useDebounce";

// تابع دریافت پیشنهادات از API
async function fetchSuggestions(query: string): Promise<any[]> {
  if (query.length < 2) return [];

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/advertisements?search=${encodeURIComponent(query)}`,
      {
        headers: { Accept: "application/json" },
        cache: "no-cache",
      },
    );
    if (!res.ok) return [];
    const data = await res.json();
    const items = data.data || [];

    // ۱. گروه‌بندی بر اساس ریشه‌ترین دسته‌بندی
    const grouped = items.reduce((acc: any, ad: any) => {
      const rootCategory = ad.allCategory?.[0] || null;
      const categoryName = rootCategory?.name || "سایر";
      const categoryId = rootCategory?.id || 0;
      const key = `${categoryId}-${categoryName}`;
      if (!acc[key]) {
        acc[key] = {
          id: categoryId,
          title: categoryName,
          category: categoryName,
          count: 0,
          sampleAd: ad,
        };
      }
      acc[key].count += 1;
      return acc;
    }, {});

    // ۲. ایجاد آرایه نهایی از پیشنهادات
    const suggestions = [];

    // ۲-۱. اضافه کردن چند آگهی نمونه (حداکثر ۳ عدد)
    const sampleAds = items.slice(0, 3).map((ad: any) => ({
      type: "ad", // ✅ نوع: آگهی
      id: ad.id,
      title: ad.title,
      category: ad.category?.name || "",
    }));
    suggestions.push(...sampleAds);

    // ۲-۲. اضافه کردن دسته‌بندی‌های گروه‌بندی‌شده (حداکثر ۵ عدد)
    const categoryItems = Object.values(grouped)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5)
      .map((group: any) => ({
        type: "category", // ✅ نوع: دسته‌بندی
        id: group.id,
        title: group.title,
        category: group.category,
        count: group.count,
      }));
    suggestions.push(...categoryItems);

    return suggestions;
  } catch {
    return [];
  }
}

function SearchBox() {
  const router = useRouter();
  const { searchQuery, setSearchQuery, setSelectedCategory } = useFilter();
  const [inputValue, setInputValue] = useState(searchQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(inputValue, 300);

  // دریافت پیشنهادات از API
  useEffect(() => {
    const loadSuggestions = async () => {
      if (debouncedQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      const results = await fetchSuggestions(debouncedQuery);
      setSuggestions(results);
      setLoading(false);
    };

    loadSuggestions();
  }, [debouncedQuery]);

  // بستن نتایج با کلیک خارج
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
  };

  // ✅ فقط با Enter فیلتر اعمال می‌شود
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setShowSuggestions(false);
      // ✅ پاک کردن دسته‌بندی انتخاب‌شده
      setSelectedCategory(null);
      if (inputValue.trim()) {
        setSearchQuery(inputValue.trim());
        router.push(`/?q=${encodeURIComponent(inputValue.trim())}`);
      } else {
        setSearchQuery("");
        router.push("/");
      }
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setInputValue(suggestion.title);
    setShowSuggestions(false);

    if (suggestion.type === "ad") {
      // اگر آگهی است → به صفحه آگهی بروید
      router.push(`/ads/${suggestion.id}`);
    } else {
      // اگر دسته‌بندی است → فیلتر دسته‌بندی اعمال شود
      setSelectedCategory({ id: suggestion.id, name: suggestion.title });
      setSearchQuery("");
      router.push("/");
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="flex-center-start grow border-l lg:border-0 border-gray-300 relative">
        <i className="fa fas fa-search text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="جستجو در همه آگهی ها"
          className="w-full ps-10 pe-3 py-2 lg:py-1 my-2 placeholder:text-gray-400 focus:outline-none bg-transparent"
        />
        {inputValue && (
          <button
            onClick={() => {
              setInputValue("");
              setSearchQuery("");
              setSuggestions([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <i className="fa fa-times"></i>
          </button>
        )}
      </div>

      {/* نتایج پیشنهادی */}
      {showSuggestions && (
        <div className="absolute right-0 left-0 top-full mt-2 z-50 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <SearchSuggestions
            suggestions={suggestions}
            loading={loading}
            onSelect={handleSuggestionClick}
          />
        </div>
      )}
    </div>
  );
}

export default SearchBox;
