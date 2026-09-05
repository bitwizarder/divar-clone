export async function getCsrfToken(): Promise<string> {
  // ابتدا کوکی CSRF را از سرور دریافت کن (اگر قبلاً دریافت نشده باشد)
  await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sanctum/csrf-cookie`, {
    method: "GET",
    credentials: "include",
  });

  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="))
    ?.split("=")[1];

  if (!token) throw new Error("CSRF token یافت نشد");
  return decodeURIComponent(token);
}