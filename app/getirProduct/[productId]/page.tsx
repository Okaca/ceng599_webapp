"use client";

import { useEffect, useState } from "react";
import ProductDetails from "../../components/ProductDetails";
import Dataprovider from "@/app/dataProvider/dataProvider";

interface MarketProduct {
  productId: string;
  title: string;
  scrapedDate: string;
  imageUrl: string;
  itemURL: string;
  name: string;
  price: string;
  marketName: string;
}

const dp = new Dataprovider();

const Product = ({ params }: { params: MarketProduct }) => {
  console.log(params);
  const [marketProduct, setMarketProduct] = useState<MarketProduct>();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const getirMarket = await dp.getGetirItemById(params.productId);
        setMarketProduct(getirMarket);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false); // Set loading state to false regardless of success or failure
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        marketProduct && (
          <div>
            <ProductDetails product={marketProduct} />
          </div>
        )
      )}
    </>
  );
};

export default Product;
