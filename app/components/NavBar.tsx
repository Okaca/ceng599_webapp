"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef } from "react";
import SearchBar from "./SearchBar";

// The top bar. Phones: the logo above a full-width search box. From 640 px: the logo
// on the left and the search box centered on the page, as the empty right column is
// as wide as the logo's. The logo leads back to all products.
const NavBar = () => {
  const bar = useRef<HTMLDivElement>(null);

  // The bar's height differs per screen size, so it publishes it as --nav-height for
  // headers that stick just below it (marketList.tsx)
  useEffect(() => {
    const element = bar.current;
    if (!element) return;
    const publish = () =>
      document.documentElement.style.setProperty(
        "--nav-height",
        `${element.offsetHeight}px`,
      );
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={bar}
      className="sticky top-0 z-30 flex w-full flex-col gap-2 bg-slate-200 px-3 py-2 sm:grid sm:grid-cols-[1fr_minmax(0,36rem)_1fr] sm:items-center sm:gap-8 sm:px-8 sm:py-3"
    >
      <Link
        href="/"
        className="whitespace-nowrap text-lg font-bold sm:justify-self-start sm:text-2xl"
      >
        Market Comparer
      </Link>
      {/* SearchBar reads the URL's ?q=, which Next.js only knows in the browser */}
      <Suspense>
        <SearchBar />
      </Suspense>
      <div className="hidden sm:block" />
    </div>
  );
};

export default NavBar;
