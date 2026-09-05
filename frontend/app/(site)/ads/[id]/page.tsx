import Link from "next/link";
import { notFound } from "next/navigation";
import { AdsResponse } from "@/app/types/ads";
import { getImageUrl } from "@/app/helpers/image";
import { timeAgo } from "@/app/helpers/time";
import { converterToJalali } from "@/app/helpers/date";
import NoteSection from "@/app/components/ui/home/ads/NoteSection";
import FavoriteButton from "@/app/components/ui/home/ads/FavoriteButton";
import Map from "@/app/components/ui/map/Map";
import AdsGallery from "@/app/components/ui/home/ads/AdsGallery";
import Image from "next/image";
import { log } from "console";
import ChatButton from "@/app/components/ui/chat/ChatButton";

// ===== دریافت داده از API =====
async function getAd(id: number): Promise<AdsResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/advertisements/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (res.status === 404) throw new Error("آگهی مورد نظر یافت نشد.");

  if (!res.ok) throw new Error("خطا در دریافت آگهی");

  return await res.json();
}

// ===== نگاشت وضعیت ظاهری =====
const adsStatusMap: Record<string, string> = {
  new: "نو",
  as_good_as_new: "در حد نو",
  good: "خوب",
  acceptable: "قابل قبول",
  "1": "نو",
};

// ===== کامپوننت اصلی (Server Component) =====
async function Ads({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) notFound();

    const { data: ad } = await getAd(numericId);
    if (!ad || !ad.id) notFound();

    // ===== جمع‌آوری تمام تصاویر (اصلی + گالری) =====
    const allImages: string[] = [];

    if (ad.image?.indexArray?.large) {
      allImages.push(ad.image.indexArray.large);
    }

    if (ad.gallery && Array.isArray(ad.gallery)) {
      ad.gallery.forEach((item) => {
        if (item.url?.indexArray?.large) {
          allImages.push(item.url.indexArray.large);
        }
      });
    }

    // ===== اطلاعات اصلی =====
    const title = ad.title || "بدون عنوان";
    const priceText = ad.price
      ? `${ad.price.toLocaleString()} تومان`
      : "توافقی";
    const statusText =
      adsStatusMap[ad.ads_status || ""] || ad.ads_status || "—";
    const timeAgoText = ad.published_at
      ? timeAgo(ad.published_at)
      : "لحظاتی پیش";
    const publishedDate = ad.published_at
      ? converterToJalali(ad.published_at)
      : "—";
    const expiredDate = ad.expired_at ? converterToJalali(ad.expired_at) : "—";
    const updatedDate = ad.updated_at ? converterToJalali(ad.updated_at) : "—";
    const categories = ad.allCategory || [];
    const attributes = ad.category_attributes_with_values || [];
    const tagsArray = ad.tags ? ad.tags.split(",").map((t) => t.trim()) : [];
    const hasLocation = ad.lat && ad.lng;

    return (
      <main className="text-zinc-800 w-full max-w-5xl mx-auto px-4 lg:px-8 py-10">
        {/* ===== Breadcrumb ===== */}
        <section className="hidden lg:block container mb-3">
          <nav aria-label="breadcrumbs">
            <ol className="flex gap-x-2 text-gray-400 text-xs items-center flex-nowrap overflow-x-auto max-w-full scrollbar-none">
              <li className="shrink-0 space-x-2">
                <Link href="/">
                  <span className="whitespace-nowrap">خانه</span>
                </Link>
                <i className="fa fa-angle-left"></i>
              </li>
              {categories.map((cat, idx) => (
                <li key={idx} className="shrink-0 space-x-2">
                  <Link href={`/category/${cat.slug || cat.id}`}>
                    <span className="whitespace-nowrap">{cat.name}</span>
                  </Link>
                  {idx < categories.length - 1 && (
                    <i className="fa fa-angle-left"></i>
                  )}
                </li>
              ))}
              <li className="shrink-0 text-gray-700 font-medium">
                <span className="whitespace-nowrap">{title}</span>
              </li>
            </ol>
          </nav>
        </section>

        <section className="lg:flex lg:flex-row-reverse gap-x-10">
          {/* ===== بخش تصاویر (کلاینت) ===== */}
          <section className="lg:w-1/2">
            <AdsGallery images={allImages} title={title} />

            {/* بخش‌های جانبی (یادداشت، نقشه، گزارش) */}
            <section className="hidden lg:block">
              <NoteSection advertisementId={ad.id} />
              {hasLocation && (
                <section className="mb-3">
                  <div className="h-50">
                    <Map lat={parseFloat(ad.lat!)} lng={parseFloat(ad.lng!)} />
                  </div>
                </section>
              )}
              <section className="container mb-3">
                <Link
                  href="#"
                  className="flex-center-between border-b border-gray-300 py-3"
                >
                  <div className="flex space-x-2">
                    <div className="text-gray text-lg">
                      <i className="fa fa-info-circle"></i>
                    </div>
                    <div>
                      <h4>گزارش آگهی</h4>
                    </div>
                  </div>
                  <div className="text-gray">
                    <i className="fa fa-angle-left"></i>
                  </div>
                </Link>
              </section>
              <section className="hidden lg:block container flex-center-between mb-3">
                <div>
                  <h4 className="text-sm">بازخورد شما درباره این آگهی چیست؟</h4>
                </div>
                <div className="flex gap-x-6 text-gray text-lg">
                  <button className="hover:text-gray-700">
                    <i className="fa fa-thumbs-o-down"></i>
                  </button>
                  <button className="hover:text-gray-700">
                    <i className="fa fa-thumbs-o-up"></i>
                  </button>
                </div>
              </section>
            </section>
          </section>

          {/* ===== بخش اطلاعات آگهی ===== */}
          <section className="lg:w-1/2">
            {/* Breadcrumb (Mobile) */}
            <section className="lg:hidden container mb-3">
              <nav aria-label="breadcrumbs">
                <ol className="flex gap-x-2 text-gray-400 text-xs items-center flex-nowrap overflow-x-auto max-w-full scrollbar-none">
                  <li className="shrink-0 space-x-2">
                    <Link href="/">
                      <span className="whitespace-nowrap">خانه</span>
                    </Link>
                    <i className="fa fa-angle-left"></i>
                  </li>
                  {categories.map((cat, idx) => (
                    <li key={idx} className="shrink-0 space-x-2">
                      <Link href={`/category/${cat.slug || cat.id}`}>
                        <span className="whitespace-nowrap">{cat.name}</span>
                      </Link>
                      {idx < categories.length - 1 && (
                        <i className="fa fa-angle-left"></i>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            </section>

            {/* عنوان و زمان */}
            <section className="container mb-3 space-y-3">
              <div>
                <h2 className="text-2xl font-bold">{title}</h2>
              </div>
              <div>
                <details className="group space-y-3">
                  <summary className="flex items-center justify-between cursor-pointer list-none font-light group-open:text-gray transition-colors duration-200">
                    <span>
                      {timeAgoText}{" "}
                      {ad.state?.name ? `در ${ad.state.name}` : ""}
                    </span>
                    <span className="transition-transform duration-200 text-gray group-open:rotate-180 group-open:text-gray">
                      <i className="fa fa-angle-down"></i>
                    </span>
                  </summary>
                  <div className="text-xs space-y-2 pt-2">
                    <p>انتشار آگهی: {publishedDate}</p>
                    <p>آخرین به‌روز‌رسانی: {updatedDate}</p>
                    {/* <p>تاریخ انقضا: {expiredDate}</p> */}
                  </div>
                </details>
              </div>
            </section>

            {/* هشدار امنیتی */}
            <section className="container mb-3">
              <Link
                href="#"
                className="flex-center-between border-t border-b border-gray-300 py-3"
              >
                <div className="flex space-x-2">
                  <div className="text-gray">
                    <i className="fa fa-warning"></i>
                  </div>
                  <div>
                    <h4>زنگ خطرهای قبل از معامله</h4>
                  </div>
                </div>
                <div className="text-gray">
                  <i className="fa fa-angle-left"></i>
                </div>
              </Link>
            </section>

            {/* دکمه‌های تماس و نشان */}
            <section className="container flex-center-between gap-x-4 mb-3">
              <section className="flex gap-4 grow">
                <button className="min-w-32 bg-rose-700 hover:bg-rose-700/90 text-white w-full py-2 rounded">
                  اطلاعات تماس
                </button>
                {/*  دکمه چت با کامپوننت کلاینت */}
                <ChatButton advertisementId={ad.id} />
              </section>
              <section className="flex gap-x-8 text-gray text-2xl">
                <button>
                  <i className="fa fa-share-alt"></i>
                </button>
                <FavoriteButton advertisementId={ad.id} />
              </section>
            </section>

            {/* ویژگی‌های اختصاصی */}
            {attributes.length > 0 && (
              <section className="container mb-3 py-2">
                <div className="grid grid-cols-3 gap-3 divide-x divide-gray-300">
                  {attributes.map((attr) => (
                    <div
                      key={attr.id}
                      className="flex-center flex-col gap-y-2 text-center"
                    >
                      <div>
                        <h6 className="text-gray text-sm">{attr.name}</h6>
                      </div>
                      <div>
                        <h6>{attr.value || "—"}</h6>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* اطلاعات کامل */}
            <section className="container mb-3">
              <div className="flex-center-between border-t border-b border-gray-300 py-3">
                <div className="text-gray">
                  <h4>وضعیت</h4>
                </div>
                <div>
                  <h4>{statusText}</h4>
                </div>
              </div>
              <div className="flex-center-between border-t border-b border-gray-300 py-3">
                <div className="text-gray">
                  <h4>قیمت</h4>
                </div>
                <div>
                  <h4>{priceText}</h4>
                </div>
              </div>

              <div className="flex-center-between border-t border-b border-gray-300 py-3">
                <div className="text-gray">
                  <h4>محله</h4>
                </div>
                <div>
                  <h4>
                    {ad.city?.name || "—"}،{ad.state?.name || "—"}
                  </h4>
                </div>
              </div>
            </section>

            {/* توضیحات */}
            <section className="container mb-3">
              <div>
                <h4 className="font-bold text-lg mb-3">توضیحات</h4>
              </div>
              <div>
                <p className="whitespace-pre-line wrap-anywhere text-sm leading-7">
                  {ad.description || "توضیحاتی ثبت نشده است."}
                </p>
              </div>
            </section>

            {/* برچسب‌ها */}
            {tagsArray.length > 0 && (
              <section className="container flex flex-wrap gap-y-2 gap-x-2 mb-3 py-2">
                {tagsArray.map((tag, idx) => (
                  <Link
                    key={idx}
                    href={`/tag/${encodeURIComponent(tag)}`}
                    className="text-sm bg-gray-200/80 text-gray-800 px-2 py-1 rounded"
                  >
                    {tag}
                  </Link>
                ))}
              </section>
            )}

            {/* بازخورد (موبایل) */}
            <section className="container lg:hidden flex-center-between mb-3">
              <div>
                <h4 className="text-sm">بازخورد شما درباره این آگهی چیست؟</h4>
              </div>
              <div className="flex gap-x-6 text-gray text-lg">
                <button className="hover:text-gray-700">
                  <i className="fa fa-thumbs-o-down"></i>
                </button>
                <button className="hover:text-gray-700">
                  <i className="fa fa-thumbs-o-up"></i>
                </button>
              </div>
            </section>

            {/* نقشه (موبایل) */}
            {hasLocation && (
              <section className="mb-3 lg:hidden">
                <div className="h-50">
                  <Map lat={parseFloat(ad.lat!)} lng={parseFloat(ad.lng!)} />
                </div>
              </section>
            )}

            {/* گزارش آگهی (موبایل) */}
            <section className="container mb-3 lg:hidden">
              <Link
                href="#"
                className="flex-center-between border-b border-gray-300 py-3"
              >
                <div className="flex space-x-2">
                  <div className="text-gray text-lg">
                    <i className="fa fa-info-circle"></i>
                  </div>
                  <div>
                    <h4>گزارش آگهی</h4>
                  </div>
                </div>
                <div className="text-gray">
                  <i className="fa fa-angle-left"></i>
                </div>
              </Link>
            </section>

            {/* یادداشت (موبایل) */}
            <section className="lg:hidden">
              <NoteSection advertisementId={ad.id} />
            </section>

            {/* فوتر موبایل */}
            <section className="container mt-16 lg:hidden">
              <div className="space-y-5">
                <Link href="/" className="flex-center">
                  <Image
                    src="/images/logo.png"
                    alt="logo"
                    className="size-8 object-contain"
                    width={40}
                    height={40}
                  />
                </Link>
                <nav className="flex-center flex-wrap gap-3 [&_a]:pe-3 text-xs text-gray divide-x divide-gray-300">
                  <Link href="#">دربارهٔ دیوار</Link>
                  <Link href="#">پشتیبانی و قوانین</Link>
                  <Link href="#">اتاق خبر</Link>
                  <Link href="#">دیوار حرفه‌ای</Link>
                  <Link href="#">دریافت برنامه</Link>
                </nav>
                <nav className="flex-center flex-wrap gap-3 [&_a]:pe-3 text-xs text-gray divide-x divide-gray-300">
                  <Link href="#">گزارش آسیب‌پذیری</Link>
                  <Link href="#">درگاه تأمین‌کنندگان دیوار</Link>
                  <Link href="#">گزارش‌دهی تخلفات</Link>
                  <Link href="#">دیواری شو</Link>
                </nav>
                <div className="flex-center space-x-4 text-gray">
                  <Link href="#">
                    <i className="fa fab fa-youtube-square text-2xl"></i>
                  </Link>
                  <Link href="#">
                    <i className="fa fa-linkedin-square text-2xl"></i>
                  </Link>
                  <Link href="#">
                    <i className="fa fab fa-twitter-square text-2xl"></i>
                  </Link>
                  <Link href="#">
                    <i className="fa fa-instagram text-2xl"></i>
                  </Link>
                </div>
              </div>
            </section>
          </section>
        </section>
      </main>
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
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
          >
            بازگشت به خانه
          </Link>
        </div>
      </div>
    );
  }
}

export default Ads;
