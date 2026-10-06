import React from "react";
import ProductCard from "../components/ProductCard";
import { Product } from "../types";

interface MarketListProps {
  marketName: string;
  data: Product[];
}

const MarketList: React.FC<MarketListProps> = ({ marketName, data }) => {
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
          {marketName}
        </h1>
      </div>
      <div>
        <div className="grid grid-cols-6 gap-8 p-8">
          {data.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketList;
