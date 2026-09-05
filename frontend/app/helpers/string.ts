/**
 * کوتاه‌کردن متن با سه‌نقطه
 * @param text - متن ورودی
 * @param maxLength - حداکثر طول مجاز
 * @returns متن کوتاه‌شده یا خود متن
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (!text) return "-";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}