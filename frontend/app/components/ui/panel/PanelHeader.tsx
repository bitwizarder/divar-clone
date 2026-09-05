"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

interface PanelHeaderProps {
  onMenuClick: () => void;
}

function PanelHeader({ onMenuClick }: PanelHeaderProps) {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 lg:hidden"
          >
            <i className="fa fa-bars text-xl"></i>
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
            پنل کاربری
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {user?.name || user?.mobile || "کاربر"}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-600 text-sm font-semibold text-white">
            {((user?.name || user?.mobile || "کاربر").charAt(0)).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}

export default PanelHeader;