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
import { useEffect, useState } from "react";
import { API } from "@/services";
import { toast } from "@/hooks/use-toast";

const chartConfig = {
  petrol: {
    label: "Petrol",
    color: "#d4d700",
  },
  diesel: {
    label: "Diesel",
    color: "#2b9348",
  },
  ethanol: {
    label: "Ethanol",
    color: "#3f37c9",
  },
} satisfies ChartConfig;

export function ProductLineChart() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const response = await API.get("/inventory");
        const inventory = response.data;

        // Process inventory data to group by month and product
        const monthlyData = inventory.reduce((acc: any, item: any) => {
          const date = new Date(item.created_at);
          const month = date.toLocaleString("default", { month: "long" });

          if (!acc[month]) {
            acc[month] = { month, petrol: 0, diesel: 0, ethanol: 0 };
          }

          acc[month][item.name.toLowerCase()] += item.volume;
          return acc;
        }, {});

        // Convert to array and sort by month
        const sortedData = Object.values(monthlyData).sort((a: any, b: any) => {
          const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
          return months.indexOf(a.month) - months.indexOf(b.month);
        });

        setChartData(sortedData);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        toast({
          title: "Error",
          description: "Failed to fetch inventory data",
          variant: "destructive",
          className: "bg-red-500 text-white",
        });
      }
    };

    fetchInventoryData();
  }, []);

  const calculateTrend = (product: string) => {
    if (chartData.length < 2)
      return { text: "No trend", percentage: "0", icon: null };

    const latestMonth = chartData[chartData.length - 1];
    const previousMonth = chartData[chartData.length - 2];

    const current = latestMonth[product];
    const previous = previousMonth[product];

    const percentageChange = previous
      ? ((current - previous) / previous) * 100
      : 0;

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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Volume Trends</CardTitle>
        <CardDescription>Volume trends across months</CardDescription>
        <div className="flex gap-4 mt-2">
          {Object.entries(chartConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-sm">{config.label}</span>
            </div>
          ))}
        </div>
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
              {Object.keys(chartConfig).map((product) => (
                <Line
                  key={product}
                  type="monotone"
                  dataKey={product}
                  stroke={
                    chartConfig[product as keyof typeof chartConfig].color
                  }
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="grid w-full gap-2 text-sm">
          {Object.keys(chartConfig).map((product) => {
            const trend = calculateTrend(product);
            return (
              <div
                key={product}
                className="flex items-center gap-2 font-medium leading-none"
              >
                {chartConfig[product as keyof typeof chartConfig].label}:{" "}
                {trend.text} by {trend.percentage} {trend.icon}
              </div>
            );
          })}
          <div className="flex items-center gap-2 leading-none text-muted-foreground">
            Showing product volumes across all recorded months
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
