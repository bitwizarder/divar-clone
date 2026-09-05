"use client";

import { useParams } from "next/navigation";
import UserAdsEditForm from "@/app/components/ui/panel/UserAdsEditForm";

export default function EditAdvertisementPage() {
  const params = useParams();
  const id = Number(params.id);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          ویرایش آگهی
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          اطلاعات آگهی خود را ویرایش کنید.
        </p>
      </div>
      <UserAdsEditForm advertisementId={id} />
    </div>
  );
}
