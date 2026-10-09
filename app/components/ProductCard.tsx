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

const UNIT_LABELS: Record<PriceUnit, string> = {
  kg: "kg",
  l: "L",
  adet: "adet",
};

// The size as sold: 500 g, 2 kg, 330 ml, 1,5 L, 6 adet
export function formatSize(product: Product): string | null {
  const { quantity, unit } = product;
  if (!quantity || !unit) return null;
  if (unit === "g" && quantity >= 1000)
    return `${formatNumber(quantity / 1000)} kg`;
  if (unit === "ml" && quantity >= 1000)
    return `${formatNumber(quantity / 1000)} L`;
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

  // All cards have the same image height and at most two lines of name, so cards in
  // a row line up; on phones two cards share a row, so text and image are smaller
  return (
    <Card
      className="h-full py-2 sm:py-4"
      isPressable
      onPress={() => router.push(`/product/?id=${product.id}`)}
    >
      <CardHeader className="flex-col items-start gap-1 px-3 pb-0 pt-2 sm:px-4">
        <p
          className="line-clamp-2 min-h-[2.5rem] text-small font-bold uppercase sm:min-h-[3rem] sm:text-large"
          title={product.name}
        >
          {product.name}
        </p>
        {size && (
          <p className="text-tiny text-default-500 sm:text-small">{size}</p>
        )}
      </CardHeader>
      <CardBody className="overflow-visible px-3 py-2 sm:px-4">
        <div className="flex h-28 items-center justify-center sm:h-40">
          {product.image_url ? (
            <Image
              alt={product.name}
              className="max-h-28 rounded-xl object-contain sm:max-h-40"
              src={product.image_url}
              removeWrapper
            />
          ) : (
            <span className="text-small text-default-400">Görsel yok</span>
          )}
        </div>
      </CardBody>
      <div className="flex flex-col items-start px-3 pb-2 sm:px-4">
        <span className="text-medium font-bold">
          {formatPrice(product.price)}
        </span>
        {unitPrice && (
          <span className="text-tiny text-default-500 sm:text-small">
            {unitPrice}
          </span>
        )}
      </div>
    </Card>
  );
};

export default ProductCard;
