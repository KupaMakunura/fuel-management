"use client";

import { ProductPredictionsChart } from "@/components/bar-chart";
import { ProductLineChart } from "@/components/line-chart";
import { ProductDepthChart } from "@/components/pie-chart";

export default function OverviewPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-evenly space-x-4">
        <ProductPredictionsChart />
        <ProductDepthChart />
      </div>
      <div>
        <ProductLineChart />
      </div>
    </div>
  );
}
