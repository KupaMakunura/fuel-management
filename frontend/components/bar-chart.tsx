"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// This would typically come from an API or database query
const chartData = [
  { product: "Ethanol", predicted_price: 2.5, predicted_quantity: 1000 },
  { product: "Diesel", predicted_price: 3.2, predicted_quantity: 1500 },
  { product: "Petrol", predicted_price: 3.8, predicted_quantity: 2000 },
];

const chartConfig = {
  predicted_price: {
    label: "Predicted Price",
    color: "#4895ef",
  },
  predicted_quantity: {
    label: "Predicted Quantity",
    color: "#7209b7",
  },
} satisfies ChartConfig;

export function ProductPredictionsChart() {
  const totalPredictedQuantity = chartData.reduce(
    (acc, curr) => acc + curr.predicted_quantity,
    0
  );
  const averagePredictedPrice =
    chartData.reduce((acc, curr) => acc + curr.predicted_price, 0) /
    chartData.length;

  const quantityTrend =
    totalPredictedQuantity > 4000
      ? {
          icon: <TrendingUp className="h-4 w-4" />,
          text: "Quantity trending up",
          percentage: "3.5%",
        }
      : {
          icon: <TrendingDown className="h-4 w-4" />,
          text: "Quantity trending down",
          percentage: "2.8%",
        };

  const priceTrend =
    averagePredictedPrice > 3.0
      ? {
          icon: <TrendingUp className="h-4 w-4" />,
          text: "Price trending up",
          percentage: "2.1%",
        }
      : {
          icon: <TrendingDown className="h-4 w-4" />,
          text: "Price trending down",
          percentage: "1.7%",
        };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Product Predictions Chart</CardTitle>
        <CardDescription>
          Predicted Price and Quantity by Product
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-[4/3]">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="product"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke={chartConfig.predicted_price.color}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={chartConfig.predicted_quantity.color}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="predicted_price"
              fill="var(--color-predicted_price)"
              radius={[4, 4, 0, 0]}
              yAxisId="left"
            />
            <Bar
              dataKey="predicted_quantity"
              fill="var(--color-predicted_quantity)"
              radius={[4, 4, 0, 0]}
              yAxisId="right"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {quantityTrend.text} by {quantityTrend.percentage}{" "}
          {quantityTrend.icon}
        </div>
        <div className="flex gap-2 font-medium leading-none">
          {priceTrend.text} by {priceTrend.percentage} {priceTrend.icon}
        </div>
        <div className="leading-none text-muted-foreground">
          Showing predicted price and quantity for each product
        </div>
      </CardFooter>
    </Card>
  );
}
