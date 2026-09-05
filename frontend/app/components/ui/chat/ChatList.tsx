"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { useAuth } from "@/app/context/AuthContext";
import { getImageUrl } from "@/app/helpers/image";
import { timeAgo } from "@/app/helpers/time";
import { getEcho } from "@/app/lib/echo";
import { Message } from "@/app/types/message";

interface Conversation {
  id: number;

  participants: {
    id: number;
    name: string;
    mobile: string;
  }[];

  advertisement: {
    id: number;
    title: string;
    image: any;
  };

  last_message: {
    body: string;
    sent_at: string;
    sender_id: number;
  } | null;

  last_message_at: string;

  unread_count: number;
}

interface ChatListProps {
  selectedId: number | null;

  onSelect: (id: number) => void;
}

function ChatList({ selectedId, onSelect }: ChatListProps) {
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [loading, setLoading] = useState(true);

  const selectedIdRef = useRef<number | null>(selectedId);
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);
  /*
  |--------------------------------------------------------------------------
  | دریافت لیست مکالمات
  |--------------------------------------------------------------------------
  */

  const fetchConversations = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat/conversations`,
        {
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!res.ok) {
        return;
      }

      const data = await res.json();

      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Initial Fetch
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchConversations();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Realtime User Channel
  |--------------------------------------------------------------------------
  |
  | فقط یک channel برای کل ChatList داریم.
  |
  */

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    let cancelled = false;
    let echoRef: any;
    const channelName = `user.${user.id}`;

    (async () => {
      const echo = await getEcho();

      // اگر تا این لحظه effect (توسط StrictMode یا unmount واقعی) cleanup شده، کاری نکن
      if (cancelled) return;

      echoRef = echo;

      // هر channel قبلی با همین اسم رو (اگر مونده باشه) پاک کن تا listener تکراری نمونه
      echo.leave(channelName);

      const channel = echo.private(channelName);

      channel.listen(".message.sent", (data: { message: Message }) => {
        const message = data.message;

        if (message.sender_id === user.id) {
          return;
        }

        setConversations((prev) => {
          const conversationIndex = prev.findIndex(
            (conversation) => conversation.id === message.conversation_id,
          );

          if (conversationIndex === -1) {
            return prev;
          }

          const conversation = prev[conversationIndex];

          const isCurrentConversation =
            selectedIdRef.current === message.conversation_id;

          const updatedConversation: Conversation = {
            ...conversation,
            last_message: {
              body: message.body,
              sent_at: message.sent_at,
              sender_id: message.sender_id,
            },
            last_message_at: message.sent_at,
            unread_count: isCurrentConversation
              ? 0
              : conversation.unread_count + 1,
          };

          const newList = prev.filter(
            (_, index) => index !== conversationIndex,
          );

          return [updatedConversation, ...newList];
        });
      });
    })();

    return () => {
      cancelled = true;
      if (echoRef) {
        echoRef.leave(channelName);
      }
    };
  }, [user?.id]);

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <i className="fa fa-spinner fa-spin text-rose-600"></i>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Empty
  |--------------------------------------------------------------------------
  */

  if (conversations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-gray-500">
        <i className="fa fa-inbox text-4xl"></i>

        <p className="mt-4">هیچ مکالمه‌ای ندارید</p>

        <p className="text-sm">برای شروع، روی دکمه چت در آگهی‌ها کلیک کنید.</p>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="h-full overflow-y-auto">
      {conversations.map((conv) => {
        const otherUser = conv.participants.find(
          (participant) => participant.id !== user?.id,
        );

        const lastMsg = conv.last_message;

        const isUnread = conv.unread_count > 0;

        const adTitle = conv.advertisement?.title || "بدون عنوان";

        const imageSrc = conv.advertisement?.image?.indexArray?.small
          ? getImageUrl(conv.advertisement.image.indexArray.small)
          : null;

        return (
          <div
            key={conv.id}
            className={`
                group
                cursor-pointer
                border-b
                border-gray-100
                px-4
                py-3
                transition
                hover:bg-gray-50
                dark:border-gray-700
                dark:hover:bg-gray-700

                ${
                  selectedId === conv.id ? "bg-rose-50 dark:bg-rose-900/20" : ""
                }
              `}
            onClick={() => {
              /*
               * وقتی کاربر وارد conversation می‌شود،
               * شمارنده همان conversation فوراً صفر شود.
               */
              setConversations((prev) =>
                prev.map((conversation) =>
                  conversation.id === conv.id
                    ? {
                        ...conversation,
                        unread_count: 0,
                      }
                    : conversation,
                ),
              );

              onSelect(conv.id);
            }}
          >
            <div className="flex items-center gap-3">
              {/* تصویر */}
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-200">
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={adTitle}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-rose-100 text-rose-600">
                    <i className="fa fa-image text-xl"></i>
                  </div>
                )}
              </div>

              {/* اطلاعات */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate font-semibold text-gray-800 dark:text-white">
                    {adTitle}
                  </p>

                  {lastMsg && (
                    <span className="text-xs text-gray-400">
                      {timeAgo(lastMsg.sent_at)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                    {otherUser?.name || otherUser?.mobile || "کاربر"}
                  </p>

                  {isUnread && (
                    <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white">
                      {conv.unread_count}
                    </span>
                  )}
                </div>

                <p className="mt-1 truncate text-xs text-gray-400 dark:text-gray-500">
                  {lastMsg?.body || "شروع مکالمه"}
                </p>
              </div>

              {/* لینک آگهی */}
              <Link
                href={`/ads/${conv.advertisement?.id}`}
                target="_blank"
                className="text-gray-400 opacity-0 hover:text-rose-600 group-hover:opacity-100 dark:hover:text-rose-400"
                onClick={(event) => event.stopPropagation()}
              >
                <i className="fa fa-external-link-alt"></i>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ChatList;
