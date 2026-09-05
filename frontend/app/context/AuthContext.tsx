"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation"; // اضافه کنید

interface User {
  id: number;
  name?: string;
  email?: string;
  mobile?: string;
  user_type?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  refetchUser: () => Promise<void>;
  sendOtp: (identifier: string) => Promise<{ token: string }>;
  login: (identifier: string, otp: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ---- توابع کمکی ----
  const getCsrfToken = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/sanctum/csrf-cookie`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    if (!res.ok) throw new Error("خطا در دریافت CSRF token");
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("XSRF-TOKEN="))
      ?.split("=")[1];
    if (!token) throw new Error("CSRF token موجود نیست");
    return decodeURIComponent(token);
  };

  const fetchUser = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user`,
        {
          credentials: "include",
          headers: { Accept: "application/json" },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ---- بارگذاری اولیه ----
  useEffect(() => {
    fetchUser();
  }, []);

  // ---- به‌روزرسانی کاربر ----
  const refetchUser = async () => {
    setLoading(true);
    await fetchUser();
  };

  // ---- متد ارسال OTP (جدید) ----
  const sendOtp = async (identifier: string) => {
    const csrf = await getCsrfToken();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/send-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrf,
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ identifier }),
      },
    );

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "خطا در ارسال کد تایید");
    }

    return { token: data.token };
  };

  // ---- متد لاگین ----
  const login = async (identifier: string, otp: string, token: string) => {
    const csrf = await getCsrfToken();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/verify-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrf,
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ identifier, otp, token }),
      },
    );

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "خطا در تأیید کد");
    }

    await refetchUser();
  };

  // ---- متد لاگ‌اوت ----
  const logout = async () => {
    const csrf = await getCsrfToken();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/logout`,
      {
        method: "POST",
        headers: {
          "X-XSRF-TOKEN": csrf,
          Accept: "application/json",
        },
        credentials: "include",
      },
    );

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "خطا در خروج از حساب");
    }

    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        refetchUser,
        sendOtp,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
