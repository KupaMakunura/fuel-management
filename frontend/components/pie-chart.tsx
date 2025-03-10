"use client";

import * as React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

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

// This would typically come from an API or database query
const chartData = [
  { product: "ethanol", depth: 15.5, fill: "#3f37c9" },
  { product: "diesel", depth: 22.3, fill: "#7209b7" },
  { product: "petrol", depth: 18.7, fill: "#4895ef" },
];

const chartConfig = {
  depth: {
    label: "Depth",
  },
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

export function ProductDepthChart() {
  const totalDepth = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.depth, 0);
  }, []);

  const averageDepth = totalDepth / chartData.length;

  const trend =
    averageDepth > 20
      ? {
          icon: <TrendingUp className="h-4 w-4" />,
          text: "Trending up",
          percentage: "3.2%",
        }
      : {
          icon: <TrendingDown className="h-4 w-4" />,
          text: "Trending down",
          percentage: "2.1%",
        };

  return (
    <Card className="flex flex-col w-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Product Depth Distribution</CardTitle>
        <CardDescription>Current Measurements</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="depth"
              nameKey="product"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {averageDepth.toFixed(1)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Avg Depth
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {trend.text} by {trend.percentage} this period {trend.icon}
        </div>
        <div className="leading-none text-muted-foreground">
          Showing depth distribution across product types
        </div>
      </CardFooter>
    </Card>
  );
}
