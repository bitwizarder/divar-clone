import { City } from "./city";

export interface State {
  id: number;
  name: string;
  description: string;
  status: number; // 0 = غیرفعال, 1 = فعال
  icon?: string | null; // اختیاری
  parent_id?: number | null;
  parent?: State;
  city_id: number;
  city: City;
  children?: State[];
  created_at?: string; // ? یعنی اختیاری است
  updated_at?: string;
  deleted_at?: string;
}

// اگر پاسخ API شما یک کلید "data" دارد که خودش یک آرایه است،
// می‌توانید یک نوع برای پاسخ API هم تعریف کنید (اختیاری اما مفید)
export interface StateResponse {
  data: State;
}
export interface StateEditFormProps {
  state: State;
  states: State[];
}
export interface StateListResponse {
  data: State[];
  trash_count?: number;
  state_count?: number;
  // در صورت وجود pagination، می‌توانید اضافه کنید:
  // current_page?: number;
  // total?: number;
  // per_page?: number;
  // ...
}
