"use client";

import { Category } from "@/app/types/category";
import { useFilter } from "@/app/context/FilterContext";
import { useEffect, useState } from "react";
import { fetchCategories } from "@/app/lib/api/categories";

function CategoryList() {
  const { selectedCategory, setSelectedCategory } = useFilter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await fetchCategories();
        // console.log("📂 داده‌های دسته‌بندی دریافت شد:", data);
        setCategories(data);
        setError(null);
      } catch (err) {
        console.error("❌ خطا در دریافت دسته‌بندی‌ها:", err);
        setError("خطا در دریافت دسته‌بندی‌ها");
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  const handleSelectCategory = (category: Category) => {
    if (selectedCategory?.id === category.id) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  // تابع بازگشتی برای رندر درخت دسته‌بندی‌ها
  const renderCategoryTree = (category: Category): React.ReactNode => {
    const hasChildren = category.children && category.children.length > 0;
    const isSelected = selectedCategory?.id === category.id;

    return (
      <div className="w-full">
        <div
          className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer transition-colors ${
            isSelected
              ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
              : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
          }`}
          onClick={() => handleSelectCategory(category)}
        >
          {category.icon && <i className={`${category.icon} text-sm`}></i>}
          <span className="text-sm font-medium">{category.name}</span>
          {hasChildren && (
            <span className="text-xs text-gray-400 mr-auto">
              ({category.children?.length})
            </span>
          )}
          {isSelected && <i className="fa fa-check text-rose-600 text-xs"></i>}
        </div>
        {hasChildren && (
          <div className="mr-4 border-r-2 border-gray-200 dark:border-gray-700 pr-3 space-y-1 mt-1">
            {category.children!.map((child) => (
              <div key={child.id}>{renderCategoryTree(child)}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="p-2 text-sm text-gray-500">در حال بارگذاری...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-2 text-sm text-center">{error}</div>;
  }

  if (categories.length === 0) {
    return (
      <div className="text-gray-500 p-4 text-center text-sm">
        هیچ دسته‌بندی‌ای یافت نشد.
      </div>
    );
  }

  // ✅ فیلتر دسته‌بندی‌های ریشه (بدون والد)
  // توجه: parent_id ممکن است null یا 0 باشد
  const rootCategories = categories.filter(
    (cat) => cat.parent_id === null || cat.parent_id === 0 || !cat.parent_id,
  );

  return (
    <section className="space-y-1">
      {rootCategories.map((category) => (
        <div key={category.id}>{renderCategoryTree(category)}</div>
      ))}
    </section>
  );
}

export default CategoryList;
