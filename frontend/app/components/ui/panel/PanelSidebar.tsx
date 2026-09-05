"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";
import { useSettings } from "@/app/context/SettingsContext";
import Settings from "react-multi-date-picker/plugins/settings";
import { getImageUrl } from "@/app/helpers/image";

interface PanelSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function PanelSidebar({ isOpen, onClose }: PanelSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const settings  = useSettings();

  const menuItems = [
    { icon: "fa-home", label: "داشبورد", href: "/panel" },
    { icon: "fa-list", label: "آگهی‌های من", href: "/panel/advertisements" },
    {
      icon: "fa-plus",
      label: "آگهی جدید",
      href: "/panel/advertisements/create",
    },
    { icon: "fa-comment", label: "چت", href: "/panel/chat" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* سایه برای موبایل */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* نوار کناری */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-72 flex-col border-l border-gray-200 bg-white transition-transform duration-300 dark:border-gray-700 dark:bg-gray-800 lg:relative lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* لوگو و نام کاربر */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={getImageUrl(settings.logo)}
              alt="لوگو"
              width={40}
              height={40}
              className="h-10 w-auto object-contain"
            />
          </Link>
          <span className="text-lg font-bold text-rose-700 dark:text-rose-500">
            پنل کاربری
          </span>
        </div>

        {/* اطلاعات کاربر */}
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">
            {user?.name || user?.mobile || "کاربر"}
          </p>
          {user?.email && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
          )}
          {user?.mobile && !user?.email && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user.mobile}
            </p>
          )}
        </div>

        {/* منو */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => onClose()}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  <i className={`fa ${item.icon} w-5 text-center`}></i>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* دکمه خروج در پایین */}
        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          <button
            onClick={() => {
              // logout از AuthContext
              window.location.href = "/";
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <i className="fa fa-sign-out-alt w-5 text-center"></i>
            خروج
          </button>
        </div>
      </aside>
    </>
  );
}

export default PanelSidebar;
