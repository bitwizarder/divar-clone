import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    // ----- دریافت کوکی‌ها -----
    const sessionCookie = request.cookies.get("laravel-session")?.value;
    const xsrfCookie = request.cookies.get("XSRF-TOKEN")?.value;

    console.log("Has laravel-session:", !!sessionCookie);
    console.log("Has XSRF-TOKEN:", !!xsrfCookie);

    if (!sessionCookie) {
      const loginUrl = new URL("/auth/login-register", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user`;

      const headers: HeadersInit = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
        Referer: "http://localhost:3000", // مهم: منبع درخواست
        Origin: "http://localhost:3000",   // مهم: منبع درخواست
      };

      // ⚠️ هدر X-XSRF-TOKEN را حذف می‌کنیم چون کوکی XSRF-TOKEN قبلاً در Cookie header ارسال شده است
      // if (xsrfCookie) {
      //   headers["X-XSRF-TOKEN"] = decodeURIComponent(xsrfCookie);
      // }

      const response = await fetch(apiUrl, {
        headers,
        // credentials: "include" در fetch سمت سرور کار نمی‌کند، کوکی‌ها دستی ارسال می‌شوند
      });

      if (!response.ok) {
        console.log(`API responded with ${response.status}, redirecting to login`);
        const loginUrl = new URL("/auth/login-register", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      const user = await response.json();
      const isAdmin = user.user_type === 1;

      if (!isAdmin) {
        console.log("User is not admin, redirecting to home");
        return NextResponse.redirect(new URL("/", request.url));
      }

      console.log("✅ Admin access granted");
      return NextResponse.next();
    } catch (error) {
      console.error("Middleware auth error:", error);
      const loginUrl = new URL("/auth/login-register", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/admin"],
};