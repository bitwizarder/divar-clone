"use client";

import { useState } from "react";
import Image from "next/image";
import { getImageUrl } from "@/app/helpers/image";

interface AdsGalleryProps {
  images: string[];
  title: string;
}

function AdsGallery({ images, title }: AdsGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const hasImages = images.length > 0;

  const openLightbox = () => {
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const goToPrev = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!hasImages) {
    return (
      <div className="w-full aspect-16/12 bg-gray-100 flex items-center justify-center text-gray-400 lg:rounded">
        <i className="fa fa-image text-6xl"></i>
      </div>
    );
  }

  return (
    <>
      {/* تصویر اصلی */}
      <div className="mb-3 relative group">
        <div
          className="relative w-full aspect-16/12 overflow-hidden lg:rounded cursor-pointer"
          onClick={openLightbox}
        >
          <Image
            src={getImageUrl(images[currentImageIndex])}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
            unoptimized
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-opacity duration-300 group-hover:bg-black/20">
            <div className="rounded-full bg-white/80 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <i className="fa fa-expand text-gray-700"></i>
            </div>
          </div>
        </div>
      </div>

      {/* تام‌نیل‌ها */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {images.map((path, index) => {
            const url = getImageUrl(path);
            if (!url) return null;
            return (
              <div
                key={index}
                className={`relative size-20 shrink-0 overflow-hidden rounded border-2 cursor-pointer transition-all hover:scale-105 ${
                  index === currentImageIndex
                    ? "border-rose-500/40"
                    : "border-gray-200 hover:border-gray-400"
                }`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <Image
                  src={url}
                  alt={`تصویر ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={closeLightbox}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* دکمه بستن */}
            <button
              className="absolute -right-4 -top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-2xl font-bold text-gray-800 shadow-lg hover:bg-gray-100"
              onClick={closeLightbox}
            >
              ×
            </button>

            {/* دکمه قبلی */}
            {images.length > 1 && (
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/40"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrev();
                }}
              >
                <i className="fa fa-chevron-left text-2xl"></i>
              </button>
            )}

            {/* تصویر بزرگ */}
            <div className="relative h-auto w-auto">
              <Image
                src={getImageUrl(images[currentImageIndex])}
                alt={`تصویر ${currentImageIndex + 1}`}
                width={1200}
                height={800}
                className="max-h-[85vh] w-auto rounded-lg object-contain"
                unoptimized
                priority
              />
            </div>

            {/* دکمه بعدی */}
            {images.length > 1 && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/40"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
              >
                <i className="fa fa-chevron-right text-2xl"></i>
              </button>
            )}

            {/* شمارنده */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 rounded-full bg-black/50 px-4 py-1.5 text-sm text-white">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default AdsGallery;
