"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Gallery } from "@/app/types/gallery";
import { getImageUrl } from "@/app/helpers/image";
import { converterToJalali } from "@/app/helpers/date";
import ImageUploader from "@/app/components/ui/common/ImageUploader";
import SingleDeleteAction from "@/app/components/ui/admin/SingleDeleteAction";

interface GalleryListProps {
  advertisementId: number;
  initialData: Gallery[];
}

function GalleryList({ advertisementId, initialData }: GalleryListProps) {
  const router = useRouter();
  const [galleries, setGalleries] = useState<Gallery[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ========== State برای آپلود ==========
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState(1);
  const [uploading, setUploading] = useState(false);

  // ========== CSRF Token ==========
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  // دریافت CSRF (در صورت نیاز)
  React.useEffect(() => {
    const fetchCsrf = async () => {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/sanctum/csrf-cookie`,
          { method: "GET", credentials: "include" },
        );
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("XSRF-TOKEN="))
          ?.split("=")[1];
        if (token) setCsrfToken(decodeURIComponent(token));
      } catch (error) {
        console.error("Error fetching CSRF:", error);
      }
    };
    fetchCsrf();
  }, []);

  // ========== آپلود تصویر جدید ==========
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setError("لطفاً یک تصویر انتخاب کنید.");
      return;
    }
    if (!csrfToken) {
      setError("CSRF token موجود نیست.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("status", String(status));
    formData.append("advertisement_id", String(advertisementId));
    formData.append("_method", "POST");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/advertise/${advertisementId}/gallery`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "X-XSRF-TOKEN": csrfToken,
          },
          credentials: "include",
          body: formData,
        },
      );

      const result = await res.json();

      if (!res.ok) {
        if (res.status === 422) {
          const errors = result.errors as Record<string, string[]> | undefined;
          const firstError = errors ? Object.values(errors)[0]?.[0] : null;
          throw new Error(
            firstError || result.message || "اطلاعات وارد شده معتبر نیست.",
          );
        }
        throw new Error(result.message || "خطا در آپلود تصویر");
      }

      setSuccess("تصویر با موفقیت اضافه شد.");
      setImageFile(null);
      // به‌روزرسانی لیست
      const updated = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/advertise/${advertisementId}/gallery`,
        { headers: { Accept: "application/json" }, credentials: "include" },
      );
      if (updated.ok) {
        const data = await updated.json();
        setGalleries(data.data || []);
      }
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "خطا در آپلود");
    } finally {
      setUploading(false);
    }
  };

  // ========== حذف ==========
  const handleDeleteSuccess = (deletedId: number) => {
    setGalleries(galleries.filter((g) => g.id !== deletedId));
    setSuccess("تصویر با موفقیت حذف شد.");
    setTimeout(() => setSuccess(null), 3000);
    router.refresh();
  };

  if (!galleries.length && !imageFile) {
    return (
      <>
        <div className="rounded-2xl border border-color bg-surface p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <i className="fa fa-images text-4xl text-gray-400"></i>
            <p className="text-gray-500">
              هیچ تصویری در گالری این آگهی وجود ندارد.
            </p>
            <p className="text-sm text-gray-400">
              با استفاده از فرم زیر، تصویر جدید اضافه کنید.
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-color bg-surface p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-secondary">
            افزودن تصویر جدید
          </h3>
          <form
            onSubmit={handleUpload}
            className="flex flex-col gap-4 sm:flex-row sm:items-end"
          >
            <div className="flex-1">
              <ImageUploader
                label="تصویر گالری"
                value={imageFile}
                preview=""
                onChange={(file) => setImageFile(file)}
                accept={[
                  "image/jpeg",
                  "image/png",
                  "image/jpg",
                  "image/gif",
                  "image/webp",
                ]}
                maxSize={5}
              />
            </div>
            <div className="w-full sm:w-48">
              <label className="mb-2 block text-sm font-medium text-gray-dark">
                وضعیت
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(Number(e.target.value))}
                className="w-full rounded-xl border border-color bg-gray-50 px-4 py-3 text-sm text-primary outline-none focus:border-blue-500"
              >
                <option value={1}>فعال</option>
                <option value={0}>غیرفعال</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={uploading || !imageFile}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <i className="fa fa-spinner fa-spin"></i>
                  در حال آپلود...
                </>
              ) : (
                <>
                  <i className="fa fa-upload"></i>
                  آپلود
                </>
              )}
            </button>
          </form>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error & Success */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <i className="fa fa-exclamation-circle mt-0.5"></i>
          <div>
            <p className="font-medium">خطا</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
          <i className="fa fa-check-circle mt-0.5"></i>
          <div>
            <p className="font-medium">عملیات موفق</p>
            <p className="text-sm">{success}</p>
          </div>
        </div>
      )}

      {/* فرم آپلود */}
      <div className="rounded-2xl border border-color bg-surface p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-secondary">
          افزودن تصویر جدید
        </h3>
        <form
          onSubmit={handleUpload}
          className="flex flex-col gap-4 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <ImageUploader
              label="تصویر گالری"
              value={imageFile}
              preview=""
              onChange={(file) => setImageFile(file)}
              accept={[
                "image/jpeg",
                "image/png",
                "image/jpg",
                "image/gif",
                "image/webp",
              ]}
              maxSize={5}
            />
          </div>
          <div className="w-full sm:w-48">
            <label className="mb-2 block text-sm font-medium text-gray-dark">
              وضعیت
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(Number(e.target.value))}
              className="w-full rounded-xl border border-color bg-gray-50 px-4 py-3 text-sm text-primary outline-none focus:border-blue-500"
            >
              <option value={1}>فعال</option>
              <option value={0}>غیرفعال</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={uploading || !imageFile}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? (
              <>
                <i className="fa fa-spinner fa-spin"></i>
                در حال آپلود...
              </>
            ) : (
              <>
                <i className="fa fa-upload"></i>
                آپلود
              </>
            )}
          </button>
        </form>
      </div>

      {/* لیست تصاویر */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {galleries.map((item) => {
          const imageUrl = item.image?.indexArray?.medium
            ? getImageUrl(item.image.indexArray.medium)
            : null;

          return (
            <div
              key={item.id}
              className="group relative rounded-2xl border border-color bg-surface overflow-hidden shadow-sm transition hover:shadow-md"
            >
              {imageUrl ? (
                <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                  <Image
                    src={imageUrl}
                    alt={`تصویر گالری ${item.id}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex aspect-square items-center justify-center bg-gray-50">
                  <i className="fa fa-image text-4xl text-gray-300"></i>
                </div>
              )}

              <div className="p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">#{item.id}</span>
                  {item.status ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-success"></span>
                      فعال
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-danger"></span>
                      غیرفعال
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  {converterToJalali(item.created_at)}
                </p>
              </div>

              {/* Actions */}
              <div className="absolute left-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <SingleDeleteAction
                  endpoint={`/api/admin/advertise/${advertisementId}/gallery/${item.id}`}
                  title="حذف تصویر گالری"
                  itemName={`تصویر گالری #${item.id}`}
                  itemId={item.id}
                  icon="fa fa-trash"
                  description="آیا از حذف این تصویر گالری مطمئن هستید؟"
                  warning="این عملیات قابل بازگشت نیست و تصویر برای همیشه حذف خواهد شد."
                  deleteButtonText="حذف"
                  confirmText="بله، حذف شود"
                  cancelText="انصراف"
                  onSuccess={() => handleDeleteSuccess(item.id)}
                  onError={(message) => setError(message)}
                />
              </div>
            </div>
          );
        })} 
      </div>
    </div>
  );
}

export default GalleryList;
