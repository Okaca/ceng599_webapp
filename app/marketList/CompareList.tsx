import React, { useState } from "react";
import ProductCard from "../components/ProductCard";
import Pager from "../components/Pager";
import { DEFAULT_PAGE_SIZE, MARKETS, MARKET_LABELS, MarketName, Product } from "../types";

interface CompareListProps {
  data: Product[];
}

// One market's search results, paged in the browser: a search returns every
// match at once, at most a few hundred, so there's no need to ask the API per page
const MarketResults: React.FC<{ market: MarketName; products: Product[] }> = ({
  market,
  products,
}) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const changePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  return (
    <div className="mb-8">
      <h1
        className="text-center"
        style={{
          fontWeight: "bold",
          fontFamily: "Arial, sans-serif",
          fontSize: "25px",
        }}
      >
        {MARKET_LABELS[market]}
      </h1>
      <div className="grid grid-cols-6 gap-8 py-8">
        {products.slice((page - 1) * pageSize, page * pageSize).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <Pager
        page={page}
        pageSize={pageSize}
        total={products.length}
        onPageChange={setPage}
        onPageSizeChange={changePageSize}
      />
    </div>
  );
};

const CompareList: React.FC<CompareListProps> = ({ data }) => {
  // Search results grouped by market, in the same market order as the home page;
  // markets without a match are left out
  const groupedProducts = MARKETS.map((market) => ({
    market,
    products: data.filter((product) => product.market === market),
  })).filter(({ products }) => products.length > 0);

  return (
    <div style={{ marginBottom: "20px" }}>
      <div className="p-8">
        {groupedProducts.map(({ market, products }) => (
          <MarketResults key={market} market={market} products={products} />
        ))}
      </div>
    </div>
  );
};

export default CompareList;
