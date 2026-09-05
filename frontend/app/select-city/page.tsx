"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useFilter } from "@/app/context/FilterContext";
import { City } from "../types/city";

async function fetchCities(): Promise<City[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cities`,
    {
      headers: { Accept: "application/json" },
      cache: "no-cache",
    },
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

function SelectCityPage() {
  const router = useRouter();
  const { isLoading, selectedCities, setSelectedCities } = useFilter();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ اگر حداقل یک شهر انتخاب شده، به صفحه اصلی برو
  useEffect(() => {
    if (!isLoading && selectedCities.length > 0) {
      router.push("/");
    }
  }, [isLoading, selectedCities, router]);

  // دریافت لیست شهرها
  useEffect(() => {
    fetchCities()
      .then((data) => setCities(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSelectCity = (city: City) => {
    setSelectedCities([city]); // فقط این شهر انتخاب شود
    router.push("/");
  };

  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <i className="fa fa-spinner fa-spin text-3xl text-rose-600"></i>
          <p className="text-gray-500">در حال بارگذاری شهرها...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="flex-center flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* جستجوی شهر */}
        <section className="container flex-center mt-3 w-5/6 lg:w-1/2">
          <div className="flex-center-start grow border border-gray-300 rounded-md ps-4 bg-white dark:bg-gray-800 dark:border-gray-600">
            <i className="fa fas fa-search text-gray-400"></i>
            <input
              type="text"
              placeholder="جستجوی شهر"
              name="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ps-2 py-1 my-2 placeholder:text-gray-400 focus:outline-none bg-transparent w-full"
              autoFocus
            />
          </div>
        </section>

        {/* لیست شهرها */}
        <section className="container flex flex-col justify-center lg:w-1/2">
          <header className="flex-center lg:justify-start mt-10">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              {searchTerm ? "نتایج جستجو" : "شهر های پربازدید"}
            </h2>
          </header>
          <section className="flex flex-wrap justify-center text-center my-10 gap-4">
            {filteredCities.length === 0 ? (
              <p className="text-gray-500 w-full">شهری با این نام یافت نشد.</p>
            ) : (
              filteredCities.map((city) => (
                <article
                  key={city.id}
                  className="w-1/3 lg:w-1/5 cursor-pointer"
                >
                  <button
                    onClick={() => handleSelectCity(city)}
                    className="text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 transition py-2 px-4 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 w-full"
                  >
                    {city.name}
                  </button>
                </article>
              ))
            )}
          </section>
        </section>

        {/* نمادهای اعتماد */}
        <section className="flex-center border-t border-gray-300 dark:border-gray-700 py-8 w-5/6 lg:w-1/2">
          <div>
            <a href="#">
              <Image
                src="/images/enamad.png"
                alt="enamad"
                className="size-16"
                width={50}
                height={50}
                loading="eager"
              />
            </a>
          </div>
          <div>
            <a href="#">
              <Image
                src="/images/namad2.png"
                alt="kasbokar"
                className="size-16"
                width={50}
                height={50}
              />
            </a>
          </div>
          <div>
            <a href="#">
              <Image
                src="/images/namad3.png"
                alt="melli"
                className="size-16"
                width={50}
                height={50}
              />
            </a>
          </div>
        </section>
      </main>
    </>
  );
}

export default SelectCityPage;
