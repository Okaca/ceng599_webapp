import React from "react";
import ProductCard, { ProductCardProps } from "../components/ProductCard";

interface CompareListProps {
  data: ProductCardProps[];
}

const CompareList: React.FC<CompareListProps> = ({ data }) => {
  const groupedProducts: { [key: string]: ProductCardProps[] } = {};
  data.forEach((product) => {
    if (!groupedProducts[product.marketName]) {
      groupedProducts[product.marketName] = [];
    }
    groupedProducts[product.marketName].push(product);
  });

  return (
    <div style={{ marginBottom: "20px" }}>
      <div>
        <div className="p-8">
          {/* Render market names and corresponding products */}
          {Object.entries(groupedProducts).map(([marketName, products]) => (
            <div key={marketName}>
              <h1
                className="text-center"
                style={{
                  fontWeight: "bold",
                  fontFamily: "Arial, sans-serif",
                  fontSize: "25px",
                }}
              >
                {marketName}
              </h1>
              <div className="grid grid-cols-6 gap-8">
                {products.map((product) => (
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompareList;
