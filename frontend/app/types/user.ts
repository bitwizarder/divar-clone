// types/user.ts

/**
 * مدل اصلی User بر اساس مایگریشن‌های لاراول
 */
export interface User { 
  id: number;
  name?: string | null;           // nullable
  email?: string | null;          // nullable, unique
  email_verified_at?: string | null; // nullable
  mobile?: string | null;         // nullable, unique
  mobile_verified_at?: string | null; // nullable
  city_id?: number | null;        // nullable, foreign key to cities
  password: string;               // اجباری (در پاسخ API معمولاً حذف می‌شود)
  remember_token?: string | null; // nullable
  is_active: 0 | 1;               // 0 = غیرفعال, 1 = فعال
  user_type: 0 | 1;               // 0 = کاربر عادی, 1 = ادمین
  status: 0 | 1;                  // 0 = غیرفعال, 1 = فعال
  created_at: string;             // ISO date string
  updated_at: string;             // ISO date string
  deleted_at?: string | null;     // nullable (soft delete)
}

/**
 * پاسخ API برای یک کاربر
 */
export interface UserResponse {
  data: User;
}

/**
 * پاسخ API برای لیست کاربران
 */
export interface UserListResponse {
  data: User[];
  user_count?: number;     // تعداد کل کاربران
  trash_count?: number;    // تعداد کاربران حذف‌شده (سطل زباله)
  // در صورت وجود pagination:
  // current_page?: number;
  // total?: number;
  // per_page?: number;
  // last_page?: number;
}

/**
 * نوع برای فرم ایجاد کاربر جدید
 * فیلدهای خودکار (id, created_at, updated_at, deleted_at, remember_token) حذف شده‌اند.
 * همچنین فیلدهای تأیید شده (verified_at) در زمان ایجاد تنظیم نمی‌شوند.
 */
export type UserCreateInput = Omit<
  User,
  | "id"
  | "created_at"
  | "updated_at"
  | "deleted_at"
  | "remember_token"
  | "email_verified_at"
  | "mobile_verified_at"
> & {
  // فیلدهایی که در فرم ایجاد اجباری هستند:
  name: string;
  email?: string | null;
  mobile?: string | null;
  password: string;
  password_confirmation?: string; // برای تأیید رمز عبور (اختیاری)
};

/**
 * نوع برای فرم ویرایش کاربر
 * همه فیلدها اختیاری هستند (Partial) به جز id که اجباری است.
 */
export type UserUpdateInput = Partial<Omit<UserCreateInput, "password">> & {
  id: number;
  password?: string; // برای تغییر رمز عبور (اختیاری)
  password_confirmation?: string; // تأیید رمز عبور جدید
};

/**
 * نوع برای فرم لاگین
 */
export interface LoginInput {
  email?: string;   // یا موبایل
  mobile?: string;  // یا ایمیل
  password: string;
  remember?: boolean;
}

/**
 * نوع برای فرم ثبت‌نام
 */
export interface RegisterInput {
  name: string;
  email?: string | null;
  mobile?: string | null;
  password: string;
  password_confirmation: string;
}