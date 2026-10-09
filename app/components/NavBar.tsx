"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef } from "react";
import InstallButton from "./InstallButton";
import SearchBar from "./SearchBar";

// The top bar. Phones: the logo and, on the right, the install button, above a
// full-width search box. From 640 px: the logo on the left, the search box centered on
// the page and the install button on the right; the outer columns are equally wide, so
// the search box stays centered. The logo leads back to all products.
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
      className="sticky top-0 z-30 grid w-full grid-cols-[1fr_auto] items-center gap-2 bg-slate-200 px-3 py-2 sm:grid-cols-[1fr_minmax(0,36rem)_1fr] sm:gap-8 sm:px-8 sm:py-3"
    >
      <Link
        href="/"
        className="col-start-1 row-start-1 justify-self-start whitespace-nowrap text-lg font-bold sm:text-2xl"
      >
        Market Comparer
      </Link>
      {/* SearchBar reads the URL's ?q=, which Next.js only knows in the browser */}
      <div className="col-span-2 row-start-2 sm:col-span-1 sm:col-start-2 sm:row-start-1">
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>
      {/* rightmost; shown only where installing is possible */}
      <div className="col-start-2 row-start-1 justify-self-end sm:col-start-3">
        <InstallButton />
      </div>
    </div>
  );
};

export default NavBar;
