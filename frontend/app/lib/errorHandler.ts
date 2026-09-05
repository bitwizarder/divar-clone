/**
 * تبدیل خطاهای مختلف به پیام‌های فارسی کاربرپسند
 */
export function getFriendlyErrorMessage(error: unknown): string {
  // اگر error از نوع Error نباشد
  if (!(error instanceof Error)) {
    return "خطای ناشناخته‌ای رخ داده است.";
  }

  const message = error.message.toLowerCase();

  // ===== خطاهای شبکه و اتصال =====
  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("failed to fetch") ||
    message.includes("connection") ||
    message.includes("getaddrinfo") ||
    message.includes("smtp") ||
    message.includes("timeout") ||
    message.includes("could not establish")
  ) {
    return "خطا در ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید.";
  }

  // ===== خطاهای جاوااسکریپت =====
  if (
    message.includes("cannot read properties of undefined") ||
    message.includes("undefined is not an object") ||
    message.includes("is not defined")
  ) {
    return "خطا در پردازش اطلاعات. لطفاً صفحه را رفرش کنید.";
  }

  if (message.includes("cannot read properties of null")) {
    return "اطلاعات مورد نظر وجود ندارد. لطفاً دوباره تلاش کنید.";
  }

  // ===== خطاهای احراز هویت =====
  if (message.includes("401") || message.includes("unauthorized")) {
    return "شما اجازه دسترسی به این بخش را ندارید. لطفاً وارد حساب خود شوید.";
  }

  if (message.includes("403") || message.includes("forbidden")) {
    return "شما دسترسی لازم برای این عملیات را ندارید.";
  }

  // ===== خطاهای CSRF =====
  if (
    message.includes("419") ||
    message.includes("csrf") ||
    message.includes("token mismatch")
  ) {
    return "نشست شما منقضی شده است. لطفاً صفحه را رفرش کرده و دوباره تلاش کنید.";
  }

  // ===== خطاهای اعتبارسنجی (۴۲۲) =====
  if (message.includes("422") || message.includes("validation")) {
    return "اطلاعات وارد شده معتبر نیست. لطفاً دوباره بررسی کنید.";
  }

  // ===== خطاهای ۴۰۴ =====
  if (message.includes("404") || message.includes("not found")) {
    return "مورد مورد نظر یافت نشد. ممکن است حذف شده باشد.";
  }

  // ===== خطاهای ۵۰۰ =====
  if (message.includes("500") || message.includes("server error")) {
    return "خطای داخلی سرور رخ داده است. لطفاً بعداً تلاش کنید.";
  }

  // ===== خطاهای مربوط به ایمیل/موبایل =====
  if (message.includes("email") || message.includes("mobile")) {
    return "شماره موبایل یا ایمیل وارد شده معتبر نیست.";
  }

  if (message.includes("otp") || message.includes("code")) {
    return "کد تایید نامعتبر یا منقضی شده است.";
  }

  // ===== خطاهای عمومی =====
  if (message.includes("too many requests")) {
    return "درخواست‌های زیادی ارسال کرده‌اید. لطفاً چند لحظه صبر کنید.";
  }

  // ===== پیام پیش‌فرض =====
  return "خطایی رخ داده است. لطفاً دوباره تلاش کنید.";
}
