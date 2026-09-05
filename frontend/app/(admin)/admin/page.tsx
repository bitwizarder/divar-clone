import React from "react";

function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <section className="rounded-2xl border border-black/5 bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-white">
            <i className="fa fa-dashboard text-lg"></i>
          </div>

          <div>
            <h4 className="text-lg font-bold text-secondary sm:text-xl">
              به پنل ادمین خوش آمدید
            </h4>

            <p className="mt-2 text-sm leading-7 text-gray">
              در این قسمت می‌توانید بخش‌های مختلف پنل مدیریت سایت را مدیریت و
              کنترل کنید.
            </p>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-surface p-5 text-primary shadow-sm">
          <p className="text-sm text-secondary">تعداد کاربران</p>

          <p className="mt-3 text-2xl font-bold">0</p>
        </div>

        <div className="rounded-2xl bg-surface p-5 text-primary shadow-sm">
          <p className="text-sm text-secondary">تعداد دسته‌بندی‌ها</p>

          <p className="mt-3 text-2xl font-bold">0</p>
        </div>

        <div className="rounded-2xl bg-surface p-5 text-primary shadow-sm">
          <p className="text-sm text-secondary">تعداد آگهی‌ها</p>

          <p className="mt-3 text-2xl font-bold">0</p>
        </div>

        <div className="rounded-2xl bg-surface p-5 text-primary shadow-sm">
          <p className="text-sm text-secondary">وضعیت سیستم</p>

          <p className="mt-3 text-lg font-bold text-green-400">فعال</p>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
