import { getFriendlyErrorMessage } from "./errorHandler";

// ================================================================
// 1. دریافت CSRF Token از کوکی
// ================================================================

/**
 * دریافت توکن CSRF از کوکی XSRF-TOKEN
 * (این توکن پس از درخواست به /sanctum/csrf-cookie در کوکی ذخیره می‌شود)
 */
export function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;

  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="));

  if (!cookie) return null;

  const token = cookie.split("=")[1];
  return token ? decodeURIComponent(token) : null;
}

// ================================================================
// 2. کلاینت اصلی
// ================================================================

interface ApiClientOptions extends RequestInit {
  withCsrf?: boolean;
  isFormData?: boolean;
  friendlyErrors?: boolean;
}

/**
 * کلاینت اصلی برای درخواست‌های سمت کلاینت
 */
export async function apiClient<T = any>(
  url: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const {
    withCsrf = true,
    isFormData = false,
    friendlyErrors = true,
    headers = {},
    ...restOptions
  } = options;

  // 1. تنظیم هدرهای پایه
  const baseHeaders: Record<string, string> = {
    Accept: "application/json",
  };

  // 2. اضافه کردن CSRF Token (در صورت نیاز)
  if (withCsrf) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      baseHeaders["X-XSRF-TOKEN"] = csrfToken;
      baseHeaders["X-Requested-With"] = "XMLHttpRequest";
    }
  }

  // 3. تنظیم Content-Type (اگر FormData نباشد)
  // ✅ اصلاح: تبدیل headers به Record و بررسی وجود Content-Type
  const headersRecord = headers as Record<string, string>;
  if (!isFormData && !headersRecord["Content-Type"]) {
    baseHeaders["Content-Type"] = "application/json";
  }

  // 4. ترکیب هدرها
  const finalHeaders = { ...baseHeaders, ...headersRecord };

  // 5. ساخت body (تبدیل JSON به string)
  let body = restOptions.body;
  if (!isFormData && body && typeof body === "object") {
    body = JSON.stringify(body);
  }

  // 6. ارسال درخواست
  try {
    const response = await fetch(url, {
      ...restOptions,
      headers: finalHeaders,
      body,
      credentials: "include",
    });

    // 7. پردازش پاسخ
    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    // 7a. اگر پاسخ ناموفق بود
    if (!response.ok) {
      let errorMessage = response.statusText;

      if (isJson) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } else {
        const text = await response.text();
        errorMessage = text || errorMessage;
      }

      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }

    // 7b. پاسخ موفق
    if (!isJson) {
      return (await response.text()) as T;
    }

    return await response.json();
  } catch (error) {
    // 8. تبدیل خطا به فارسی (در صورت فعال بودن)
    if (friendlyErrors) {
      throw new Error(getFriendlyErrorMessage(error));
    }
    throw error;
  }
}

// ================================================================
// 3. توابع کمکی برای متدهای HTTP
// ================================================================

export async function apiGet<T = any>(url: string): Promise<T> {
  return apiClient<T>(url, { method: "GET" });
}

export async function apiPost<T = any>(url: string, data?: any): Promise<T> {
  return apiClient<T>(url, {
    method: "POST",
    body: data,
  });
}

export async function apiPostForm<T = any>(
  url: string,
  formData: FormData,
): Promise<T> {
  return apiClient<T>(url, {
    method: "POST",
    body: formData,
    isFormData: true,
  });
}

export async function apiPut<T = any>(url: string, data?: any): Promise<T> {
  return apiClient<T>(url, {
    method: "PUT",
    body: data,
  });
}

export async function apiPutForm<T = any>(
  url: string,
  formData: FormData,
): Promise<T> {
  return apiClient<T>(url, {
    method: "PUT",
    body: formData,
    isFormData: true,
  });
}

export async function apiDelete<T = any>(url: string): Promise<T> {
  return apiClient<T>(url, { method: "DELETE" });
}

export async function apiPatch<T = any>(url: string, data?: any): Promise<T> {
  return apiClient<T>(url, {
    method: "PATCH",
    body: data,
  });
}

// ================================================================
// 4. تابع کمکی برای دریافت CSRF Token در کلاینت
// ================================================================

export async function fetchCsrfCookie(): Promise<void> {
  await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sanctum/csrf-cookie`, {
    method: "GET",
    credentials: "include",
  });
}
