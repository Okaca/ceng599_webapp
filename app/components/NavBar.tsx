"use client";

import Link from "next/link";
import { Suspense } from "react";
import SearchBar from "./SearchBar";

// The top bar: the logo on the left leads back to all products, and the search box
// is centered on the page. The empty right column is as wide as the logo's, which
// keeps the middle column in the center.
const NavBar = () => {
  return (
    <div className="sticky top-0 z-30 grid w-full grid-cols-[1fr_minmax(0,36rem)_1fr] items-center gap-8 bg-slate-200 px-8 py-3">
      <Link
        href="/"
        className="justify-self-start whitespace-nowrap"
        style={{ fontWeight: "bold", fontSize: "1.5rem" }}
      >
        Market Comparer
      </Link>
      {/* SearchBar reads the URL's ?q=, which Next.js only knows in the browser */}
      <Suspense>
        <SearchBar />
      </Suspense>
      <div />
    </div>
  );
};

export default NavBar;
