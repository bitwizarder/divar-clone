// hooks/useTimeout.ts
import { useEffect, useRef } from "react";

/**
 * هوک برای اجرای یک تابع با تاخیر مشخص
 * @param callback - تابعی که بعد از تاخیر اجرا می‌شود
 * @param delay - تاخیر به میلی‌ثانیه (اگر null باشد، تایمر اجرا نمی‌شود)
 */
export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  // ذخیره آخرین callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // مدیریت تایمر
  useEffect(() => {
    if (delay === null) return;

    const id = setTimeout(() => savedCallback.current(), delay);

    return () => clearTimeout(id);
  }, [delay]);
}
