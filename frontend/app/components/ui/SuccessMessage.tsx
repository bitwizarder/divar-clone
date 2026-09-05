"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// نوع داده برای نگاشت پارامتر به پیام
type SuccessMessages = Record<string, string>;

interface SuccessMessageProps {
  messages: SuccessMessages; // نقشه‌ی پارامترها به پیام‌ها
  duration?: number; // مدت زمان نمایش (میلی‌ثانیه) - پیش‌فرض ۵۰۰۰
  className?: string; // کلاس‌های اضافی
}

export default function SuccessMessage({
  messages,
  duration = 5000,
  className = "",
}: SuccessMessageProps) {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // پیدا کردن اولین پارامتری که در messages وجود دارد
    let foundKey: string | null = null;
    let foundMessage: string | null = null;

    for (const [key, value] of searchParams.entries()) {
      if (messages[key] && value === "1") {
        foundKey = key;
        foundMessage = messages[key];
        break;
      }
    }

    if (foundMessage) {
      setMessage(foundMessage);

      const timer = setTimeout(() => {
        setMessage(null);
        // پاک کردن پارامتر از URL
        const url = new URL(window.location.href);
        if (foundKey) {
          url.searchParams.delete(foundKey);
          window.history.replaceState({}, "", url.toString());
        }
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [searchParams, messages, duration]);

  if (!message) return null;

  return (
    <div
      className={`text-green-500 dark:text-green-400 
        text-sm mb-4 p-4 bg-green-100 dark:bg-green-100/10 border border-green-400 dark:border-green-400/20 rounded-md ${className}`}
    >
      <p>{message}</p>
    </div>
  );
}
