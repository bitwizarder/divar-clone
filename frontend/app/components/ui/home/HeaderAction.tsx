"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LoginButton from "../login/LoginButton";
import LoginModal from "../login/LoginModal";
import { useAuth } from "@/app/context/AuthContext";

function HeaderAction() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateAdClick = () => {
    if (isAuthenticated) {
      // کاربر لاگین است → هدایت به صفحه ایجاد آگهی
      router.push("/panel/advertisements/create");
    } else {
      // کاربر لاگین نیست → باز کردن مودال ورود
      setIsModalOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    // پس از لاگین موفق، به صفحه ایجاد آگهی برو
    setIsModalOpen(false);
    router.push("/panel/advertisements/create");
  };

  return (
    <>
      <button
        onClick={handleCreateAdClick}
        className="bg-rose-700 px-5 py-3 rounded text-white font-bold hover:bg-rose-800 transition-colors"
      >
        ثبت آگهی
      </button>

      <LoginButton />

      {/* مودال ورود (در صورت نیاز) */}
      <LoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
}

export default HeaderAction;
