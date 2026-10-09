import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import Pager from "../components/Pager";
import Dataprovider from "../dataProvider/dataProvider";
import { DEFAULT_PAGE_SIZE, MARKET_LABELS, MarketName, ProductPage } from "../types";

interface MarketListProps {
  market: MarketName;
}

const dp = new Dataprovider();

// All of one market's products, fetched from the API one page at a time. The home
// page shows one per market; searches and categories use GroupList instead.
const MarketList: React.FC<MarketListProps> = ({ market }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [data, setData] = useState<ProductPage | null>(null);

  useEffect(() => {
    // A response that arrives after the user moved to another page is dropped,
    // so a slow earlier request can't overwrite the page they're looking at
    let current = true;
    dp.getProducts({ market, page, pageSize }).then((result: ProductPage) => {
      if (current) setData(result);
    });
    return () => {
      current = false;
    };
  }, [market, page, pageSize]);

  const changePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  return (
    <div className="mb-5">
      {/* Sticks just below the top bar, whose height differs per screen size; z-20
          keeps it under the top bar (z-30) and the category drawer (z-50) */}
      <div
        className="sticky z-20 flex w-full items-center justify-center bg-white py-3 sm:py-5"
        style={{ top: "var(--nav-height)" }}
      >
        <h1
          className="text-xl font-bold sm:text-[25px]"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          {MARKET_LABELS[market]}
        </h1>
      </div>
      {data ? (
        <div>
          {/* 2 cards per row on phones, up to 6 on wide screens */}
          <div className="grid grid-cols-2 gap-3 p-2 sm:grid-cols-3 sm:gap-6 sm:p-6 md:grid-cols-4 xl:grid-cols-6 xl:gap-8 xl:p-8">
            {data.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Pager
            page={page}
            pageSize={pageSize}
            total={data.total}
            onPageChange={setPage}
            onPageSizeChange={changePageSize}
          />
        </div>
      ) : (
        <p className="text-center">Loading...</p>
      )}
    </div>
  );
};

export default MarketList;
