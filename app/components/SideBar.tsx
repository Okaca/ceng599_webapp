"use client";
import { useEffect, useState } from "react";
import { Category } from "../types";

interface SideBarProps {
  categories: Category[];
  selected: string | null; // the selected category's slug
  onCategorySelect: (slug: string | null) => void;
}

// The category tree: main > sub. Clicking a category selects it and opens its
// subcategories; clicking the selected one again closes it. The arrow only opens
// and closes.
const SideBar: React.FC<SideBarProps> = ({ categories, selected, onCategorySelect }) => {
  // slugs of the categories whose subcategories are shown
  const [open, setOpen] = useState<Set<string>>(new Set());

  // A selected subcategory opens its main category, also when it was picked from
  // the search bar; nothing closes a category except the user
  useEffect(() => {
    if (!selected?.includes("/")) return;
    const main = selected.split("/")[0];
    setOpen((current) => (current.has(main) ? current : new Set(current).add(main)));
  }, [selected]);

  const toggle = (slug: string, isOpen: boolean) =>
    setOpen((current) => {
      const next = new Set(current);
      if (isOpen) next.add(slug);
      else next.delete(slug);
      return next;
    });

  const handleClick = (category: Category) => {
    if (category.children.length > 0) {
      const isOpen = open.has(category.slug);
      // Opens a closed category; closes it only when it is already the selected one
      toggle(category.slug, !(isOpen && selected === category.slug));
    }
    onCategorySelect(category.slug);
  };

  const renderCategory = (category: Category, depth: number) => (
    <div key={category.slug}>
      <div
        className={`flex items-center justify-between py-2 pr-4 cursor-pointer hover:bg-gray-700 ${
          selected === category.slug ? "bg-gray-700 font-bold" : ""
        }`}
        style={{ paddingLeft: `${16 + depth * 16}px` }}
        onClick={() => handleClick(category)}
      >
        <span>{category.name}</span>
        {category.children.length > 0 && (
          <svg
            className={`w-5 h-5 shrink-0 transform transition-transform ${
              open.has(category.slug) ? "rotate-90" : ""
            }`}
            onClick={(event) => {
              // only open or close, without selecting the category
              event.stopPropagation();
              toggle(category.slug, !open.has(category.slug));
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        )}
      </div>
      {open.has(category.slug) &&
        category.children.map((child) => renderCategory(child, depth + 1))}
    </div>
  );

  return (
    <div className="w-full h-auto bg-gray-800 text-white flex flex-col">
      <div
        className={`px-4 py-2 cursor-pointer hover:bg-gray-700 ${
          selected === null ? "bg-gray-700 font-bold" : ""
        }`}
        onClick={() => onCategorySelect(null)}
      >
        Tüm Ürünler
      </div>
      {categories.map((category) => renderCategory(category, 0))}
    </div>
  );
};

export default SideBar;
