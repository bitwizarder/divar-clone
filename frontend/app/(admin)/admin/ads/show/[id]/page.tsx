import React from "react";
import { notFound } from "next/navigation";
import AdsShow from "./AdsShow";
import { AdsResponse } from "@/app/types/ads";
import { GalleryListResponse } from "@/app/types/gallery";
import { serverGet } from "@/app/lib/serverFetch";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return {
    title: `مشاهده آگهی #${id}`,
    description: `جزئیات کامل آگهی با شناسه ${id}`,
  };
}

async function getAd(id: number): Promise<AdsResponse> {
  return await serverGet(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/advertise/advertisement/${id}`,
  );
}

// ✅ تابع جدید برای دریافت گالری
async function getGallery(
  advertisementId: number,
): Promise<GalleryListResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/advertise/${advertisementId}/gallery`,
    {
      headers: { Accept: "application/json" },
      cache: "no-cache",
    },
  );

  if (!res.ok) {
    // اگر خطا باشد، آرایه خالی برگردان تا صفحه کرش نکند
    return { data: [], status: false };
  }

  return res.json();
}

async function AdsShowPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const numericId = Number(id);

    if (isNaN(numericId) || numericId <= 0) {
      notFound();
    }

    // دریافت همزمان آگهی و گالری
    const [adResponse, galleryResponse] = await Promise.all([
      getAd(numericId),
      getGallery(numericId),
    ]);

    if (!adResponse?.data) {
      notFound();
    }

    return (
      <div className="container mx-auto px-4 py-6">
        <AdsShow
          ad={adResponse.data}
          gallery={galleryResponse.data || []} // ✅ ارسال گالری به کامپوننت
        />
      </div>
    );
  } catch (error) {
    if (error instanceof Error && error.message === "آگهی مورد نظر یافت نشد.") {
      notFound();
    }

    return (
      <div className="flex min-h-100 items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <div>
          <i className="fa fa-exclamation-triangle text-3xl text-red-500"></i>
          <h2 className="mt-3 text-xl font-bold text-red-700">
            خطا در دریافت اطلاعات
          </h2>
          <p className="mt-2 text-sm text-red-600">
            {error instanceof Error ? error.message : "خطای ناشناخته"}
          </p>
          <a
            href="/admin/ads"
            className="mt-4 inline-block rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
          >
            بازگشت به لیست
          </a>
        </div>
      </div>
    );
  }
}

export default AdsShowPage;
