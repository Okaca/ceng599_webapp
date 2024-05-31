"use client";

import { Card, CardBody, CardHeader, Image } from "@nextui-org/react";
import { useRouter } from "next/navigation";

export interface ProductCardProps {
  id: string;
  title: string;
  scrapedDate: string;
  imageUrl: string;
  itemURL: string;
  name: string;
  price: string;
  marketName: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  scrapedDate,
  imageUrl,
  itemURL,
  name,
  price,
  marketName,
}) => {
  const router = useRouter();

  return (
    <Card
      className="py-4"
      isPressable
      onPress={() => router.push(`/${marketName}Product/${id}`)}
    >
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
        <p className="text-tiny uppercase font-bold text-large">{name}</p>
      </CardHeader>
      <CardBody className="overflow-visible py-2">
        <Image
          alt="Card background"
          className="object-cover rounded-xl"
          src={imageUrl}
          width="auto"
        />
      </CardBody>
      <div className=" p-2 font-bold text-medium items-end">
        <span>{price}</span>
        <span>₺</span>
      </div>
    </Card>
  );
};

export default ProductCard;
