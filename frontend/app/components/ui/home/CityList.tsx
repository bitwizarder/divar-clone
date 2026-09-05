import { City } from "@/app/types/city";

export async function fetchCities(): Promise<City[] | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cities`,
      {
        headers: { Accept: "application/json" },
        cache: "no-cache",
      },
    );

    if (!res.ok) {
      throw new Error(`خطا در دریافت محله‌ها: ${res.status}`);
    }

    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching cities:", error);
    return null;
  }
}
