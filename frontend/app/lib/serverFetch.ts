import { cookies } from "next/headers";

interface ServerFetchOptions extends RequestInit {
  // می‌توانید گزینه‌های سفارشی اضافه کنید
}

/**
 * تابع fetch مخصوص سمت سرور با ارسال خودکار کوکی‌ها و هدرهای موردنیاز
 */
export async function serverFetch(
  url: string,
  options: ServerFetchOptions = {},
): Promise<Response> {
  // دریافت کوکی‌ها از درخواست فعلی
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  // هدرهای پایه
  const headers: Record<string, string> = {
    Accept: "application/json",
    Cookie: cookieHeader,
    Referer: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    Origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  };

  // اضافه کردن هدرهای سفارشی از options (در صورت وجود)
  if (options.headers) {
    const customHeaders = options.headers as Record<string, string>;
    Object.keys(customHeaders).forEach((key) => {
      headers[key] = customHeaders[key];
    });
  }

  // تنظیم Content-Type اگر تنظیم نشده باشد و body FormData نباشد
  const hasContentType = Object.keys(headers).some(
    (key) => key.toLowerCase() === "content-type",
  );
  if (!hasContentType && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // لاگ برای دیباگ (اختیاری - در محیط توسعه)
  if (process.env.NODE_ENV === "development") {
    console.log(`[serverFetch] ${options.method || "GET"} ${url}`);
  }

  return fetch(url, {
    ...options,
    headers,
    cache: options.cache || "no-cache",
  });
}

/**
 * تابع کمکی برای GET
 */
export async function serverGet<T = any>(url: string): Promise<T> {
  const res = await serverFetch(url);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Server fetch failed: ${res.status} - ${errorText}`);
  }
  return res.json();
}

/**
 * تابع کمکی برای POST (با FormData یا JSON)
 */
export async function serverPost<T = any>(
  url: string,
  body: any,
  isFormData: boolean = false,
): Promise<T> {
  const options: RequestInit = {
    method: "POST",
  };

  if (isFormData) {
    options.body = body as FormData;
    // Content-Type توسط مرورگر برای FormData خودکار تنظیم می‌شود
  } else {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(body);
  }

  const res = await serverFetch(url, options);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Server fetch failed: ${res.status} - ${errorText}`);
  }
  return res.json();
}

/**
 * تابع کمکی برای PUT
 */
export async function serverPut<T = any>(
  url: string,
  body: any,
  isFormData: boolean = false,
): Promise<T> {
  const options: RequestInit = {
    method: "PUT",
  };

  if (isFormData) {
    options.body = body as FormData;
  } else {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(body);
  }

  const res = await serverFetch(url, options);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Server fetch failed: ${res.status} - ${errorText}`);
  }
  return res.json();
}

/**
 * تابع کمکی برای DELETE
 */
export async function serverDelete<T = any>(url: string): Promise<T> {
  const res = await serverFetch(url, { method: "DELETE" });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Server fetch failed: ${res.status} - ${errorText}`);
  }
  return res.json();
}
