<div dir="rtl">

# کلون دیوار

یک مارکت‌پلیس کامل برای درج و جست‌وجوی آگهی، ساخته‌شده با Laravel و Next.js.

برای مطالعه راهنمای انگلیسی، [README.md](README.md) را ببینید.

## امکانات

- جست‌وجو و نمایش آگهی‌ها بر اساس دسته‌بندی، موقعیت و وضعیت
- صفحه جزئیات آگهی، گالری تصاویر، علاقه‌مندی‌ها، یادداشت‌ها و تاریخچه بازدید
- ثبت‌نام و ورود کاربران با تأیید OTP
- پنل کاربری برای ایجاد، ویرایش و مدیریت آگهی‌ها
- پنل مدیریت برای مدیریت کاربران، آگهی‌ها، دسته‌بندی‌ها، ویژگی‌ها، صفحات و تنظیمات
- گفت‌وگوی خصوصی بین کاربران مرتبط با آگهی
- ارسال لحظه‌ای پیام و وضعیت خوانده‌شدن با WebSocket
- جریان پرداخت و صفحه بازگشت موفقیت‌آمیز
- حذف نرم، سطل زباله، عملیات گروهی و پردازش تصاویر

## فناوری‌ها

| بخش            | فناوری                                         |
| -------------- | ---------------------------------------------- |
| Frontend       | Next.js 16، React 19، TypeScript، Tailwind CSS |
| Backend        | PHP 8.3+، Laravel 13، Sanctum                  |
| ارتباط لحظه‌ای | Laravel Reverb، Laravel Echo، Pusher JS        |
| پایگاه‌داده    | هر پایگاه‌داده سازگار با Laravel               |
| ابزارها        | Composer، npm، Pest، Laravel Pint، ESLint      |

## پیش‌نیازها

- PHP نسخه 8.3 یا بالاتر
- Composer
- Node.js نسخه 20 یا بالاتر و npm
- یک پایگاه‌داده سازگار با Laravel

## نصب و اجرا

### ۱. دریافت پروژه

```bash
git clone https://github.com/bitwizarder/divar-clone.git
cd divar-clone
```

### ۲. راه‌اندازی Backend

```bash
cd backend
composer install
php artisan key:generate
php artisan migrate
php artisan storage:link
```

فایل `backend/.env` را بسازید و تنظیمات پایگاه‌داده، آدرس برنامه، دامنه‌های مجاز Sanctum و CORS را در آن وارد کنید. این فایل نباید در Git commit شود.

### ۳. راه‌اندازی Frontend

فایل `frontend/.env.local` را با مقادیر محلی خود بسازید:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_REVERB_APP_KEY=my-app-key
NEXT_PUBLIC_REVERB_HOST=127.0.0.1
NEXT_PUBLIC_REVERB_PORT=8080
NEXT_PUBLIC_REVERB_SCHEME=http
```

سپس وابستگی‌ها را نصب کنید:

```bash
cd ../frontend
npm install
```

### ۴. اجرای سرویس‌ها

در ترمینال‌های جداگانه اجرا کنید:

```bash
# Backend API
cd backend
php artisan serve
```

```bash
# Frontend
cd frontend
npm run dev
```

برای فعال‌سازی چت لحظه‌ای، Reverb را نیز اجرا کنید:

```bash
cd backend
php artisan reverb:start
```

برنامه در آدرس [http://localhost:3000](http://localhost:3000) در دسترس خواهد بود.

## بررسی کیفیت

```bash
# تست‌های Backend
cd backend
php artisan test

# قالب‌بندی PHP
./vendor/bin/pint

# بررسی Frontend
cd ../frontend
npm run lint
```

## ساختار پروژه

```text
.
├── backend/       # API لاراول، احراز هویت، Broadcast و منطق مدیریت
├── frontend/      # برنامه Next.js و رابط کاربری کاربر و مدیر
├── backend/routes/ # مسیرهای API، احراز هویت و Broadcast
└── frontend/app/  # صفحات، Layoutها و کامپوننت‌های رابط کاربری
```

## نکات امنیتی

هرگز اطلاعات واقعی پایگاه‌داده، کلیدهای API، رمزهای Reverb یا فایل‌های production `.env` را commit نکنید.

## لایسنس

این پروژه با لایسنس MIT منتشر می‌شود. متن کامل مجوز در فایل `LICENSE` قرار دارد.

</div>
