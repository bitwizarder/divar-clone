"use client";

import React, { useEffect, useState } from "react";

type Theme = "light" | "dark";

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("admin-theme") as Theme | null;

    const initialTheme: Theme =
      savedTheme === "dark" || savedTheme === "light"
        ? savedTheme
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

    document.documentElement.setAttribute("data-theme", initialTheme);
    setTheme(initialTheme);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme: Theme = theme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("admin-theme", newTheme);

    setTheme(newTheme);
  };

  if (!mounted) {
    return (
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/70"
        aria-label="تغییر حالت نمایش"
      >
        <i className="fa fa-adjust"></i>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="
        group
        relative
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-xl
        border
        border-color
        bg-surface
        text-secondary
        shadow-sm
        transition-all
        duration-200
        hover:border-accent
        hover:text-primary
      "
      aria-label={
        theme === "dark" ? "فعال کردن حالت روشن" : "فعال کردن حالت تاریک"
      }
      title={theme === "dark" ? "حالت روشن" : "حالت تاریک"}
    >
      <i
        className={`fa ${
          theme === "dark" ? "fa-sun" : "fa-moon"
        } text-base transition-transform duration-300 group-hover:scale-110`}
      ></i>
    </button>
  );
}

export default ThemeToggle;
