import { Category } from "@/app/types/category";

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`,
      {
        headers: { Accept: "application/json" },
        cache: "no-cache",
      }
    );

    if (!res.ok) {
      console.error(`خطا در دریافت دسته‌بندی‌ها: ${res.status}`);
      return [];
    }

    const data = await res.json();
    // console.log("📦 پاسخ API دسته‌بندی‌ها:", data);
    if (data && Array.isArray(data.data)) {
      return data.data;
    }

    // console.warn("پاسخ API دسته‌بندی‌ها آرایه نیست:", data);
    return [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}