"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { getImageUrl } from "@/app/helpers/image";
import { timeAgo } from "@/app/helpers/time";
import Image from "next/image";
import Link from "next/link";
import MessageInput from "./MessageInput";
import { getCsrfToken } from "@/app/lib/api/csrf";
import { getEcho } from "@/app/lib/echo";

interface Message {
  id: number;
  body: string;
  sent_at: string;
  read_at: string | null;
  sender_id: number;
  sender: { id: number; name: string; mobile: string };
  attachments: {
    id: number;
    file_path: string;
    file_name: string;
    mime_type: string;
  }[];
}

interface ChatWindowProps {
  conversationId: number;
  onBack?: () => void; // برای بازگشت به لیست در موبایل
}

function ChatWindow({ conversationId, onBack }: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<{
    id: number;
    name: string;
    mobile: string;
  } | null>(null);
  const [adTitle, setAdTitle] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);
  const lastMessageIdRef = useRef<number | null>(null);
  const [advertisementId, setAdvertisementId] = useState<number | null>(null);

  const initialScrollDoneRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat/conversations/${conversationId}`,
        { credentials: "include" },
      );
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        console.log("✅data =", data);
        console.log("✅data.messages =", data.messages);

        if (data.conversation) {
          const other = data.conversation.participants?.find(
            (p: any) => p.id !== user?.id,
          );

          setOtherUser(other || null);

          setAdTitle(data.conversation.advertisement?.title || "");

          setAdvertisementId(data.conversation.advertisement?.id ?? null);
        }
        await markAsRead();
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      const csrfToken = await getCsrfToken();
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat/conversations/${conversationId}/read`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "X-XSRF-TOKEN": csrfToken, // ✅ ارسال CSRF
          },
        },
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollButton(distanceFromBottom > 150);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    let channel: any;
    let echoRef: any;

    (async () => {
      const echo = await getEcho();
      echoRef = echo;
      channel = echo.private(`conversation.${conversationId}`);

      /*
    |--------------------------------------------------------------------------
    | Message Sent
    |--------------------------------------------------------------------------
    */
      channel.listen(".message.sent", (data: { message: Message }) => {
        const newMsg = data.message;

        /*
         * جلوگیری از duplicate
         */
        setMessages((prev) => {
          if (prev.some((message) => message.id === newMsg.id)) {
            return prev;
          }

          return [...prev, newMsg];
        });

        /*
         * اگر پیام طرف مقابل باشد،
         * conversation را read کن.
         */
        if (newMsg.sender_id !== user?.id) {
          markAsRead();
        }
      });

      /*
  |--------------------------------------------------------------------------
  | Messages Read
  |--------------------------------------------------------------------------
  */

      channel.listen(
        ".messages.read",
        (data: {
          conversation_id: number;
          read_at: string;
          reader_id: number;
        }) => {
          /*
           * فقط وقتی طرف مقابل پیام‌های ما را
           * خوانده، وضعیت پیام‌های خودمان را
           * به read تغییر بده.
           */
          if (data.reader_id !== user?.id) {
            setMessages((prev) =>
              prev.map((message) => {
                if (message.sender_id === user?.id && !message.read_at) {
                  return {
                    ...message,
                    read_at: data.read_at,
                  };
                }

                return message;
              }),
            );
          }
        },
      );
    })();

    /*
    |--------------------------------------------------------------------------
    | Cleanup
    |--------------------------------------------------------------------------
    */

    return () => {
      if (echoRef) {
        echoRef.leave(`conversation.${conversationId}`);
      }
    };
  }, [conversationId, user?.id]);

  // اسکرول به انتهای پیام‌ها
  useEffect(() => {
    initialScrollDoneRef.current = false;
  }, [conversationId]);

  useEffect(() => {
    if (loading) return;

    if (!initialScrollDoneRef.current) {
      // پرش فوری (بدون انیمیشن) به انتهای چت هنگام ورود
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      initialScrollDoneRef.current = true;
      lastMessageIdRef.current = messages.at(-1)?.id ?? null;
      return;
    }

    const lastId = messages.at(-1)?.id ?? null;
    if (lastId !== null && lastId !== lastMessageIdRef.current) {
      lastMessageIdRef.current = lastId;
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSendMessage = async (text: string, file?: File) => {
    if (!text.trim() && !file) return;
    setIsSending(true);
    try {
      const csrfToken = await getCsrfToken();
      const formData = new FormData();
      if (text.trim()) {
        formData.append("body", text.trim());
      }
      if (file) {
        formData.append("attachment", file);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat/conversations/${conversationId}/messages`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "X-XSRF-TOKEN": csrfToken,
            // Content-Type به‌طور خودکار برای FormData تنظیم می‌شود
          },
          body: formData,
        },
      );
      if (res.ok) {
        const newMsg = await res.json();
        setMessages((prev) => {
          if (prev.some((message) => message.id === newMsg.id)) {
            return prev;
          }
          return [...prev, newMsg];
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <i className="fa fa-spinner fa-spin text-3xl text-rose-600"></i>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* هدر مکالمه با نام کاربر بزرگ */}
      <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        {onBack && (
          <button
            onClick={onBack}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <i className="fa fa-arrow-right text-xl"></i>
          </button>
        )}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <i className="fa fa-user"></i>
          </div>
          <div>
            <p className="font-bold text-lg text-gray-900 dark:text-white">
              {otherUser?.name || otherUser?.mobile || "کاربر"}
            </p>
            {advertisementId && (
              <Link
                href={`/ads/${advertisementId}`}
                className="text-xs text-gray-400 hover:underline"
              >
                {adTitle}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* لیست پیام‌ها */}

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto p-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-400">
            <p>هنوز پیامی ارسال نشده است.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, index) => {
              const isMine = msg.sender_id === user?.id;
              const showDate =
                index === 0 ||
                new Date(msg.sent_at).toDateString() !==
                  new Date(messages[index - 1]?.sent_at).toDateString();

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="my-4 text-center text-xs text-gray-400">
                      {new Date(msg.sent_at).toLocaleDateString("fa-IR")}
                    </div>
                  )}
                  <div
                    className={`flex ${isMine ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isMine
                          ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                          : "bg-red-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                      }`}
                    >
                      {/* متن پیام */}
                      <p className="whitespace-pre-wrap wrap-break-word text-sm">
                        {msg.body}
                      </p>

                      {/* attachments */}
                      {msg.attachments?.map((att) => {
                        const imageUrl = getImageUrl(att.file_path);
                        return (
                          <div key={att.id} className="mt-1">
                            {att.mime_type.startsWith("image/") ? (
                              <div className="overflow-hidden rounded-lg bg-white p-1 dark:bg-gray-800">
                                <Image
                                  src={imageUrl}
                                  alt={att.file_name}
                                  width={200}
                                  height={200}
                                  className="max-h-48 w-auto rounded object-contain"
                                  unoptimized
                                  onError={(e) => {
                                    console.error("❌ Image load error:", {
                                      url: imageUrl,
                                      error: e,
                                    });
                                  }}
                                />
                              </div>
                            ) : (
                              <a
                                href={imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 underline"
                              >
                                {att.file_name}
                              </a>
                            )}
                          </div>
                        );
                      })}

                      {/* زمان و وضعیت خوانده شدن */}
                      <span className="mt-1 block text-right text-[10px] opacity-70">
                        {timeAgo(msg.sent_at)}
                        {isMine && msg.read_at && (
                            <i className="fa fa-check-double mr-1 text-green-300"></i>
                        //   <span className="inline-block  mr-1 text-green-300">✓✓</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
        {showScrollButton && (
          <div className="sticky bottom-0 flex justify-center pointer-events-none">
            <button
              onClick={scrollToBottom}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white shadow-lg transition hover:bg-rose-700"
              aria-label="برو به آخرین پیام"
            >
              <i className="fa fa-arrow-down"></i>
            </button>
          </div>
        )}
      </div>

      {/* ورودی پیام */}
      <MessageInput onSend={handleSendMessage} disabled={isSending} />
    </div>
  );
}
export default ChatWindow;
