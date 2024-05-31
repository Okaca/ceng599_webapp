import React from "react";
import ProductCard, { ProductCardProps } from "../components/ProductCard";

interface MarketListProps {
  marketName: string;
  data: ProductCardProps[];
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
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              scrapedDate={product.scrapedDate}
              imageUrl={product.imageUrl}
              itemURL={product.itemURL}
              name={product.name}
              price={product.price}
              marketName={product.marketName}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketList;
