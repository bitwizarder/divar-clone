 interface Page {
  id: number;
  title: string; 
  body: string;
  url?: string;
  slug?: string;
  status: number; // 0 = غیرفعال, 1 = فعال
  created_at?: string; // ? یعنی اختیاری است
  updated_at?: string;
  deleted_at?: string;
}

// اگر پاسخ API شما یک کلید "data" دارد که خودش یک آرایه است،
// می‌توانید یک نوع برای پاسخ API هم تعریف کنید (اختیاری اما مفید)
export interface PageResponse {
  data: Page;
}
export interface PageListResponse {
  data: Page[];
  trash_count?: number;
  page_count?: number;
  // در صورت وجود pagination، می‌توانید اضافه کنید:
  // current_page?: number;
  // total?: number;
  // per_page?: number;
  // ...
}
