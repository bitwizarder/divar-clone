export interface Setting {
  id: number;
  title: string;
  description: string;
  logo?: string | null;
  keywords?: string | null;
  favicon?: string | null;
  phone?: string | null;
  email?: string | null;
  created_at?: string;
  updated_at?: string;
}
export interface SettingResponse {
  data: Setting;
}
export interface SettingEditFormProps {
  setting: Setting;
  settings: Setting[];
}
export interface SettingListResponse {
  data: Setting[];
}
export interface SettingFormProps {
  setting: Setting;
}
