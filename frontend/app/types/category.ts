export interface Category {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  status?: number; // 0 = غیرفعال, 1 = فعال
  icon?: string | null; // اختیاری
  // parent_id?: number | null; // اختیاری
  parent_id?: number | null;
  children?: Category[];
  parent?: {
    id: number;
    name: string;
  } | null;
  created_at?: string; // ? یعنی اختیاری است
  updated_at?: string;
  deleted_at?: string;
}

// اگر پاسخ API شما یک کلید "data" دارد که خودش یک آرایه است،
// می‌توانید یک نوع برای پاسخ API هم تعریف کنید (اختیاری اما مفید)
export interface CategoryResponse {
  data: Category;
}
export interface CategoryListResponse {
  status?: boolean;
  data: Category[];
  trash_count?: number;
  category_count?: number;
  // در صورت وجود pagination، می‌توانید اضافه کنید:
  // current_page?: number;
  // total?: number;
  // per_page?: number;
  // ...
}
