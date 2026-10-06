import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import Pager from "../components/Pager";
import Dataprovider from "../dataProvider/dataProvider";
import { DEFAULT_PAGE_SIZE, MARKET_LABELS, MarketName, ProductPage } from "../types";

interface MarketListProps {
  market: MarketName;
  category?: string; // a category slug; all categories when omitted
  q?: string; // words the product names must contain
  onTotal?: (total: number) => void; // told how many products match, once known
}

const dp = new Dataprovider();

// One market's products, optionally of one category and matching a search, fetched
// from the API one page at a time
const MarketList: React.FC<MarketListProps> = ({ market, category, q, onTotal }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [data, setData] = useState<ProductPage | null>(null);

  useEffect(() => {
    // A response that arrives after the user moved to another page is dropped,
    // so a slow earlier request can't overwrite the page they're looking at
    let current = true;
    dp.getProducts({ market, category, q, page, pageSize }).then((result: ProductPage) => {
      if (current) {
        setData(result);
        onTotal?.(result.total);
      }
    });
    return () => {
      current = false;
    };
    // onTotal is left out: a new function each render of the parent would refetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market, category, q, page, pageSize]);

  const changePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  // A market with nothing in the chosen category or search is left out of the comparison
  if ((category || q) && data?.total === 0) return null;

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
