"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { month: "January", ethanol: 186, diesel: 305, petrol: 280 },
  { month: "February", ethanol: 305, diesel: 270, petrol: 310 },
  { month: "March", ethanol: 237, diesel: 320, petrol: 290 },
  { month: "April", ethanol: 273, diesel: 290, petrol: 350 },
  { month: "May", ethanol: 209, diesel: 330, petrol: 370 },
  { month: "June", ethanol: 214, diesel: 350, petrol: 400 },
];

const chartConfig = {
  ethanol: {
    label: "Ethanol",
    color: "#3f37c9",
  },
  diesel: {
    label: "Diesel",
    color: "#2b9348",
  },
  petrol: {
    label: "Petrol",
    color: "#d4d700",
  },
} satisfies ChartConfig;

export function ProductLineChart() {
  const latestMonth = chartData[chartData.length - 1];
  const previousMonth = chartData[chartData.length - 2];

  const calculateTrend = (current: number, previous: number) => {
    const percentageChange = ((current - previous) / previous) * 100;
    return {
      icon:
        percentageChange > 0 ? (
          <TrendingUp className="h-4 w-4" />
        ) : (
          <TrendingDown className="h-4 w-4" />
        ),
      text: percentageChange > 0 ? "Trending up" : "Trending down",
      percentage: Math.abs(percentageChange).toFixed(1) + "%",
    };
  };

  const ethanolTrend = calculateTrend(
    latestMonth.ethanol,
    previousMonth.ethanol
  );
  const dieselTrend = calculateTrend(latestMonth.diesel, previousMonth.diesel);
  const petrolTrend = calculateTrend(latestMonth.petrol, previousMonth.petrol);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Volume Trends</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="ethanol"
                stroke={chartConfig.ethanol.color}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="diesel"
                stroke={chartConfig.diesel.color}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="petrol"
                stroke={chartConfig.petrol.color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="grid w-full gap-2 text-sm">
          <div className="flex items-center gap-2 font-medium leading-none">
            Ethanol: {ethanolTrend.text} by {ethanolTrend.percentage}{" "}
            {ethanolTrend.icon}
          </div>
          <div className="flex items-center gap-2 font-medium leading-none">
            Diesel: {dieselTrend.text} by {dieselTrend.percentage}{" "}
            {dieselTrend.icon}
          </div>
          <div className="flex items-center gap-2 font-medium leading-none">
            Petrol: {petrolTrend.text} by {petrolTrend.percentage}{" "}
            {petrolTrend.icon}
          </div>
          <div className="flex items-center gap-2 leading-none text-muted-foreground">
            Showing product volumes for the last 6 months
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
