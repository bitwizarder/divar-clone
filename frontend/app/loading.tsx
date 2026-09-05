export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center space-y-6">
        {/* اسپینر دایره‌ای با حاشیه‌های رنگی */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin" />
          {/* یک حلقه‌ی محو (اختیاری) برای زیبایی بیشتر */}
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-300/30 dark:border-t-blue-500/30 rounded-full animate-spin" style={{ animationDuration: '1.5s' }} />
        </div>

        <div className="text-center">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            در حال بارگذاری...
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            لطفاً چند لحظه صبر کنید
          </p>
        </div>
      </div>
    </div>
  );
}