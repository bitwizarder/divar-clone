"use client";
import Image from "next/image";
import MenuList from "./MenuList";
import StateModal from "./StateModal";
import { useFilter } from "@/app/context/FilterContext";

interface SidebarProps {
  categoryList: React.ReactNode; // از والد سروری دریافت می‌شود
  menuList: React.ReactNode;
}
function Sidebar({ categoryList, menuList }: SidebarProps) {
  const {
    priceMin,
    setPriceMin,
    priceMax,
    setPriceMax,
    hasImage,
    setHasImage,
    isUrgent,
    setIsUrgent,
  } = useFilter();

  // ✅ تعریف گزینه‌های قیمت
  const priceOptions = [
    100000, 500000, 1000000, 5000000, 10000000, 50000000, 100000000,
  ];

  return (
    <aside className="w-1/5 hidden lg:block">
      <section>
        <header className="mb-5">
          <h5 className="font-bold text-sm">دسته ها</h5>
        </header>
        {categoryList}
      </section>

      {/* فیلتر محل */}
      <section className="border-t-2 border-gray-300 pt-5 mt-5">
        <div className="px-4 py-2">
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer list-none transition-colors duration-200">
              <span>محل</span>
              <span className="transition-transform duration-200 text-gray-500 group-open:rotate-180">
                <i className="fa fa-angle-down"></i>
              </span>
            </summary>
            <div className="space-y-2 mt-4">
              <StateModal />
            </div>
          </details>
        </div>
      </section>

      {/* فیلتر قیمت */}
      <section className="border-t-2 border-gray-300 pt-5 mt-5">
        <div className="px-4 py-2">
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer list-none transition-colors duration-200">
              <span>قیمت</span>
              <span className="transition-transform duration-200 text-gray-500 group-open:rotate-180">
                <i className="fa fa-angle-down"></i>
              </span>
            </summary>
            <div className="space-y-2 mt-4">
              <div className="px-5 py-4 space-y-3">
                {/* از */}
                <section className="flex-center-between gap-x-5">
                  <div>
                    <p className="text-sm">از</p>
                  </div>
                  <div className="grow">
                    <select
                      value={priceMin ?? ""}
                      onChange={(e) =>
                        setPriceMin(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                      className="w-full border py-1 px-2 text-gray-400 rounded"
                    >
                      <option value="">انتخاب</option>
                      {priceOptions.map((p) => (
                        <option key={p} value={p}>
                          {p.toLocaleString()} تومان
                        </option>
                      ))}
                    </select>
                  </div>
                </section>

                <section className="w-4 rotate-90 mx-auto text-gray-300">
                  ...
                </section>

                {/* تا */}
                <section className="flex-center-between gap-x-5">
                  <div>
                    <p className="text-sm">تا</p>
                  </div>
                  <div className="grow">
                    <select
                      value={priceMax ?? ""}
                      onChange={(e) =>
                        setPriceMax(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                      className="w-full border py-1 px-2 text-gray-400 rounded"
                    >
                      <option value="">انتخاب</option>
                      {priceOptions.map((p) => (
                        <option key={p} value={p}>
                          {p.toLocaleString()} تومان
                        </option>
                      ))}
                    </select>
                  </div>
                </section>
              </div>
            </div>
          </details>
        </div>
      </section>

      {/* فیلتر وضعیت آگهی */}
      <section className="border-t-2 border-gray-300 pt-5 mt-5">
        <div className="px-4 py-2">
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer list-none transition-colors duration-200">
              <span>وضعیت آگهی</span>
              <span className="transition-transform duration-200 text-gray-500 group-open:rotate-180">
                <i className="fa fa-angle-down"></i>
              </span>
            </summary>
            <div className="space-y-2 mt-4">
              <section className="space-y-5 px-2">
                {/* عکس دار */}
                <div className="flex w-full items-center justify-between">
                  <label
                    className="grow inline-block hover:cursor-pointer text-sm"
                    htmlFor="hasImage"
                  >
                    عکس دار
                  </label>
                  <input
                    type="checkbox"
                    id="hasImage"
                    checked={hasImage}
                    onChange={(e) => setHasImage(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                </div>

                {/* فقط فوری‌ها */}
                <div className="flex w-full items-center justify-between">
                  <label
                    className="grow inline-block hover:cursor-pointer text-sm"
                    htmlFor="isUrgent"
                  >
                    فقط فوری‌ها
                  </label>
                  <input
                    type="checkbox"
                    id="isUrgent"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                </div>
              </section>
            </div>
          </details>
        </div>
      </section>

      <footer className="border-t-2 border-gray-300 text-gray pt-5 mt-5">
        <section>
          <ul className="flex flex-wrap  gap-4">
            {/* <MenuList /> */}
            {menuList}
          </ul>
        </section>
        <section className="flex-center py-8 space-x-7">
          <div>
            <a href="#">
              <i className="fa fab fa-youtube-square text-2xl"></i>
            </a>
          </div>
          <div>
            <a href="#">
              <i className="fa-brands fa-linkedin text-2xl"></i>
            </a>
          </div>
          <div>
            <a href="#">
              <i className="fa fab fa-twitter-square text-2xl"></i>
            </a>
          </div>
          <div>
            <a href="#">
              <i className="fa-brands fa-instagram text-2xl"></i>
            </a>
          </div>
        </section>
        <section className="flex-center mt-4 space-x-4">
          <div>
            <a href="#">
              <Image
                src="/images/enamad.png"
                alt="enamad"
                className="size-24 object-contain"
                width={100}
                height={100}
                loading="eager"
              />
            </a>
          </div>
          <div>
            <a href="#">
              <Image
                src="/images/namad2.png"
                alt="kasbokar"
                className="size-24 object-contain"
                width={100}
                height={100}
              />
            </a>
          </div>
          <div>
            <a href="#">
              <Image
                src="/images/namad3.png"
                alt="melli"
                className="size-24 object-contain"
                width={100}
                height={100}
              />
            </a>
          </div>
        </section>
      </footer>
    </aside>
  );
}

export default Sidebar;
