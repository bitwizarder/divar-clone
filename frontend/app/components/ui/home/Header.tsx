import Image from "next/image";
import React from "react";

function Header() {
  return (
    <header>
      <section className="container flex-center">
        <Image
          src="/images/logo.png"
          alt="Divar-Logo"
          className="size-16 my-4"
          width={50}
          height={50}
        />
      </section>
      <section className="border-b border-gray-300">
        <nav className="container flex justify-around space-x-1 text-gray text-xs md:text-sm lg:text-lg font-light pb-3">
          <a href="#">ثبت آگهی</a>
          <a href="#">درباره دیوار</a>
          <a href="#">دریافت برنامه</a>
          <a href="#">اتاق خبر</a>
          <a href="#">پشتیبانی</a>
        </nav>
      </section>
    </header>
  );
}

export default Header;
