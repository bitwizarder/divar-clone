import type { Metadata } from "next";
import "./styles/globals.css";
import localFont from "next/font/local";
import { AuthProvider } from "./context/AuthContext";
import { FilterProvider } from "./context/FilterContext";
import { SettingsProvider } from "./context/SettingsContext";
import { fetchSettings, SiteSettings } from "./lib/api/settings";
import { getImageUrl } from "./helpers/image"; // ✅ اضافه کردن

const vazirmatn = localFont({
  src: [
    {
      path: "./fonts/vazirmatn/webfonts/Vazirmatn-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/vazirmatn/webfonts/Vazirmatn-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-vazirmatn",
});

// ========== متادیتای داینامیک از تنظیمات ==========
export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSettings();

  // ✅ تبدیل مسیر فاوآیکون با getImageUrl
  const faviconUrl = settings.favicon
    ? getImageUrl(settings.favicon)
    : "/favicon.ico";
  return {
    title: settings.title || "پیش‌فرض سایت",
    description: settings.description || "",
    keywords: settings.keywords || "",
    icons: {
      icon: faviconUrl,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings: SiteSettings = await fetchSettings();

  return (
    <html lang="fa" className={vazirmatn.variable} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="/fontawesome-free-7.3.1-web/css/all.min.css"
        />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <FilterProvider>
            <SettingsProvider settings={settings}>{children}</SettingsProvider>
          </FilterProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
