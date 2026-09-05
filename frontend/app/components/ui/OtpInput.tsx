// components/ui/OtpInput.tsx
"use client";

import React, { useRef, useState, useEffect, ClipboardEvent, KeyboardEvent } from "react";

interface OtpInputProps {
  length?: number; // تعداد رقم‌ها (پیش‌فرض ۶)
  value: string; // مقدار کل کد (برای مدیریت والد)
  onChange: (otp: string) => void; // وقتی کد کامل شد یا تغییری کرد
  disabled?: boolean;
  className?: string;
}

const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  disabled = false,
  className = "",
}) => {
  const [otpArray, setOtpArray] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // وقتی value از والد تغییر کند (مثلاً هنگام reset)، آرایه را به‌روز کن
  useEffect(() => {
    const newArray = value.split("").slice(0, length);
    const filled = [...newArray, ...new Array(length - newArray.length).fill("")];
    setOtpArray(filled);
  }, [value, length]);

  // فوکوس روی اولین input خالی یا آخرین مقدار
  const focusInput = (index: number) => {
    if (index >= 0 && index < length && inputRefs.current[index]) {
      inputRefs.current[index]?.focus();
    }
  };

  // مدیریت تغییر هر ورودی
  const handleChange = (index: number, digit: string) => {
    if (disabled) return;
    // فقط عدد پذیرفته شود
    if (!/^\d*$/.test(digit)) return;

    const newOtp = [...otpArray];
    // اگر کاراکتر بیشتر از یک رقم وارد شد (مثلاً paste)، فقط آخرین رقم را بگیر
    const lastDigit = digit.slice(-1);
    newOtp[index] = lastDigit;
    setOtpArray(newOtp);

    // مقدار کل را به والد ارسال کن
    const fullOtp = newOtp.join("");
    onChange(fullOtp);

    // اگر رقم وارد شد و آخرین خانه نبود، به خانه بعدی برو
    if (lastDigit && index < length - 1) {
      focusInput(index + 1);
    }
  };

  // مدیریت کلید Backspace
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otpArray];
      if (newOtp[index]) {
        // اگر خانه پر بود، خالی کن
        newOtp[index] = "";
        setOtpArray(newOtp);
        onChange(newOtp.join(""));
      } else if (index > 0) {
        // اگر خالی بود، به خانه قبلی برو و آن را خالی کن
        focusInput(index - 1);
        const prevOtp = [...newOtp];
        prevOtp[index - 1] = "";
        setOtpArray(prevOtp);
        onChange(prevOtp.join(""));
      }
    }
  };

  // مدیریت Paste (چسباندن کد کامل)
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    if (!/^\d*$/.test(pastedData)) return; // فقط عدد

    const newOtp = [...otpArray];
    for (let i = 0; i < pastedData.length; i++) {
      if (i < length) {
        newOtp[i] = pastedData[i];
      }
    }
    setOtpArray(newOtp);
    onChange(newOtp.join(""));

    // فوکوس به خانه بعد از آخرین رقم چسبانده شده
    const nextIndex = Math.min(pastedData.length, length - 1);
    focusInput(nextIndex);
  };

  // کلیک روی هر باکس، فوکوس همان باکس
  const handleFocus = (index: number) => {
    focusInput(index);
  };

  return (
    <div className={`flex justify-center gap-3 rtl:flex-row-reverse ${className}`}>
      {otpArray.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={`
            w-12 h-14 text-center text-xl font-bold rounded-xl border-2 
            focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500
            transition-all duration-200
            ${digit ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20" : "border-gray-300 dark:border-gray-600"}
            ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-rose-400"}
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            shadow-sm
          `}
          aria-label={`رقم ${index + 1} از ${length}`}
        />
      ))}
    </div>
  );
};

export default OtpInput;