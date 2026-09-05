"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

interface DashboardStats {
  total: number;
  active: number;
  pending: number;
  expired: number;
}

function PanelDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    active: 0,
    pending: 0,
    expired: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/panel/advertise/advertisement`,
          { credentials: "include" },
        );
        if (res.ok) {
          const data = await res.json();
          const ads = data.data || [];
          setStats({
            total: ads.length,
            active: ads.filter((a: any) => a.status === 1).length,
            pending: ads.filter((a: any) => a.status === 3).length,
            expired: ads.filter((a: any) => a.status === 4).length,
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      label: "کل آگهی‌ها",
      value: stats.total,
      icon: "fa-file-text",
      color: "blue",
    },
    {
      label: "فعال",
      value: stats.active,
      icon: "fa-check-circle",
      color: "green",
    },
    {
      label: "در انتظار تایید",
      value: stats.pending,
      icon: "fa-clock",
      color: "yellow",
    },
    {
      label: "منقضی",
      value: stats.expired,
      icon: "fa-times-circle",
      color: "red",
    },
  ];

  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    green:
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    yellow:
      "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
    red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  };

  return (
    <div className="space-y-6">
      {/* خوش‌آمدگویی */}
      <div className="rounded-2xl bg-linear-to-l from-rose-600 to-rose-700 p-6 text-white">
        <h2 className="text-2xl font-bold">
          خوش آمدید، {user?.name || user?.mobile || "کاربر"} 👋
        </h2>
        <p className="mt-1 text-rose-100">
          از طریق پنل کاربری می‌توانید آگهی‌های خود را مدیریت کنید.
        </p>
        <Link
          href="/panel/advertisements/create"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
        >
          <i className="fa fa-plus"></i>
          ایجاد آگهی جدید
        </Link>
      </div>

      {/* کارت‌های آماری */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? "..." : stat.value}
                </p>
              </div>
              <div
                className={`rounded-xl p-2 ${colorClasses[stat.color as keyof typeof colorClasses]}`}
              >
                <i className={`fa ${stat.icon} text-lg`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* لینک‌های سریع */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          دسترسی سریع
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Link
            href="/panel/advertisements"
            className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 transition hover:border-rose-200 hover:bg-rose-50 dark:border-gray-700 dark:hover:border-rose-800 dark:hover:bg-rose-900/20"
          >
            <i className="fa fa-list text-rose-600"></i>
            <span className="text-sm font-medium">مشاهده آگهی‌ها</span>
          </Link>
          <Link
            href="/panel/advertisements/create"
            className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 transition hover:border-rose-200 hover:bg-rose-50 dark:border-gray-700 dark:hover:border-rose-800 dark:hover:bg-rose-900/20"
          >
            <i className="fa fa-plus text-rose-600"></i>
            <span className="text-sm font-medium">آگهی جدید</span>
          </Link>
          <Link
            href="/panel/profile"
            className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 transition hover:border-rose-200 hover:bg-rose-50 dark:border-gray-700 dark:hover:border-rose-800 dark:hover:bg-rose-900/20"
          >
            <i className="fa fa-user text-rose-600"></i>
            <span className="text-sm font-medium">ویرایش پروفایل</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PanelDashboard;
