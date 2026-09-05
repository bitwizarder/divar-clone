// types/ads.ts

import { Category } from "./category";
import { CategoryAttribute } from "./categoryAttribute";
import { CategoryValue } from "./categoryValue";
import { City } from "./city";
import { Gallery } from "./gallery";
import { State } from "./state";
import { User } from "./user";

// ===== انواع کمکی =====

// برای ویژگی‌های با مقدار (در فرم ایجاد/ویرایش)
export interface CategoryAttributeWithValue {
  id: number;
  name: string;
  value: string | null;
  unit: string | null;
  category_attribute_id?: number;
}

// ===== مدل اصلی آگهی =====
export interface Ads {
  id: number;
  title: string;
  description: string;
  ads_type: string;
  ads_status: string | number;
  category: Category;
  allCategory?: Category[];
  featured_expires_at: Date | null;

  // ✅ ویژگی‌های با مقدار (برای فرم ایجاد/ویرایش)
  category_attributes_with_values?: CategoryAttributeWithValue[];

  // ✅ مقادیر انتخاب‌شده از جدول category_values (برای ویرایش)
  categoryValues?:
    | {
        data: CategoryValue[];
        categoryValue_count?: number;
        trash_count?: number;
        status?: boolean;
      }
    | CategoryValue[]; // پشتیبانی از هر دو حالت (آرایه یا شیء با data)
  category_values?: CategoryValue[]; // پشتیبانی از هر دو حالت (آرایه یا شیء با data)

  user: User;
  city: City;
  state: State;
  published_at: string | null;
  expired_at: string | null;
  view: number;
  gallery: Gallery | null;
  contact: string | null;
  is_special: boolean | number | null;
  is_ladder: boolean | number;
  image: any | null;
  slug: string;
  price: number | null;
  tags: string | null;
  lat: string | null;
  lng: string | null;
  willing_to_trade: boolean | number;
  status: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AdsResponse {
  data: Ads;
  status: boolean;
}

export interface AdsListResponse {
  data: Ads[];
  advertisement_count: number;
  trash_count: number;
  status: boolean;
}
