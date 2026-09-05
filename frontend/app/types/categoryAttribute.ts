import { Category } from "./category";

export interface CategoryAttribute {
  id: number;
  name: string;
  unit: string;
  category_id: number;
  category: Category;
  type: number; // 0 = عادی, 1 = ویژه
  status: number; // 0 = غیرفعال, 1 = فعال
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
export interface CategoryAttributeWithValues {
  id: number;
  name: string;
  unit: string;
  values: { id: number; value: string }[];
}

export interface CategoryAttributeResponse {
  data: CategoryAttribute;
}

export interface CategoryAttributeListResponse {
  data: CategoryAttribute[];
  categoryAttribute_count: number;
  trash_count: number;
  status: boolean;
}

export type CategoryAttributeCreateInput = Omit<
  CategoryAttribute,
  "id" | "created_at" | "updated_at" | "deleted_at" | "category"
> & {
  category_id: number;
};

export type CategoryAttributeUpdateInput = Partial<
  Omit<CategoryAttributeCreateInput, "category_id">
> & {
  id: number;
  category_id?: number;
};
