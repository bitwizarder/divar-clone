// types/gallery.ts

import { Ads } from "./ads";

/**
 * ساختار تصویر گالری
 */
export interface GalleryImage {
  indexArray: {
    large: string;
    medium: string;
    small: string;
  };
  directory: string;
  currentImage: 'large' | 'medium' | 'small';
}

/**
 * مدل اصلی گالری
 */
export interface Gallery {
  id: number;
  image: GalleryImage;
  advertisement_id: number;
  advertisement?: Ads
  status: number; // 0 = غیرفعال, 1 = فعال
  created_at: string;
  updated_at: string;
}

/**
 * پاسخ API برای لیست گالری
 */
export interface GalleryListResponse {
  data: Gallery[];
  status: boolean;
}

/**
 * پاسخ API برای یک گالری
 */
export interface GalleryResponse {
  data: Gallery;
}

/**
 * نوع داده‌های مورد نیاز برای ایجاد گالری جدید
 */
export type GalleryCreateInput = Omit<
  Gallery,
  'id' | 'created_at' | 'updated_at' | 'advertisement' | 'image'
> & {
  image: File; // فایل تصویر
  advertisement_id: number;
};

/**
 * نوع داده‌های مورد نیاز برای ویرایش گالری
 */
export type GalleryUpdateInput = Partial<
  Omit<GalleryCreateInput, 'image' | 'advertisement_id'>
> & {
  id: number;
  image?: File | null;
};