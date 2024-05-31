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
import Dataprovider from "../dataProvider/dataProvider";
import { ProductCardProps } from "./ProductCard";
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
  product: MarketProduct;
}

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

interface ChartData {
  value: string;
  date: string;
}

const dp = new Dataprovider();

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const [pastData, setPastData] = useState<ChartData[]>([]);

  const formatAxis = (tick: any) => {
    return `${tick} ₺`;
  };

  useEffect(() => {
    const fetchData = async () => {
      console.log(" FIND SOLUTION TO PRODUCT NAME : ", product.name);
      try {
        if (product.marketName == "migros") {
          const pastProducts = await dp.getMigrosChartValuesByName(
            product.name
          );
          setPastData(pastProducts);
        } else if (product.marketName == "sok") {
          const pastProducts = await dp.getSokChartValuesByName(product.name);
          setPastData(pastProducts);
        } else if (product.marketName == "getir") {
          const pastProducts = await dp.getGetirChartValuesByName(product.name);
          setPastData(pastProducts);
        } else if (product.marketName == "carefour") {
          const pastProducts = await dp.getCarefourChartValuesByName(
            product.name
          );
          setPastData(pastProducts);
        } else if (product.marketName == "a101") {
          const pastProducts = await dp.getA101ChartValuesByName(product.name);
          setPastData(pastProducts);
        } else {
          setPastData([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Calculate the maximum value in your data
  const maxValue = Math.max(...pastData.map((d) => parseFloat(d.value)));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="flex justify-center pt-6">
        <Card className="p-6 w-3/4">
          <CardHeader className="flex justify-center gap-3">
            <Image
              className="object-cover rounded-xl"
              src={product.imageUrl}
              width="auto"
              alt={product.name}
            />
          </CardHeader>
          <Divider />
          <CardBody>
            <span style={{ fontWeight: "bold" }}>{product.name}</span>
            <span>{product.price}₺</span>
          </CardBody>
          <Divider />
          <CardFooter className="flex justify-center">
            <Link isExternal href={product.itemURL}>
              Ürünü sitesinde görüntüle
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="flex justify-center items-center p-6">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={pastData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid stroke="hsl(var(--muted))" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={formatAxis} domain={[0, maxValue + 10]} />
            <Tooltip formatter={formatAxis} />
            <Legend />
            <Line
              type="monotone"
              name="price"
              dataKey="value"
              stroke="#000000"
              dot={{ fill: "#000000", stroke: "#000000", strokeWidth: 2 }} // Black dots
              activeDot={{ r: 8, stroke: "#000000", strokeWidth: 2 }} // Black active dots
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProductDetails;
