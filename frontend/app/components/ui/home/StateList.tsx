import { State } from "@/app/types/state";

export async function fetchStates(): Promise<State[] | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/states`,
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
    console.error("Error fetching states:", error);
    return null;
  }
}
