"use client";
import Dataprovider from "./dataProvider/dataProvider";
import MarketList from "./marketList/marketList";
import { useEffect, useState } from "react";
import SideBar from "./components/SideBar";
import CompareList from "./marketList/CompareList";
import { MARKETS, MARKET_LABELS, MarketName, Product } from "./types";

const dp = new Dataprovider();

export default function Home() {
  // Each market's products, filled in as its request finishes
  const [marketData, setMarketData] = useState<Partial<Record<MarketName, Product[]>>>({});
  const [marketItemsData, setMarketItemsData] = useState<Product[]>([]);
  const [keywordSelected, setKeywordSelected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // All five requests start at once, without awaiting one another; each market
    // is shown as soon as its own response arrives. The API defaults to today's
    // Istanbul date, the day the scraper files prices under.
    MARKETS.forEach(async (market) => {
      const products: Product[] = await dp.getMarket(market);
      setMarketData((loaded) => ({ ...loaded, [market]: products }));
    });
  }, []);

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
            <div>
              {MARKETS.map((market) => {
                const products = marketData[market];
                return products ? (
                  <MarketList key={market} marketName={MARKET_LABELS[market]} data={products} />
                ) : (
                  <p key={market}>Loading {MARKET_LABELS[market]}...</p>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
