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
    <div style={{ marginBottom: "20px" }}>
      <div
        style={{
          position: "sticky",
          top: 68,
          width: "100%",
          background: "white",
          zIndex: 999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "10vh",
        }}
      >
        <h1
          style={{
            fontWeight: "bold",
            fontFamily: "Arial, sans-serif",
            fontSize: "25px",
          }}
        >
          {MARKET_LABELS[market]}
        </h1>
      </div>
      {data ? (
        <div>
          <div className="grid grid-cols-6 gap-8 p-8">
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
