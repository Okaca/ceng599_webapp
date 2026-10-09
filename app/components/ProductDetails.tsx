"use client";

import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Image,
  Link,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import NextLink from "next/link";
import Dataprovider from "../dataProvider/dataProvider";
import { formatPrice, formatSize, formatUnitPrice } from "./ProductCard";
import { MARKET_LABELS, PricePoint, Product } from "../types";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ProductDetailsProps {
  product: Product;
}

// scraped_at -> "06.10.2026"
const formatDate = (timestamp: string) =>
  new Date(timestamp).toLocaleDateString("tr-TR");

const dp = new Dataprovider();

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const [pastData, setPastData] = useState<PricePoint[]>([]);
  // The same product in every market that sells it, cheapest first
  const [offers, setOffers] = useState<Product[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setPastData(await dp.getPriceHistory(product.id));
    };

    fetchData();
    dp.getProductOffers(product.id).then(setOffers);
  }, [product.id]);

  const isDiscounted =
    product.regular_price !== null && product.regular_price > product.price;

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-12">
        <div className="flex justify-center pt-2 md:pt-6">
          {/* full width on phones, three quarters of its column from 768 px */}
          <Card className="w-full p-3 sm:p-6 md:w-3/4">
            <CardHeader className="flex justify-center gap-3">
              {product.image_url ? (
                <Image
                  className="max-h-72 rounded-xl object-contain"
                  src={product.image_url}
                  alt={product.name}
                  removeWrapper
                />
              ) : (
                <span className="text-small text-default-400">Görsel yok</span>
              )}
            </CardHeader>
            <Divider />
            <CardBody>
              <span style={{ fontWeight: "bold" }}>{product.name}</span>
              <span>{MARKET_LABELS[product.market]}</span>
              {formatSize(product) && (
                <span className="text-default-500">{formatSize(product)}</span>
              )}
              <span>
                {formatPrice(product.price)}
                {isDiscounted && (
                  <>
                    {" "}
                    <s className="text-default-400">
                      {formatPrice(product.regular_price!)}
                    </s>
                    {product.discount_rate !== null && (
                      <span className="text-danger">
                        {" "}
                        %{product.discount_rate}
                      </span>
                    )}
                  </>
                )}
              </span>
              {formatUnitPrice(product) && (
                <span className="text-default-500">
                  {formatUnitPrice(product)}
                </span>
              )}
              {!product.in_stock && (
                <span className="text-danger">Stokta yok</span>
              )}
            </CardBody>
            {product.url && (
              <>
                <Divider />
                <CardFooter className="flex justify-center">
                  <Link isExternal href={product.url}>
                    Ürünü sitesinde görüntüle
                  </Link>
                </CardFooter>
              </>
            )}
          </Card>
        </div>

        {/* shorter on phones; the chart fills whatever height its box has */}
        <div className="h-64 w-full p-2 md:h-[400px] md:p-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={pastData}
              margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid stroke="hsl(var(--muted))" />
              {/* skips date labels that would overlap on a narrow chart */}
              <XAxis
                dataKey="scraped_at"
                tickFormatter={formatDate}
                minTickGap={24}
              />
              <YAxis tickFormatter={formatPrice} domain={[0, "auto"]} />
              <Tooltip
                labelFormatter={formatDate}
                formatter={(value: number) => formatPrice(value)}
              />
              <Legend />
              <Line
                type="monotone"
                name="Fiyat"
                dataKey="price"
                stroke="#000000"
                dot={{ fill: "#000000", stroke: "#000000", strokeWidth: 2 }} // Black dots
                activeDot={{ r: 8, stroke: "#000000", strokeWidth: 2 }} // Black active dots
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {offers.length > 1 && (
        <div className="mx-auto max-w-3xl px-3 pb-10 sm:px-6">
          <h2 className="mb-3 text-xl font-bold">Tüm marketlerde</h2>
          {/* Phones: one stacked row per market */}
          <ul className="sm:hidden">
            {offers.map((offer, index) => (
              <li
                key={offer.id}
                className={`border-t border-default-200 px-2 py-3 ${offer.id === product.id ? "bg-default-100" : ""} ${
                  offer.in_stock ? "" : "opacity-50"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2 font-bold">
                  <span>
                    {index === 0 && offer.in_stock && "★ "}
                    {MARKET_LABELS[offer.market]}
                  </span>
                  <span>
                    {offer.in_stock ? formatPrice(offer.price) : "Stokta yok"}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-2 text-small">
                  {offer.id === product.id ? (
                    <span>{offer.name}</span>
                  ) : (
                    <NextLink
                      href={`/product/?id=${offer.id}`}
                      className="underline"
                    >
                      {offer.name}
                    </NextLink>
                  )}
                  <span className="shrink-0 text-default-500">
                    {formatUnitPrice(offer) ?? ""}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          {/* From 640 px: a table */}
          <table className="hidden w-full text-left sm:table">
            <thead className="text-small text-default-500">
              <tr>
                <th className="py-2">Market</th>
                <th className="py-2">Ürün</th>
                <th className="py-2 text-right">Fiyat</th>
                <th className="py-2 text-right">Birim fiyat</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer, index) => (
                <tr
                  key={offer.id}
                  className={`border-t border-default-200 ${offer.id === product.id ? "bg-default-100" : ""} ${
                    offer.in_stock ? "" : "opacity-50"
                  }`}
                >
                  <td className="py-2 font-bold">
                    {index === 0 && offer.in_stock && "★ "}
                    {MARKET_LABELS[offer.market]}
                  </td>
                  <td className="py-2">
                    {offer.id === product.id ? (
                      offer.name
                    ) : (
                      <NextLink
                        href={`/product/?id=${offer.id}`}
                        className="hover:underline"
                      >
                        {offer.name}
                      </NextLink>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    {offer.in_stock ? formatPrice(offer.price) : "Stokta yok"}
                  </td>
                  <td className="py-2 text-right text-default-500">
                    {formatUnitPrice(offer) ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
