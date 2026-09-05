"use client";
import Image from "next/image";
import React from "react";
import { useParams } from "next/navigation";
import ChatButton from "@/app/components/ui/chat/ChatButton";

function FooterAds() {
  const params = useParams<{ id: string }>();
  const adId = params?.id ? Number(params.id) : null;
  return (
    <>
      <footer className="hidden lg:block  py-6">
        <div className="space-y-5">
          <a href="#" className="flex-center">
            <Image
              src="/images/logo.png"
              alt="logo"
              className="size-8"
              width={40}
              height={40}
            />
          </a>
          <nav className="flex-center flex-wrap gap-3 [&_a]:pe-3 text-xs text-gray divide-x divide-gray-300">
            <a className="" href="#">
              {" "}
              دربارهٔ دیوار{" "}
            </a>
            <a className="" href="#">
              {" "}
              پشتیبانی و قوانین{" "}
            </a>
            <a href="#">اتاق خبر</a>
            <a title=" دیوار حرفه‌ای " href="#">
              دیوار حرفه‌ای
            </a>
            <a title=" دریافت برنامه " href="#">
              دریافت برنامه
            </a>
            <a href="#" target="_blank">
              گزارش آسیب‌پذیری
            </a>
            <a href="#" target="_blank">
              درگاه تأمین‌کنندگان دیوار
            </a>
            <a href="#" target="_blank">
              گزارش‌دهی تخلفات
            </a>
            <a href="#" target="_blank">
              دیواری شو
            </a>
          </nav>

          <div className="flex-center space-x-4 text-gray">
            <div>
              <a href="#">
                <i className="fa fab fa-youtube-square text-2xl"></i>
              </a>
            </div>
            <div>
              <a href="#">
                <i className="fa fab fa-linkedin text-2xl"></i>
              </a>
            </div>
            <div>
              <a href="#">
                <i className="fa fab fa-twitter-square text-2xl"></i>
              </a>
            </div>
            <div>
              <a href="#">
                <i className="fa fab fa-instagram text-2xl"></i>
              </a>
            </div>
          </div>
        </div>
      </footer>
      {/* ===== فوتر موبایل (با دکمه‌های چت و تماس) ===== */}
      <footer className="lg:hidden bg-gray-100 sticky bottom-0 right-0 left-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] py-3">
        <section className="container flex-center-between gap-x-4">
          <div className="w-1/2">
            {/* ✅ استفاده از ChatButton با شناسه آگهی */}
            {adId ? (
              <ChatButton advertisementId={adId} />
            ) : (
              <button
                disabled
                className="bg-gray-400 text-white w-full py-1 rounded cursor-not-allowed"
              >
                چت
              </button>
            )}
          </div>
          <div className="w-1/2">
            {/* دکمه اطلاعات تماس (فعلاً غیرفعال) */}
            <button
              className="bg-rose-700 hover:bg-rose-700/90 text-white w-full py-1 rounded"
              onClick={() => alert("اطلاعات تماس نمایش داده می‌شود")}
            >
              اطلاعات تماس
            </button>
          </div>
        </section>
      </footer>
    </>
  );
}

export default FooterAds;
