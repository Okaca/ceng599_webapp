"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Dataprovider from "../dataProvider/dataProvider";
import { MARKET_LABELS, Suggestions } from "../types";

const dp = new Dataprovider();

const NO_SUGGESTIONS: Suggestions = { categories: [], products: [] };

// One row of the suggestion list, and where choosing it leads
interface Option {
  key: string;
  label: string;
  detail: string;
  href: string;
}

// The search box in the top bar. While the user types it suggests searching every
// market, matching categories and matching products; a search goes to /?q=...
const SearchBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = pathname === "/" ? searchParams.get("q") ?? "" : "";

  const [text, setText] = useState(urlQuery);
  const [suggestions, setSuggestions] = useState<Suggestions>(NO_SUGGESTIONS);
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);

  // Show the search of the current page, and clear the box when leaving it
  useEffect(() => {
    setText(urlQuery);
  }, [urlQuery]);

  // Ask for suggestions once the user pauses typing; drop answers that arrive
  // after the text has changed again
  useEffect(() => {
    const query = text.trim();
    if (query.length < 2) {
      setSuggestions(NO_SUGGESTIONS);
      return;
    }
    let current = true;
    const timer = setTimeout(() => {
      dp.getSuggestions(query).then((result: Suggestions) => {
        if (current) setSuggestions(result);
      });
    }, 200);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [text]);

  const query = text.trim();
  const options: Option[] = [];
  if (query.length >= 2) {
    options.push({
      key: "search",
      label: `"${query}"`,
      detail: "tüm marketlerde ara",
      href: `/?q=${encodeURIComponent(query)}`,
    });
  }
  for (const category of suggestions.categories) {
    options.push({
      key: `category-${category.slug}`,
      label: category.name,
      detail: category.parent ? `${category.parent} kategorisi` : "kategori",
      href: `/?category=${encodeURIComponent(category.slug)}`,
    });
  }
  for (const product of suggestions.products) {
    options.push({
      key: `product-${product.id}`,
      label: product.name,
      detail: MARKET_LABELS[product.market],
      href: `/product/?id=${product.id}`,
    });
  }

  const choose = (option: Option) => {
    setIsOpen(false);
    router.push(option.href);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      setHighlighted((index) => (index + step + options.length) % Math.max(options.length, 1));
    } else if (event.key === "Enter") {
      // Enter without moving through the list searches the typed text
      const option = isOpen ? options[highlighted] : options[0];
      if (option) choose(option);
    } else if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="search"
        value={text}
        placeholder="Ürün ara, ör. starking elma"
        aria-label="Ürün ara"
        className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-gray-500"
        onChange={(event) => {
          setText(event.target.value);
          setHighlighted(0);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onKeyDown={handleKeyDown}
      />
      {isOpen && options.length > 0 && (
        <ul className="absolute left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {options.map((option, index) => (
            <li
              key={option.key}
              className={`flex cursor-pointer items-baseline justify-between gap-4 px-4 py-2 ${
                index === highlighted ? "bg-gray-100" : ""
              }`}
              // mousedown fires before the input's blur, which would close the list first
              onMouseDown={(event) => {
                event.preventDefault();
                choose(option);
              }}
              onMouseEnter={() => setHighlighted(index)}
            >
              <span className="truncate">{option.label}</span>
              <span className="shrink-0 text-small text-gray-500">{option.detail}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
