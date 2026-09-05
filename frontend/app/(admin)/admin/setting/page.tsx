import React, { Suspense } from "react";
import Link from "next/link";
import SuccessMessage from "../../../components/ui/SuccessMessage";
import SettingForm from "./SettingForm";
import { serverGet } from "@/app/lib/serverFetch";
export const metadata = {
  title: "پنل مدیریت | تنظیمات",
  description: "لیست تنظیمات در پنل مدیریت",
};
async function SettingPage() {
  let setting;

  try {
    setting = await serverGet(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/setting`,
    );
  } catch (error) {
    console.error("Error fetching setting:", error);

    setting = {
      data: [],
    };
  }

  return (
    <div className="space-y-6">
      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col gap-4 rounded-2xl border border-color bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-hover text-icon">
              <i className="fa fa-screwdriver-wrench text-lg"></i>
            </div>

            <div>
              <h1 className="text-xl font-bold text-primary sm:text-2xl">
                تنظیمات
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SUCCESS MESSAGES ================= */}
      <Suspense fallback={null}>
        <SuccessMessage
          messages={{
            editSuccess: "تنظیمات با موفقیت ویرایش شد.",
          }}
        />
      </Suspense>

      {/* ================= Setting LIST ================= */}
      <div className="rounded-2xl border border-color bg-surface text-primary p-5 shadow-sm sm:p-7">
        <SettingForm setting={setting.data} />
      </div>
    </div>
  );
}

export default SettingPage;
