"use client";
import MarketList from "./marketList/marketList";
import { useState } from "react";
import SideBar from "./components/SideBar";
import { Category, MARKETS } from "./types";

export default function Home() {
  // null shows every category
  const [category, setCategory] = useState<Category | null>(null);

  return (
    <>
      <div style={{ display: "flex" }}>
        <div style={{ flex: "0 0 25%", padding: "20px" }}>
          <SideBar selected={category} onCategorySelect={setCategory} />
        </div>
        <div style={{ flex: "1", padding: "20px" }}>
          {category && (
            <h1 className="text-center text-2xl font-bold">{category.name}</h1>
          )}
          {/* Every MarketList fetches its own first page as soon as it mounts, so
              all five requests run at the same time and each market appears as
              soon as its own response arrives. The API defaults to the day each
              market was last scraped. Keying on the
              category starts each list from page 1 when the category changes. */}
          <div>
            {MARKETS.map((market) => (
              <MarketList
                key={`${market}-${category?.slug ?? ""}`}
                market={market}
                category={category?.slug}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
