"use client";
import { useEffect, useState } from "react";
import Dataprovider from "../dataProvider/dataProvider";
import { Category } from "../types";

const dp = new Dataprovider();

interface SideBarProps {
  selected: Category | null;
  onCategorySelect: (category: Category | null) => void;
}

// The category tree from the API: main > sub. Clicking a category selects
// it and opens its subcategories.
const SideBar: React.FC<SideBarProps> = ({ selected, onCategorySelect }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  // slugs of the categories whose children are shown
  const [open, setOpen] = useState<Set<string>>(new Set());

  useEffect(() => {
    dp.getCategories().then(setCategories);
  }, []);

  const handleClick = (category: Category) => {
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(category.slug)) next.delete(category.slug);
      else next.add(category.slug);
      return next;
    });
    onCategorySelect(category);
  };

  const renderCategory = (category: Category, depth: number) => (
    <div key={category.slug}>
      <div
        className={`flex items-center justify-between py-2 pr-4 cursor-pointer hover:bg-gray-700 ${
          selected?.slug === category.slug ? "bg-gray-700 font-bold" : ""
        }`}
        style={{ paddingLeft: `${16 + depth * 16}px` }}
        onClick={() => handleClick(category)}
      >
        <span>{category.name}</span>
        {category.children.length > 0 && (
          <svg
            className={`w-5 h-5 transform transition-transform ${
              open.has(category.slug) ? "rotate-90" : ""
            }`}
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
