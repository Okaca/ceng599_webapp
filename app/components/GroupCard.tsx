"use client";

import Link from "next/link";
import { Card, CardBody, CardHeader, Divider, Image } from "@nextui-org/react";
import { formatPrice, formatSize, formatUnitPrice } from "./ProductCard";
import { MARKET_LABELS, ProductGroup } from "../types";

// One product with every market's price, cheapest first. All cards have the same
// image height and at most two lines of name, so cards in a row line up.
const GroupCard: React.FC<{ group: ProductGroup }> = ({ group }) => {
  const cheapest = group.offers[0];
  // ★ only means something when there is another market to beat
  const hasWinner = group.offers.length > 1 && cheapest.in_stock;
  const size = formatSize(cheapest);

  return (
    <Card className="h-full">
      <CardHeader className="flex-col items-start gap-1 px-4 pb-0 pt-3">
        <p
          className="line-clamp-2 min-h-[3rem] text-large font-bold uppercase"
          title={group.name}
        >
          {group.name}
        </p>
        {size && <p className="text-small text-default-500">{size}</p>}
      </CardHeader>
      <CardBody className="gap-3">
        <div className="flex h-40 items-center justify-center">
          {group.image_url ? (
            <Image
              alt={group.name}
              src={group.image_url}
              className="max-h-40 object-contain"
              removeWrapper
            />
          ) : (
            <span className="text-small text-default-400">Görsel yok</span>
          )}
        </div>
        <Divider />
        <ul className="flex flex-col gap-1">
          {group.offers.map((offer, index) => {
            const isWinner = hasWinner && index === 0;
            const unitPrice = formatUnitPrice(offer);
            return (
              <li key={offer.id}>
                <Link
                  href={`/product/?id=${offer.id}`}
                  className={`flex min-h-[44px] items-center justify-between gap-2 rounded-md px-2 py-1 hover:bg-default-100 ${
                    isWinner ? "bg-success-50 font-bold" : ""
                  } ${offer.in_stock ? "" : "opacity-50"}`}
                >
                  <span className="whitespace-nowrap">
                    {isWinner && "★ "}
                    {MARKET_LABELS[offer.market]}
                  </span>
                  <span className="flex flex-col items-end">
                    <span>
                      {offer.discount_rate !== null && (
                        <span className="mr-1 text-small text-danger">
                          %{offer.discount_rate}
                        </span>
                      )}
                      {formatPrice(offer.price)}
                    </span>
                    {offer.in_stock ? (
                      unitPrice && (
                        <span className="text-tiny font-normal text-default-500">
                          {unitPrice}
                        </span>
                      )
                    ) : (
                      <span className="text-tiny font-normal">Stokta yok</span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </CardBody>
    </Card>
  );
};

export default GroupCard;
