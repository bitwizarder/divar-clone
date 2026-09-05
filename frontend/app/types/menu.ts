// export type MenuPosition = 'header' | 'footer' | 'sidebar';
// export interface Menu {
//   position: MenuPosition;
// }
// export enum MenuStatus {
//   Inactive = 0,
//   Active = 1,
// }
// export interface Menu {
//   status: MenuStatus;
// }
// if (menu.status === MenuStatus.Active) { ... }
// export interface Menu {
//   readonly id: number;
//   readonly title: string;
//   // ...
// }
export interface Menu {
  id: number;
  title: string;
  slug?: string | null; // nullable در دیتابیس → اختیاری
  url?: string | null;
  position: string;
  status: number; // 0 = غیرفعال, 1 = فعال
  icon?: string | null; // اختیاری
  parent_id?: number | null;

  parent?: {
    id: number;
    title: string;
  } | null;
  created_at?: string; // ? یعنی اختیاری است
  updated_at?: string;
  deleted_at?: string;
}

// اگر پاسخ API شما یک کلید "data" دارد که خودش یک آرایه است،
// می‌توانید یک نوع برای پاسخ API هم تعریف کنید (اختیاری اما مفید)
export interface MenuResponse {
  data: Menu;
}
export interface MenuListResponse {
  data: Menu[];
  trash_count?: number;
  menu_count?: number;
  // در صورت وجود pagination، می‌توانید اضافه کنید:
  // current_page?: number;
  // total?: number;
  // per_page?: number;
  // ...
}

// نوع برای فرم ایجاد (بدون فیلدهای خودکار)
export type MenuCreateInput = Omit<
  Menu,
  "created_at" | "updated_at" | "deleted_at" | "parent"
>;

// نوع برای فرم ویرایش (با id اجباری و بقیه اختیاری)
export type MenuUpdateInput = Partial<MenuCreateInput> & { id: number };
