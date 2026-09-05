/**
 * تبدیل عدد به فرمت فارسی (مثلاً ۱۲۳۴ -> ۱٬۲۳۴)
 */
export function toPersianNumber(num: number): string {
  return new Intl.NumberFormat("fa-IR").format(num);
}
