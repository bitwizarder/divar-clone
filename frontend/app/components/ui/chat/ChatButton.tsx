"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getCsrfToken } from "@/app/lib/api/csrf";

interface ChatButtonProps {
  advertisementId: number;
}

function ChatButton({ advertisementId }: ChatButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);



  const startChat = async () => {
    setLoading(true);
    try {
      // ۱. دریافت CSRF Token
      const csrfToken = await getCsrfToken();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-XSRF-TOKEN": csrfToken, // ✅ اضافه کردن هدر CSRF
          },
          credentials: "include",
          body: JSON.stringify({ advertisement_id: advertisementId }),
        },
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "خطا در شروع مکالمه");
      }

      const conv = await res.json();
      router.push(`/panel/chat?conversation=${conv.id}`);
    } catch (error) {
      console.error("Error starting chat:", error);
      alert(error instanceof Error ? error.message : "خطا در شروع مکالمه");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={startChat}
      disabled={loading}
      className="min-w-32 bg-gray-200 border border-gray-300 hover:bg-gray-300/90 text-zinc-900 w-full py-2 rounded disabled:opacity-50 transition"
    >
      {loading ? (
        <>
          <i className="fa fa-spinner fa-spin ml-1"></i>
          در حال اتصال...
        </>
      ) : (
        "چت"
      )}
    </button>
  );
}

export default ChatButton;
