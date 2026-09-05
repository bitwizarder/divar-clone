/**
 * تبدیل تاریخ ISO به فرمت شمسی (فارسی)
 * @param dateString - تاریخ به صورت رشته (مثلاً '2026-08-12T10:30:00') یا null/undefined
 * @param format - (اختیاری) شیء تنظیمات DateTimeFormat
 * @returns تاریخ شمسی به صورت رشته، یا '-' در صورت نامعتبر بودن
 */
export function converterToJalali(
  dateString: string | null | undefined, // ✅ تغییر نوع
  format: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  },
): string {
  // ۱. اگر مقدار falsy باشد (null, undefined, '', 0, false)
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);

    // ۲. اگر تاریخ معتبر نباشد
    if (isNaN(date.getTime())) return "-";

    // ۳. تبدیل موفق
    return new Intl.DateTimeFormat("fa-IR", format).format(date);
  } catch {
    // ۴. هر خطای غیرمنتظره
    return "-";
  }
}

// سایر توابع هم نیازی به تغییر ندارند، چون از converterToJalali استفاده می‌کنند
export function toPersianDateTime(
  dateString: string | null | undefined,
): string {
  return converterToJalali(dateString, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function toPersianDateShort(
  dateString: string | null | undefined,
): string {
  return converterToJalali(dateString, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
