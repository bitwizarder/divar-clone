import Image from "next/image";
import React from "react";

function HeaderAds() {
  return (
    <>
      <header className="lg:hidden bg-gray-100 sticky top-0 right-0 left-0 shadow-md">
        <div className="container flex-center-between py-4">
          <section className="text-lg">
            <a href="#">
              <i className="fa fa-arrow-right text-gray"></i>
            </a>
          </section>
          <section className="flex space-x-5 text-lg">
            <div>
              <a href="#" title="نشان کردن">
                <i className="fa fa-bookmark text-gray"></i>
              </a>
            </div>
            <div>
              <a href="#" title="یادداشت گذاری">
                <i className="fa fa-plus text-gray"></i>
              </a>
            </div>
            <div>
              <a href="#" title="اشتراک گذاری">
                <i className="fa fa-share-alt text-gray"></i>
              </a>
            </div>
          </section>
        </div>
      </header>

      <header className="hidden lg:block border-b-2 border-gray-200">
        <section className="container w-full flex-center lg:px-4 py-3 lg:space-x-8 xl:space-x-12">
          <section className="hidden lg:flex">
            <Image
              src="/images/logo.png"
              alt="logo"
              className="size-12"
              width={48}
              height={48}
              loading="eager"
            />
          </section>
          <section className="hidden lg:flex-center">
            <button className="text-gray-600 space-x-1 text-sm flex flex-nowrap shrink-0">
              <i className="fa fa-map-marker text-gray content-center"></i>
              <span>تهران</span>
            </button>
          </section>

          <section className="hidden lg:flex">
            <button className="text-gray-600 space-x-1 text-sm flex flex-nowrap shrink-0">
              <i className="fa fa-list-ul -scale-x-90 text-gray content-center"></i>
              <span>دسته ها</span>
              <i className="fa fa-angle-down text-gray content-center"></i>
            </button>
          </section>

          <section className="container lg:me-auto lg:w-2/6 flex-center bg-gray-100 rounded-full lg:rounded">
            <div className="flex-center-start grow border-l lg:border-0 border-gray-300">
              <i className="fa fas fa-search text-gray-400"></i>
              <input
                type="text"
                placeholder="جستجو در همه آگهی ها"
                className="grow ps-2 py-2 lg:py-1 my-2 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
            <div className="lg:hidden mx-1 space-x-1 shrink-0 whitespace-nowrap ms-4">
              <button className="text-gray-600">تهران</button>
              <i className="fa fas fas fa-map-marker text-gray-400"></i>
            </div>
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

          <section className="hidden lg:flex text-gray shrink-0">
            <button className="bg-rose-700 px-5 py-3 rounded text-white font-bold">
              <p>ثبت آگهی</p>
            </button>
          </section>
        </section>
      </header>
    </>
  );
}

export default HeaderAds;
