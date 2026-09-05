"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";
import { getImageUrl } from "@/app/helpers/image";
import { converterToJalali } from "@/app/helpers/date";
import ImageUploader from "@/app/components/ui/common/ImageUploader";
import { Gallery } from "@/app/types/gallery";

function UserGalleryPage() {
  const params = useParams();
  const router = useRouter();
  const advertisementId = Number(params.id);
  const { user } = useAuth();

  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // ========== دریافت CSRF ==========
  useEffect(() => {
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

  // ========== دریافت گالری ==========
  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/panel/advertise/gallery/${advertisementId}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("خطا در دریافت گالری");
      const data = await res.json();
      setGalleries(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (advertisementId) fetchGalleries();
  }, [advertisementId]);

  // ========== آپلود تصویر ==========
  const handleUpload = async () => {
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

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/panel/advertise/gallery/store/${advertisementId}`,
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
      await fetchGalleries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در آپلود");
    } finally {
      setUploading(false);
    }
  };

  // ========== حذف تصویر ==========
  const handleDelete = async (galleryId: number) => {
    if (!confirm("آیا از حذف این تصویر مطمئن هستید؟")) return;

    try {
      setDeletingId(galleryId);
      const csrf = await getCsrfToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/panel/advertise/gallery/destroy/${galleryId}`,
        {
          method: "DELETE",
          headers: {
            "X-XSRF-TOKEN": csrf,
            Accept: "application/json",
          },
          credentials: "include",
        },
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "خطا در حذف تصویر");
      }
      setSuccess("تصویر با موفقیت حذف شد.");
      await fetchGalleries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در حذف");
    } finally {
      setDeletingId(null);
    }
  };

  const getCsrfToken = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/sanctum/csrf-cookie`,
      { method: "GET", credentials: "include" },
    );
    if (!res.ok) throw new Error("خطا در دریافت CSRF token");
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("XSRF-TOKEN="))
      ?.split("=")[1];
    if (!token) throw new Error("CSRF token موجود نیست");
    return decodeURIComponent(token);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <i className="fa fa-spinner fa-spin text-3xl text-rose-600"></i>
          <p className="text-gray-500">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            گالری آگهی
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            تصاویر گالری این آگهی را مدیریت کنید.
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm transition hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          بازگشت
        </button>
      </div>

      {/* خطا و موفقیت */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <p className="font-medium">خطا</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
          <p className="font-medium">موفق</p>
          <p className="text-sm">{success}</p>
        </div>
      )}

      {/* فرم آپلود */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          افزودن تصویر جدید
        </h3>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
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
          <button
            onClick={handleUpload}
            disabled={uploading || !imageFile || !csrfToken}
            className="flex h-12 items-center gap-2 rounded-xl bg-rose-600 px-6 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-50"
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
        </div>
      </div>

      {/* لیست تصاویر */}
      {galleries.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <i className="fa fa-images text-5xl text-gray-300"></i>
          <p className="mt-4 text-gray-500">
            هیچ تصویری در گالری این آگهی وجود ندارد.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {galleries.map((item) => {
            const imageUrl = item.image?.indexArray?.medium
              ? getImageUrl(item.image.indexArray.medium)
              : null;

            return (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="relative aspect-square w-full bg-gray-100">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={`تصویر ${item.id}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <i className="fa fa-image text-4xl text-gray-300"></i>
                    </div>
                  )}
                </div>

                <div className="absolute left-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white transition hover:bg-red-700 disabled:opacity-50"
                  >
                    {deletingId === item.id ? (
                      <i className="fa fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fa fa-trash"></i>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default UserGalleryPage;
