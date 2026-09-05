import { notFound } from "next/navigation";
import { Metadata } from "next";

async function getAllPages(): Promise<any[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/pages`,
      {
        headers: { Accept: "application/json" },
        cache: "no-cache",
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  // مسیر کامل: مثلاً ['%D9%88%D8%B1%D8%B2%D8%B4%DB%8C'] => 'ورزشی'
  const rawPath = slug.join("/");
  const slugPath = decodeURIComponent(rawPath); // ✅ دیکد کردن

  const pages = await getAllPages();
  // جستجو بر اساس slug دیکد شده
  const page = pages.find((p: any) => p.slug === slugPath && p.status === 1);

  if (!page) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        {page.title}
      </h1>
      <div
        className="prose prose-lg dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: page.body || "" }}
      />
    </div>
  );
}

// ---------- متادیتا ----------
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const rawPath = slug.join("/");
  const slugPath = decodeURIComponent(rawPath); // ✅ دیکد کردن

  const pages = await getAllPages();
  const page = pages.find((p: any) => p.slug === slugPath && p.status === 1);

  if (!page) {
    return {
      title: "صفحه یافت نشد",
      description: "صفحه مورد نظر شما در دسترس نیست.",
    };
  }

  const description = page.body
    ? page.body.replace(/<[^>]*>/g, "").slice(0, 160)
    : "";

  return {
    title: page.title,
    description,
    openGraph: {
      title: page.title,
      description,
    },
  };
}