"use client";

import Image from "next/image";
import { Ads } from "@/app/types/ads";
import { getImageUrl } from "@/app/helpers/image";
import { timeAgo } from "@/app/helpers/time";
import Link from "next/link";
import { useFilter } from "@/app/context/FilterContext";
import { useCallback, useEffect, useRef, useState } from "react";

// تابع دریافت آگهی‌ها با فیلترهای اختیاری
export async function fetchAdvertisements(
  cityIds: number[] = [],
  categoryId?: number,
  stateId?: number,
  priceMin?: number,
  priceMax?: number,
  hasImage?: boolean,
  isUrgent?: boolean,
  search?: string,
  page: number = 1,
  perPage: number = 12,
): Promise<{
  data: Ads[];
  currentPage: number;
  lastPage: number;
  total: number;
}> {
  try {
    const params = new URLSearchParams();
    if (cityIds.length > 0) {
      cityIds.forEach((id) => params.append("city_ids[]", String(id)));
    }
    if (categoryId) params.append("category_id", String(categoryId));
    if (stateId) params.append("state_id", String(stateId));
    if (priceMin !== null && priceMin !== undefined)
      params.append("price_min", String(priceMin));
    if (priceMax !== null && priceMax !== undefined)
      params.append("price_max", String(priceMax));
    if (hasImage) params.append("has_image", "1");
    if (isUrgent) params.append("is_urgent", "1");
    if (search) params.append("search", search);
    params.append("page", String(page));
    params.append("per_page", String(perPage));

    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/advertisements${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-cache",
    });

    if (!res.ok) {
      return { data: [], currentPage: 1, lastPage: 1, total: 0 };
    }
    const result = await res.json();
    return {
      data: result.data || [],
      currentPage: result.current_page || 1,
      lastPage: result.last_page || 1,
      total: result.total || 0,
    };
  } catch (error) {
    console.error("Error fetching advertisements:", error);
    return { data: [], currentPage: 1, lastPage: 1, total: 0 };
  }
}

// نگاشت وضعیت ظاهری به فارسی
const adsStatusMap: Record<string, string> = {
  new: "نو",
  as_good_as_new: "در حد نو",
  good: "خوب",
  acceptable: "قابل قبول",
};

function AdvertisementList() {
  const {
    selectedCities,
    selectedCategory,
    selectedState,
    priceMin,
    priceMax,
    hasImage,
    isUrgent,
    searchQuery,
  } = useFilter();

  const [ads, setAds] = useState<Ads[]>([]); // همه آگهی‌های بارگذاری‌شده
  const [page, setPage] = useState(1); // صفحه فعلی
  const [hasMore, setHasMore] = useState(true); // آیا صفحه بعدی وجود دارد؟
  const [initialLoading, setInitialLoading] = useState(true); // بارگذاری اولیه
  const [loadingMore, setLoadingMore] = useState(false); // بارگذاری صفحات بعدی
  const observerRef = useRef<HTMLDivElement | null>(null); // ارجاع به المان observer

  // تابع بارگذاری داده‌ها
  const loadAds = useCallback(
    async (pageToLoad: number, reset: boolean = false) => {
      if (pageToLoad === 1) {
        setInitialLoading(true);
      } else {
        setLoadingMore(true);
      }

      const result = await fetchAdvertisements(
        selectedCities.map((c) => c.id),
        selectedCategory?.id,
        selectedState?.id,
        priceMin ?? undefined,
        priceMax ?? undefined,
        hasImage || undefined,
        isUrgent || undefined,
        searchQuery || undefined,
        pageToLoad,
        12, // تعداد در هر صفحه
      );

      if (reset) {
        setAds(result.data);
      } else {
        setAds((prev) => [...prev, ...result.data]);
      }

      setHasMore(pageToLoad < result.lastPage);
      setPage(pageToLoad);

      if (pageToLoad === 1) {
        setInitialLoading(false);
      } else {
        setLoadingMore(false);
      }
    },
    [
      selectedCities,
      selectedCategory,
      selectedState,
      priceMin,
      priceMax,
      hasImage,
      isUrgent,
      searchQuery,
    ],
  );

  // بارگذاری اولیه با تغییر فیلترها
  useEffect(() => {
    setAds([]);
    setPage(1);
    setHasMore(true);
    loadAds(1, true);
  }, [
    selectedCities,
    selectedCategory,
    selectedState,
    priceMin,
    priceMax,
    hasImage,
    isUrgent,
    searchQuery,
    loadAds,
  ]);

  // تنظیم IntersectionObserver برای بارگذاری صفحه بعدی
  useEffect(() => {
    if (!observerRef.current || !hasMore || loadingMore || initialLoading)
      return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !loadingMore &&
          !initialLoading
        ) {
          loadAds(page + 1, false);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(observerRef.current);

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMore, loadingMore, initialLoading, page, loadAds]);

  // نمایش لودر اولیه
  if (initialLoading && ads.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center w-full">
        <div className="flex flex-col items-center gap-3">
          <i className="fa fa-spinner fa-spin text-3xl text-rose-600"></i>
          <p className="text-gray-500">در حال بارگذاری آگهی‌ها...</p>
        </div>
      </div>
    );
  }

  // پیام عدم وجود آگهی
  if (!initialLoading && ads.length === 0) {
    return (
      <div className="text-gray-500 p-8 text-center border w-full border-gray-200 rounded-lg">
        هیچ آگهی‌ای با فیلترهای انتخاب‌شده یافت نشد.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap w-full">
        {ads.map((ad) => {
          const imageUrl = ad.image?.indexArray?.medium
            ? getImageUrl(ad.image.indexArray.medium)
            : null;
          const statusText =
            adsStatusMap[ad.ads_status || ""] || ad.ads_status || "—";
          const priceText = ad.price
            ? `${ad.price.toLocaleString()} تومان`
            : "توافقی";
          const timeText = ad.published_at
            ? timeAgo(ad.published_at)
            : "لحظاتی پیش";

          return (
            <article
              key={ad.id}
              className="w-full md:w-1/2 xl:w-1/3 py-1 md:px-1"
            >
              <Link href={`/ads/${ad.id}`} className="block h-full">
                <div className="border border-gray-300 rounded flex justify-between p-3 py-2 h-full transition hover:shadow-md hover:border-gray-400">
                  <section className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <h6 className="font-semibold text-sm line-clamp-2">
                        {ad.title}
                      </h6>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="text-sm text-gray">
                        <span>{statusText}</span>
                      </div>
                      <div className="text-sm text-gray font-medium">
                        <span>{priceText}</span>
                      </div>
                      <div className="text-sm text-gray flex items-center gap-2 flex-wrap divide-x *:pe-2">
                        {ad.is_ladder === 1 && (
                          <span className="text-red-700 font-medium">
                            نردبان شده
                          </span>
                        )}
                        {ad.is_special === 1 && (
                          <span className="text-red-700 font-medium">ویژه</span>
                        )}
                        <div>
                          <span>{timeText} </span>
                          <span>در {ad.state?.name || ""}</span>
                        </div>
                      </div>
                    </div>
                  </section>
                  <search className="shrink-0 mr-3">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={ad.title}
                        width={130}
                        height={130}
                        className="size-32 rounded-md object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="size-32 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
                        <i className="fa fa-image text-3xl"></i>
                      </div>
                    )}
                  </search>
                </div>
              </Link>
            </article>
          );
        })}
      </div>

      {/* المان observer برای بارگذاری بیشتر */}
      {hasMore && (
        <div ref={observerRef} className="w-full py-4 text-center">
          {loadingMore && (
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <i className="fa fa-spinner fa-spin"></i>
              <span>در حال بارگذاری بیشتر...</span>
            </div>
          )}
        </div>
      )}
      {!hasMore && ads.length > 0 && (
        <div className="w-full py-4 text-center text-gray-400 text-sm">
          همه آگهی‌ها بارگذاری شدند.
        </div>
      )}
    </>
  );
}

export default AdvertisementList;
