"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-page text-primary">
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex min-h-screen">
        <aside
          className={`
            fixed inset-y-0 right-0 z-50 w-72 transform border-l border-color bg-secondary shadow-xl transition-transform duration-300 ease-in-out
            lg:static lg:z-auto lg:w-64 lg:translate-x-0 lg:shadow-none
            ${sidebarOpen ? "translate-x-0" : "translate-x-full"}
          `}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <Header onMenuClick={() => setSidebarOpen((prev) => !prev)} />
          <main className="flex-1 p-4 sm:p-6">
            <div className="mx-auto w-full max-w-[1600px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
export default AdminShell;
