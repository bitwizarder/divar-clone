"use client";

import React from "react";
import Picker from "@/app/components/ui/home/modal/Picker";
import { useFilter } from "@/app/context/FilterContext";

interface CategoryModalProps {
  categories: any[];
}

function CategoryModal({ categories }: CategoryModalProps) {
  const { selectedCategory, setSelectedCategory } = useFilter();

  const handleChange = (category: any | null) => {
    setSelectedCategory(category);
  };

  // تابع رندر بازگشتی با stopPropagation
  const renderCategoryTree = (category: any): React.ReactNode => {
    const hasChildren = category.children && category.children.length > 0;

    return (
      <div className="w-full">
        <div
          className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-100 rounded px-2"
          onClick={(e) => {
            e.stopPropagation();
            handleChange(category);
          }}
        >
          {category.icon && (
            <i className={`${category.icon} text-gray-600`}></i>
          )}
          <span className="font-medium">{category.name}</span>
          {hasChildren && (
            <span className="text-xs text-gray-400 mr-auto">
              ({category.children?.length})
            </span>
          )}
        </div>
        {hasChildren && (
          <div className="mr-6 border-r-2 border-gray-200 pr-4 space-y-1 mt-1">
            {category.children!.map((child: any, idx: number) => (
              <div key={child.slug || idx}>{renderCategoryTree(child)}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Picker
      items={categories}
      placeholder="انتخاب دسته‌بندی"
      modalTitle="انتخاب دسته‌بندی"
      value={selectedCategory}
      onChange={handleChange}
      renderButton={({ selected, onClick }) => (
        <button
          onClick={onClick}
          className="text-gray-600 space-x-1 text-sm flex flex-nowrap shrink-0 items-center"
        >
          <i className="fa fa-list-ul -scale-x-90 text-gray content-center"></i>
          <span>{selected ? selected.name : "تعیین دسته"}</span>
          <i className="fa fa-angle-down text-gray content-center"></i>
        </button>
      )}
      renderItem={(category) => renderCategoryTree(category)}
    />
  );
}

export default CategoryModal;
