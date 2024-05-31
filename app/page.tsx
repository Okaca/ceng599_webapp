"use client";
// import { cache } from "@/lib/cache";
import Dataprovider from "./dataProvider/dataProvider";
import { ProductCardProps } from "./components/ProductCard";
import MarketList from "./marketList/marketList";
import { useEffect, useState } from "react";
import SideBar from "./components/SideBar";
import CompareList from "./marketList/CompareList";

const dp = new Dataprovider();

function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Month starts from 0, so add 1
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function Home() {
  const [migrosData, setMigrosData] = useState<ProductCardProps[]>([]);
  const [a101Data, setA101Data] = useState<ProductCardProps[]>([]);
  const [getirData, setGetirData] = useState<ProductCardProps[]>([]);
  const [carefourData, setCarefourData] = useState<ProductCardProps[]>([]);
  const [sokData, setSOKData] = useState<ProductCardProps[]>([]);
  const [marketItemsData, setMarketItemsData] = useState<ProductCardProps[]>(
    []
  );
  const [keywordSelected, setKeywordSelected] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const currentDate = getCurrentDate();
      try {
        const migrosMarket = await dp.getMigros(currentDate);
        const a101Market = await dp.getA101(currentDate);
        const getirMarket = await dp.getGetir(currentDate);
        const carefourMarket = await dp.getCarefour(currentDate);
        const sokMarket = await dp.getSokMarket(currentDate);

        setMigrosData(migrosMarket);
        setA101Data(a101Market);
        setGetirData(getirMarket);
        setCarefourData(carefourMarket);
        setSOKData(sokMarket);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false); // Set loading state to false regardless of success or failure
      }
    };

    fetchData();
  }, []);

  const handleKeywordSelect = async (selectedKeyword: {
    main: string;
    sub: string;
  }) => {
    setIsLoading(true);
    setKeywordSelected(true); // Update state to indicate a keyword has been selected
    try {
      console.log("selectedKeyword", selectedKeyword);
      const marketItems = await dp.getMarketItemByKeyword(selectedKeyword);
      setMarketItemsData(marketItems);
      // marketItems returned is an array of ProductCardProps
    } catch (error) {
      console.error("Error fetching data by keyword:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div style={{ display: "flex" }}>
        <div style={{ flex: "0 0 25%", padding: "20px" }}>
          <SideBar onKeywordSelect={handleKeywordSelect} />
        </div>
        <div style={{ flex: "1", padding: "20px" }}>
          {isLoading ? (
            <p>Loading...</p>
          ) : keywordSelected ? (
            <CompareList data={marketItemsData} />
          ) : (
            <div>
              <MarketList marketName="Migros" data={migrosData} />
              <MarketList marketName="A101" data={a101Data} />
              <MarketList marketName="Getir" data={getirData} />
              <MarketList marketName="CareFour" data={carefourData} />
              <MarketList marketName="ŞOK" data={sokData} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
