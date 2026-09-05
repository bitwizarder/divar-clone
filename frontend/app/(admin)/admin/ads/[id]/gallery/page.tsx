import React, { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import SuccessMessage from "@/app/components/ui/SuccessMessage";
import GalleryList from "./GalleryList";
import { GalleryListResponse } from "@/app/types/gallery";
import { serverGet } from "@/app/lib/serverFetch";

export const metadata = {
  title: "گالری تصاویر آگهی",
  description: "مدیریت تصاویر گالری آگهی",
};

async function getGallery(
  advertisementId: number,
): Promise<GalleryListResponse> {
  // ✅ استفاده از serverGet به‌جای fetch
  return await serverGet(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/advertise/${advertisementId}/gallery`,
  );
}

async function getAdTitle(advertisementId: number): Promise<string> {
  // ✅ استفاده از serverGet به‌جای fetch
  const data = await serverGet(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/advertise/advertisement/${advertisementId}`,
  );
  return data.data?.title || "آگهی";
}

interface GalleryPageProps {
  params: Promise<{ id: string }>;
}

async function GalleryPage({ params }: GalleryPageProps) {
  try {
    const { id } = await params;
    const advertisementId = Number(id);

    if (isNaN(advertisementId) || advertisementId <= 0) {
      notFound();
    }

    // دریافت داده‌ها
    const [galleryData, adTitle] = await Promise.all([
      getGallery(advertisementId),
      getAdTitle(advertisementId),
    ]);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 rounded-2xl border border-color bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              گالری تصاویر: {adTitle}
            </h1>
            <p className="mt-1 text-sm text-muted">
              مدیریت تصاویر گالری این آگهی
            </p>
          </div>

          <Link
            href="/admin/ads"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-color bg-surface px-5 py-3 text-sm font-medium text-secondary hover:bg-hover hover:text-primary shadow-sm transition sm:w-auto"
          >
            <i className="fa fa-arrow-right"></i>
            بازگشت به آگهی‌ها
          </Link>
        </div>

        {/* Success Messages */}
        <Suspense fallback={null}>
          <SuccessMessage
            messages={{
              createSuccess: "تصویر گالری با موفقیت اضافه شد.",
              editSuccess: "تصویر گالری با موفقیت ویرایش شد.",
              deleteSuccess: "تصویر گالری با موفقیت حذف شد.",
              deletesSuccess: "تصاویر گالری انتخاب شده با موفقیت حذف شدند.",
            }}
          />
        </Suspense>

        {/* Gallery List */}
        <GalleryList
          advertisementId={advertisementId}
          initialData={galleryData.data || []}
        />
      </div>
    );
  } catch (error) {
    console.error("Error loading gallery:", error);
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
          <Link
            href="/admin/ads"
            className="mt-4 inline-block rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
          >
            بازگشت به لیست آگهی‌ها
          </Link>
        </div>
      </div>
    );
  }
}

export default GalleryPage;
