"use client";

import React, { useEffect, useState } from "react";
import LoginModal from "../../login/LoginModal";
import { useAuth } from "@/app/context/AuthContext";

interface NoteSectionProps {
  advertisementId: number;
}

function NoteSection({ advertisementId }: NoteSectionProps) {
  const { isAuthenticated, refetchUser } = useAuth();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"save" | "delete" | null>(
    null,
  );

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

  // بارگذاری یادداشت فقط در صورت لاگین بودن
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    const fetchNote = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/panel/advertise/notes/show/${advertisementId}`,
          { credentials: "include" },
        );
        if (res.status === 404) {
          setNote("");
          setError(null);
        } else if (res.ok) {
          const data = await res.json();
          setNote(data.data?.note || "");
          setError(null);
        } else {
          throw new Error("خطا در دریافت یادداشت");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "خطا");
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [advertisementId, isAuthenticated]);

  // عملیات ذخیره یا حذف
  const performAction = async (action: "save" | "delete") => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      setPendingAction(action);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const csrf = await getCsrfToken();

      if (action === "delete") {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/panel/advertise/notes/destroy/${advertisementId}`,
          {
            method: "DELETE",
            headers: {
              "X-XSRF-TOKEN": csrf,
              Accept: "application/json",
            },
            credentials: "include",
          },
        );
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "خطا در حذف یادداشت");
        }
        setNote("");
        setSuccess("یادداشت حذف شد");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        // ذخیره
        if (!note.trim()) {
          // اگر خالی است، حذف کن
          await performAction("delete");
          return;
        }
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/panel/advertise/notes/store/${advertisementId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-XSRF-TOKEN": csrf,
              Accept: "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ note: note.trim() }),
          },
        );
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "خطا در ذخیره یادداشت");
        }
        setSuccess("یادداشت ذخیره شد");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا");
    } finally {
      setSaving(false);
      setPendingAction(null);
    }
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      setPendingAction("save");
      return;
    }
    performAction("save");
  };

  const handleDelete = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      setPendingAction("delete");
      return;
    }
    performAction("delete");
  };

  // بعد از لاگین موفق، عملیات معلق را اجرا کن
  const handleLoginSuccess = async () => {
    setShowLoginModal(false);
    await refetchUser();
    if (pendingAction) {
      await performAction(pendingAction);
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-500">در حال بارگذاری یادداشت...</div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <div>
          <textarea
            rows={5}
            className="w-full resize-none rounded border border-gray-300 p-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="یادداشت شما..."
            disabled={saving || !isAuthenticated}
          />
        </div>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 bg-rose-600 text-white rounded text-sm hover:bg-rose-700 disabled:opacity-50"
          >
            {saving ? "در حال ذخیره..." : "ذخیره یادداشت"}
          </button>
          {note && (
            <button
              onClick={handleDelete}
              disabled={saving}
              className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 disabled:opacity-50"
            >
              حذف یادداشت
            </button>
          )}
          {error && <span className="text-red-500 text-sm">{error}</span>}
          {success && <span className="text-green-600 text-sm">{success}</span>}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          یادداشت تنها برای شما قابل دیدن است و پس از حذف آگهی، پاک خواهد شد.
        </p>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
}

export default NoteSection;
