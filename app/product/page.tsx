"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductDetails from "../components/ProductDetails";
import Dataprovider from "@/app/dataProvider/dataProvider";
import { Product } from "@/app/types";

const dp = new Dataprovider();

// /product/?id=123. The id is in the query string rather than the path because the
// frontend is exported as static files: one page serves every product, and it reads
// the id in the browser. Product ids are unique across markets.
const ProductView = () => {
  const id = useSearchParams().get("id");
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // null when the product doesn't exist or the request failed
      setProduct(id ? await dp.getProduct(id) : null);
      setIsLoading(false);
    };

    fetchData();
  }, [id]);

  if (isLoading) return <p>Loading...</p>;
  if (!product) return <p>Product not found.</p>;
  return (
    <div>
      <ProductDetails product={product} />
    </div>
  );
};

// ProductView reads the URL's ?id=, which is only known in the browser
const ProductPage = () => (
  <Suspense>
    <ProductView />
  </Suspense>
);

export default ProductPage;
