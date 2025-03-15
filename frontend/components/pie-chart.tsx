"use client";

import * as React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import { API } from "@/services";

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

const chartConfig = {
  volume: {
    label: "Volume",
  },
  petrol: {
    label: "Petrol",
    color: "#3f37c9",
  },
  diesel: {
    label: "Diesel",
    color: "#7209b7",
  },
  ethanol: {
    label: "Ethanol",
    color: "#4895ef",
  },
} satisfies ChartConfig;

export function ProductDepthChart() {
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await API.get("/inventory");
        const inventoryData = response.data;

        // Process data for chart
        const processedData = inventoryData.reduce((acc: any[], curr: any) => {
          const existingProduct = acc.find(
            (item) => item.product === curr.name
          );
          if (existingProduct) {
            existingProduct.volume += curr.volume;
          } else {
            acc.push({
              product: curr.name,
              volume: curr.volume,
              fill:
                curr.name === "petrol"
                  ? "#3f37c9"
                  : curr.name === "diesel"
                  ? "#7209b7"
                  : "#4895ef",
            });
          }
          return acc;
        }, []);

        setChartData(processedData);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const totalVolume = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.volume, 0);
  }, [chartData]);

  const averageVolume = totalVolume / (chartData.length || 1);

  const trend = {
    icon: <TrendingUp className="h-4 w-4" />,
    text: "Current Volume",
    value: `${totalVolume.toLocaleString()} L`,
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="flex flex-col w-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Product Volume Distribution</CardTitle>
        <CardDescription>Current Inventory Levels</CardDescription>
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
              dataKey="volume"
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
                          {Math.round(averageVolume).toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Avg Volume
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
          {trend.text}: {trend.value} {trend.icon}
        </div>
        <div className="leading-none text-muted-foreground">
          Showing volume distribution across product types
        </div>
      </CardFooter>
    </Card>
  );
}
