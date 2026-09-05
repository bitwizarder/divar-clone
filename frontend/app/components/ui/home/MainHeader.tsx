import Image from "next/image";
import React from "react";
import { fetchCities } from "./CityList";
import CityModal from "./CityModal";
import CategoryModal from "./CategoryModal";
import Link from "next/link";
import HeaderAction from "./HeaderAction";
import SearchBox from "./SearchBox";
import { fetchCategories } from "@/app/lib/api/categories";

async function MainHeader() {
  const cities = await fetchCities();
  const categories = await fetchCategories();

  return (
    <header className="border-b-2 border-gray-200">
      <section className="container w-full flex-center lg:px-4 py-3 lg:space-x-8 xl:space-x-12">
        <section className="hidden lg:flex">
          <Link href="/">
            <Image
              src="/images/logo.png"
              alt="logo"
              className="size-12 object-contain"
              width={50}
              height={50}
              loading="eager"
            />
          </Link>
        </section>
        <section className="hidden lg:flex-center">
          <CityModal cities={cities} />
        </section>

        <section className="hidden lg:flex">
          <CategoryModal categories={categories} />
        </section>

        {/* جستجو */}
        <section className="container lg:me-auto lg:w-2/6 flex-center bg-gray-100 rounded-full lg:rounded relative">
          <SearchBox />
        </section>

        <section className="hidden lg:flex text-gray ms-8">
          <button className="text-gray-600 space-x-2 text-xl flex flex-nowrap shrink-0">
            <i className="fa fa-user text-gray"></i>
            <span className="text-sm">دیوار من</span>
          </button>
        </section>

        <section className="hidden lg:flex text-gray">
          <button className="text-gray-600 space-x-2 text-xl flex flex-nowrap shrink-0">
            <i className="fa fa-comment text-gray"></i>
            <span className="text-sm">چت</span>
          </button>
        </section>

        <section className="hidden lg:flex text-gray">
          <button className="text-gray-600 space-x-2 text-xl flex flex-nowrap shrink-0">
            <i className="fa fa-headset text-gray"></i>
            <span className="text-sm">پشتیبانی</span>
          </button>
        </section>

        <section className="hidden lg:flex gap-2 text-gray shrink-0">
          <HeaderAction />
        </section>
      </section>
    </header>
  );
}

export default MainHeader;