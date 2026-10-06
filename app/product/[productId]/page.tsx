"use client";

import { useEffect, useState } from "react";
import ProductDetails from "../../components/ProductDetails";
import Dataprovider from "@/app/dataProvider/dataProvider";
import { Product } from "@/app/types";

const dp = new Dataprovider();

// Product ids are unique across markets, so one page serves every market's products
const ProductPage = ({ params }: { params: { productId: string } }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // null when the product doesn't exist or the request failed
      setProduct(await dp.getProduct(params.productId));
      setIsLoading(false);
    };

    fetchData();
  }, [params.productId]);

  if (isLoading) return <p>Loading...</p>;
  if (!product) return <p>Product not found.</p>;
  return (
    <div>
      <ProductDetails product={product} />
    </div>
  );
};

export default ProductPage;
