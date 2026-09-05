"use client";

import React from "react";

interface Suggestion {
  id: number;
  title: string;
  count?: number;
  category?: string;
  type: "ad" | "category";
}

interface SearchSuggestionsProps {
  suggestions: Suggestion[];
  loading: boolean;
  onSelect: (item: Suggestion) => void;
}

// تابع فرمت‌دهی تعداد
const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + " میلیون";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(0) + " هزار";
  }
  return count.toString();
};

function SearchSuggestions({
  suggestions,
  loading,
  onSelect,
}: SearchSuggestionsProps) {
  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        <i className="fa fa-spinner fa-spin"></i> در حال جستجو...
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">نتیجه‌ای یافت نشد.</div>
    );
  }

  return (
    <ul>
      {suggestions.map((item) => (
        <li
          key={`${item.type}-${item.id}`} // ✅ کلید یکتا
          onClick={() => onSelect(item)}
          className="cursor-pointer px-4 py-3 transition hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {item.title}
              </p>
              {item.category && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.category}
                  {item.type === "ad" && " • آگهی"}
                </p>
              )}
            </div>
            {item.count !== undefined && (
              <span className="text-sm text-gray-400">
                {formatCount(item.count)} آگهی
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default SearchSuggestions;
