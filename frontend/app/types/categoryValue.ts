import { CategoryAttribute } from "./categoryAttribute";

/**
 * مدل اصلی مقدار ویژگی دسته‌بندی (Category Value)
 * مطابق با پاسخ API
 */
export interface CategoryValue {
  id: number;
  value: string;
  category_attribute_id: number; // ✅ مهم: برای تطبیق در فرم ویرایش
  categoryAttribute?: CategoryAttribute;
  type: number;
  status: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * پاسخ API برای یک آیتم
 */
export interface CategoryValueResponse {
  data: CategoryValue;
}

/**
 * پاسخ API برای لیست مقادیر ویژگی‌ها (با متادیتا)
 */
export interface CategoryValueListResponse {
  data: CategoryValue[];
  status: boolean; // وضعیت کلی پاسخ (true/false)
}

/**
 * نوع داده‌های مورد نیاز برای ایجاد مقدار ویژگی جدید
 * فیلدهای خودکار (id, timestamps, categoryAttribute کامل) حذف شده‌اند
 */
export type CategoryValueCreateInput = Omit<
  CategoryValue,
  "id" | "created_at" | "updated_at" | "categoryAttribute"
> & {
  category_attribute_id: number; // شناسه ویژگی دسته‌بندی
};

/**
 * نوع داده‌های مورد نیاز برای ویرایش مقدار ویژگی
 * همه فیلدها اختیاری هستند به جز id
 */
export type CategoryValueUpdateInput = Partial<
  Omit<CategoryValueCreateInput, "category_attribute_id">
> & {
  id: number;
  category_attribute_id?: number; // اختیاری (می‌تواند تغییر نکند)
};

/**
 * نوع محدود برای وضعیت (اختیاری - برای خوانایی بیشتر)
 */
export type CategoryValueStatus = 0 | 1;

/**
 * نوع محدود برای نوع مقدار (اختیاری)
 */
export type CategoryValueType = 0 | 1; // 0 = عادی, 1 = ویژه
