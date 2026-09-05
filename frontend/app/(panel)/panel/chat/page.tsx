"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import ChatList from "@/app/components/ui/chat/ChatList";
import ChatWindow from "@/app/components/ui/chat/ChatWindow";

function ChatPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversation");
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(conversationId ? Number(conversationId) : null);
  const [showMobileList, setShowMobileList] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/auth/login-register?redirect=/panel/chat");
    }
  }, [user, router]);

  useEffect(() => {
    if (selectedConversationId) {
      setShowMobileList(false);
    } else {
      setShowMobileList(true);
    }
  }, [selectedConversationId]);

  // ✅ همگام‌سازی state با پارامتر URL (هم برای رفرش، هم back/forward مرورگر)
  useEffect(() => {
    setSelectedConversationId(conversationId ? Number(conversationId) : null);
  }, [conversationId]);

  // ✅ انتخاب مکالمه را در URL هم ثبت می‌کند
  const handleSelectConversation = (id: number) => {
    setSelectedConversationId(id);
    router.replace(`/panel/chat?conversation=${id}`, { scroll: false });
  };

  const handleBackToList = () => {
    setShowMobileList(true);
    setSelectedConversationId(null);
    router.replace("/panel/chat", { scroll: false });
  };

  if (!user) return null;

  return (
    <div className="flex h-[calc(100vh-120px)] min-h-125 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div
        className={`${
          showMobileList ? "w-full" : "hidden lg:block"
        } lg:w-80 lg:max-w-sm border-l border-gray-200 dark:border-gray-700 shrink-0`}
      >
        <ChatList
          selectedId={selectedConversationId}
          onSelect={handleSelectConversation}
        />
      </div>

      <div
        className={`flex-1 ${
          !showMobileList ? "flex" : "hidden lg:flex"
        } flex-col`}
      >
        {selectedConversationId ? (
          <ChatWindow
            conversationId={selectedConversationId}
            onBack={handleBackToList}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <div className="text-center">
              <i className="fa fa-comments text-6xl"></i>
              <p className="mt-4">یک مکالمه را انتخاب کنید</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatPage;
