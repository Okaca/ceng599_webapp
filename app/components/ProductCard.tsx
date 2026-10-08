"use client";

import { Card, CardBody, CardHeader, Image } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { PriceUnit, Product } from "../types";

// Turkish lira in Turkish notation, e.g. 39.9 -> "₺39,90"
export const formatPrice = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
}).format;

const formatNumber = (value: number) =>
  value.toLocaleString("tr-TR", { maximumFractionDigits: 2 });

const UNIT_LABELS: Record<PriceUnit, string> = { kg: "kg", l: "L", adet: "adet" };

// The size as sold: 500 g, 2 kg, 330 ml, 1,5 L, 6 adet
export function formatSize(product: Product): string | null {
  const { quantity, unit } = product;
  if (!quantity || !unit) return null;
  if (unit === "g" && quantity >= 1000) return `${formatNumber(quantity / 1000)} kg`;
  if (unit === "ml" && quantity >= 1000) return `${formatNumber(quantity / 1000)} L`;
  return `${formatNumber(quantity)} ${unit === "l" ? "L" : unit}`;
}

// The price per kg, L or piece, e.g. "₺24,90/kg"
export function formatUnitPrice(product: Product): string | null {
  if (product.unit_price === null || product.price_unit === null) return null;
  return `${formatPrice(product.unit_price)}/${UNIT_LABELS[product.price_unit]}`;
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const router = useRouter();
  const size = formatSize(product);
  const unitPrice = formatUnitPrice(product);

  return (
    <Card
      className="py-4"
      isPressable
      onPress={() => router.push(`/product/?id=${product.id}`)}
    >
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start gap-1">
        <p className="text-tiny uppercase font-bold text-large">{product.name}</p>
        {size && <p className="text-small text-default-500">{size}</p>}
      </CardHeader>
      <CardBody className="overflow-visible py-2">
        <Image
          alt={product.name}
          className="object-cover rounded-xl"
          src={product.image_url ?? undefined}
          width="auto"
        />
      </CardBody>
      <div className="flex flex-col p-2 items-start">
        <span className="font-bold text-medium">{formatPrice(product.price)}</span>
        {unitPrice && <span className="text-small text-default-500">{unitPrice}</span>}
      </div>
    </Card>
  );
};

export default ProductCard;
