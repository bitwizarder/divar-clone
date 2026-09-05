"use client";

import React, { useEffect, useState } from "react";
import LoginModal from "../../login/LoginModal";
import { useAuth } from "@/app/context/AuthContext";

interface FavoriteButtonProps {
  advertisementId: number;
}

function FavoriteButton({ advertisementId }: FavoriteButtonProps) {
  const { isAuthenticated, refetchUser } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingToggle, setPendingToggle] = useState(false);

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

  // بررسی وضعیت نشان‌شده فقط در صورت لاگین
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    const fetchFavoriteStatus = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/panel/favorites`,
          {
            credentials: "include",
          },
        );
        if (!res.ok) throw new Error("خطا در دریافت لیست نشان‌شده‌ها");
        const data = await res.json();
        const favorites = data.data || [];
        const found = favorites.some((fav: any) => fav.id === advertisementId);
        setIsFavorite(found);
      } catch (err) {
        setError(err instanceof Error ? err.message : "خطا");
      } finally {
        setLoading(false);
      }
    };
    fetchFavoriteStatus();
  }, [advertisementId, isAuthenticated]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      setPendingToggle(true);
      return;
    }

    try {
      setError(null);
      const csrf = await getCsrfToken();
      const method = isFavorite ? "DELETE" : "POST";
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/panel/favorites/${advertisementId}`;
      const res = await fetch(url, {
        method,
        headers: {
          "X-XSRF-TOKEN": csrf,
          Accept: "application/json",
        },
        credentials: "include",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "خطا در تغییر وضعیت نشان");
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا");
    } finally {
      setPendingToggle(false);
    }
  };

  const handleLoginSuccess = async () => {
    setShowLoginModal(false);
    await refetchUser();
    if (pendingToggle) {
      await toggleFavorite();
    }
    setPendingToggle(false);
  };

  if (loading) {
    return <i className="fa fa-bookmark-o text-2xl text-gray-400"></i>;
  }

  return (
    <>
      <button onClick={toggleFavorite} className="relative">
        <i
          className={`text-2xl ${
            isFavorite
              ? "fa fa-bookmark text-rose-700"
              : "fa-regular fa-bookmark"
          }`}
        ></i>
        {error && <span className="sr-only">{error}</span>}
      </button>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
}

export default FavoriteButton;
