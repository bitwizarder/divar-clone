"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

interface ImageUploaderProps {
  id?: string;

  label?: string;
  value?: File | null;
  preview?: string;
  onChange: (file: File | null) => void;
  onRemove?: () => void;

  accept?: string[];
  maxSize?: number;

  aspect?: "square" | "landscape" | "portrait" | "auto";

  priority?: boolean;

  disabled?: boolean;
  error?: string | null;

  className?: string;
}

export default function ImageUploader({
  id,
  label = "تصویر",
  value = null,
  preview = "",
  onChange,
  onRemove,

  accept = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"],

  maxSize = 2,

  aspect = "square",

  priority = false,

  disabled = false,
  error = null,

  className = "",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [previewUrl, setPreviewUrl] = useState(preview);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputId = id || `image-upload-${label}`;
  /*
  |--------------------------------------------------------------------------
  | Preview
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!value) {
      setPreviewUrl(preview);
      return;
    }

    const objectUrl = URL.createObjectURL(value);

    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [value, preview]);

  /*
  |--------------------------------------------------------------------------
  | File Change
  |--------------------------------------------------------------------------
  */

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setValidationError(null);

    /*
    |--------------------------------------------------------------------------
    | Validate Type
    |--------------------------------------------------------------------------
    */

    if (!accept.includes(file.type)) {
      setValidationError("فرمت تصویر انتخاب شده معتبر نیست.");

      event.target.value = "";

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Size
    |--------------------------------------------------------------------------
    */

    const maxBytes = maxSize * 1024 * 1024;

    if (file.size > maxBytes) {
      setValidationError(`حجم تصویر نباید بیشتر از ${maxSize} مگابایت باشد.`);

      event.target.value = "";

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Set File
    |--------------------------------------------------------------------------
    */

    onChange(file);
  };

  /*
  |--------------------------------------------------------------------------
  | Remove
  |--------------------------------------------------------------------------
  */

  const handleRemove = () => {
    setValidationError(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    onChange(null);

    if (onRemove) {
      onRemove();
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Aspect Ratio
  |--------------------------------------------------------------------------
  */

  const aspectClasses = {
    square: "aspect-square",
    landscape: "aspect-video",
    portrait: "aspect-[3/4]",
    auto: "min-h-32",
  };

  /*
  |--------------------------------------------------------------------------
  | Accept Text
  |--------------------------------------------------------------------------
  */

  const acceptedExtensions = accept
    .map((type) => {
      switch (type) {
        case "image/jpeg":
          return "JPG";
        case "image/png":
          return "PNG";
        case "image/jpg":
          return "JPG";
        case "image/gif":
          return "GIF";
        case "image/webp":
          return "WEBP";
        case "image/x-icon":
          return "ICO";
        case "image/vnd.microsoft.icon":
          return "ICO";
        default:
          return "";
      }
    })
    .filter(Boolean)
    .filter((item, index, array) => array.indexOf(item) === index);

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-dark">
          {label}
        </label>
      )}

      <div className="rounded-xl border border-color bg-gray-50 p-4 dark:bg-gray-50/5">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          {/* Preview */}
          <div
            className={`
              ${aspectClasses[aspect]}
              relative
              flex
              w-32
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-xl
              border
              border-color
              bg-white
              dark:bg-gray-900/10
            `}
          >
            {previewUrl ? (
              <Image
                src={previewUrl}
                // src={getImageUrl(previewUrl)}
                alt={label}
                fill
                unoptimized={previewUrl.startsWith("blob:")}
                priority={priority}
                sizes="(max-width: 640px) 100px, 128px"
                className="object-contain p-3"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <i className="fa fa-image text-3xl"></i>

                <span className="text-xs">بدون تصویر</span>
              </div>
            )}
          </div>

          {/* Upload */}
          <div className="flex-1">
            <label
              htmlFor={inputId}
              className={`
                flex
                cursor-pointer
                flex-col
                items-center
                justify-center
                rounded-xl
                border-2
                border-dashed
                border-color
                px-5
                py-6
                transition

                hover:border-blue-400
                hover:bg-blue-50/50

                dark:hover:bg-blue-500/5

                ${disabled ? "cursor-not-allowed opacity-50" : ""}
              `}
            >
              <i className="fa fa-cloud-upload-alt mb-2 text-2xl text-gray-400"></i>

              <span className="text-sm font-medium text-gray-dark">
                انتخاب {label}
              </span>

              <span className="mt-1 text-xs text-gray-400">
                {acceptedExtensions.join(", ")}
              </span>

              <span className="mt-1 text-xs text-gray-400">
                حداکثر {maxSize} مگابایت
              </span>

              <input
                ref={inputRef}
                id={inputId}
                type="file"
                accept={accept.join(",")}
                disabled={disabled}
                className="hidden"
                onChange={handleChange}
              />
            </label>

            {/* Selected File */}
            {value && (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-500/10">
                <div className="min-w-0">
                  <span className="block truncate text-xs text-blue-600 dark:text-blue-400">
                    {value.name}
                  </span>

                  <span className="mt-0.5 block text-[10px] text-gray-400">
                    {(value.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={disabled}
                  className="mr-3 shrink-0 text-red-500 transition hover:text-red-600 disabled:opacity-50"
                >
                  <i className="fa fa-times"></i>
                </button>
              </div>
            )}

            {/* Error */}
            {(validationError || error) && (
              <p className="mt-2 text-xs text-red-500">
                {validationError || error}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
