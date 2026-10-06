"use client";

import { Card, CardBody, CardHeader, Image } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { Product } from "../types";

// Turkish lira in Turkish notation, e.g. 39.9 -> "₺39,90"
export const formatPrice = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
}).format;

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const router = useRouter();

  return (
    <Card
      className="py-4"
      isPressable
      onPress={() => router.push(`/product/${product.id}`)}
    >
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
        <p className="text-tiny uppercase font-bold text-large">{product.name}</p>
      </CardHeader>
      <CardBody className="overflow-visible py-2">
        <Image
          alt={product.name}
          className="object-cover rounded-xl"
          src={product.image_url ?? undefined}
          width="auto"
        />
      </CardBody>
      <div className=" p-2 font-bold text-medium items-end">
        <span>{formatPrice(product.price)}</span>
      </div>
    </Card>
  );
};

export default ProductCard;
