// helpers/time.ts
export function timeAgo(dateString: string | null): string {
  if (!dateString) return "لحظاتی پیش";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "لحظاتی پیش";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  // کمتر از ۱ دقیقه
  if (diffMin < 1) return "لحظاتی پیش";

  // کمتر از ۱ ساعت
  if (diffHour < 1) return `${diffMin} دقیقه پیش`;

  // کمتر از ۲۴ ساعت (امروز)
  if (diffDay < 1) return "امروز";

  // کمتر از ۷ روز (۱ هفته)
  if (diffWeek < 1) return `${diffDay} روز پیش`;

  // کمتر از ۳۰ روز (۱ ماه)
  if (diffMonth < 1) {
    if (diffWeek === 1) return "۱ هفته پیش";
    return `${diffWeek} هفته پیش`;
  }

  // کمتر از ۳۶۵ روز (۱ سال)
  if (diffYear < 1) {
    if (diffMonth === 1) return "۱ ماه پیش";
    return `${diffMonth} ماه پیش`;
  }

  // یک سال یا بیشتر
  if (diffYear === 1) return "۱ سال پیش";
  return `${diffYear} سال پیش`;
}