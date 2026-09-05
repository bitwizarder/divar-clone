import UserAdsCreateForm from "@/app/components/ui/panel/UserAdsCreateForm";

export default function CreateAdvertisementPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          ایجاد آگهی جدید
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          اطلاعات آگهی خود را وارد کنید. پس از بررسی، آگهی شما منتشر خواهد شد.
        </p>
      </div>
      <UserAdsCreateForm />
    </div>
  );
}
