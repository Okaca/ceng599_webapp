"use client";
import Dataprovider from "./dataProvider/dataProvider";
import MarketList from "./marketList/marketList";
import { useState } from "react";
import SideBar from "./components/SideBar";
import CompareList from "./marketList/CompareList";
import { MARKETS, Product } from "./types";

const dp = new Dataprovider();

export default function Home() {
  const [marketItemsData, setMarketItemsData] = useState<Product[]>([]);
  const [keywordSelected, setKeywordSelected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleKeywordSelect = async (selectedKeyword: {
    main: string;
    sub: string;
  }) => {
    setIsSearching(true);
    setKeywordSelected(true); // Update state to indicate a keyword has been selected
    try {
      setMarketItemsData(await dp.getMarketItemByKeyword(selectedKeyword));
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      <div style={{ display: "flex" }}>
        <div style={{ flex: "0 0 25%", padding: "20px" }}>
          <SideBar onKeywordSelect={handleKeywordSelect} />
        </div>
        <div style={{ flex: "1", padding: "20px" }}>
          {keywordSelected ? (
            isSearching ? (
              <p>Loading...</p>
            ) : (
              <CompareList data={marketItemsData} />
            )
          ) : (
            // Every MarketList fetches its own first page as soon as it mounts, so
            // all five requests run at the same time and each market appears as
            // soon as its own response arrives. The API defaults to today's
            // Istanbul date, the day the scraper files prices under.
            <div>
              {MARKETS.map((market) => (
                <MarketList key={market} market={market} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
