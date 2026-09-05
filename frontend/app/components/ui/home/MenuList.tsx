import { Menu } from "@/app/types/menu";

// تابع دریافت داده (فقط داده برمی‌گرداند)
async function fetchMenus(): Promise<Menu[] | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/menus`,
      {
        headers: { Accept: "application/json" },
        cache: "no-cache",
      },
    );

    if (!res.ok) {
      throw new Error(`خطا در دریافت منوها: ${res.status}`);
    }

    const data = await res.json();
    return data.data || []; // فرض بر این است که پاسخ شامل کلید data است
  } catch (error) {
    console.error("Error fetching menus:", error);
    return null;
  }
}

// کامپوننت اصلی (Server Component)
async function MenuList() {
  const menus = await fetchMenus();

  // مدیریت خطا
  if (menus === null) {
    return (
      <div className="text-red-500 p-4 text-center">
        خطا در دریافت منوها. لطفاً مجدداً تلاش کنید.
      </div>
    );
  }

  // حالت خالی
  if (menus.length === 0) {
    return (
      <div className="text-gray-500 p-4 text-center">هیچ منویی یافت نشد.</div>
    );
  }

  // نمایش لیست با استفاده از داده‌ها
  return (
    <>
      {menus.map((menu: Menu, index) => (
        <li key={index}>
          <a href="#">{menu.title}</a>
        </li>
      ))}
    </>
  );
}

export default MenuList;
