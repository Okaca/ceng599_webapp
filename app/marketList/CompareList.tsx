import React from "react";
import ProductCard from "../components/ProductCard";
import { MARKETS, MARKET_LABELS, Product } from "../types";

interface CompareListProps {
  data: Product[];
}

const CompareList: React.FC<CompareListProps> = ({ data }) => {
  // Search results grouped by market, in the same market order as the home page;
  // markets without a match are left out
  const groupedProducts = MARKETS.map((market) => ({
    market,
    products: data.filter((product) => product.market === market),
  })).filter(({ products }) => products.length > 0);

  return (
    <div style={{ marginBottom: "20px" }}>
      <div>
        <div className="p-8">
          {/* Render market names and corresponding products */}
          {groupedProducts.map(({ market, products }) => (
            <div key={market}>
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
              <div className="grid grid-cols-6 gap-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompareList;
