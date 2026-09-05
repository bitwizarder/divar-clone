export interface SiteSettings {
  title: string | null;
  description: string | null;
  logo: string | null;
  favicon: string | null;
  email: string | null;
  phone: string | null;
  keywords: string | null;
}

export async function fetchSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/settings`,
      {
        headers: { Accept: "application/json" },
        cache: "no-cache", // می‌توانید cache: 'force-cache' برای کش کردن استفاده کنید
      },
    );
    if (!res.ok) {
      // در صورت خطا، مقادیر پیش‌فرض برگردان
      return {
        title: "سایت من",
        description: "توضیحات پیش‌فرض",
        logo: null,
        favicon: null,
        email: null,
        phone: null,
        keywords: null,
      };
    }
    const data = await res.json();
    return data.data;
  } catch {
    return {
      title: "سایت من",
      description: "توضیحات پیش‌فرض",
      logo: null,
      favicon: null,
      email: null,
      phone: null,
      keywords: null,
    };
  }
}
