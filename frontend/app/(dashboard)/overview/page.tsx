"use client";

import { ProductLineChart } from "@/components/line-chart";
import { ProductDepthChart } from "@/components/pie-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API } from "@/services";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function OverviewPage() {
  const [tanks, setTanks] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTanks = async () => {
    try {
      const response = await API.get("/tanks");
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch tanks");
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await API.get("/inventory");
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    Promise.all([fetchTanks(), fetchInventory()])
      .then(([tanksData, inventoryData]) => {
        setTanks(tanksData);
        setInventory(inventoryData);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching data:", error);
      });
  }, []);

  const totalTanks = tanks.length;
  const totalVolume = inventory.reduce(
    (acc, curr: any) => acc + curr.volume,
    0
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-blue-500 text-white">
          <CardHeader>
            <CardTitle>Total Tanks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTanks}</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-500 text-white">
          <CardHeader>
            <CardTitle>Total Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalVolume.toFixed(2)} L</div>
          </CardContent>
        </Card>
        <Card className="bg-indigo-500 text-white">
          <CardHeader>
            <CardTitle>Average Volume per Tank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(totalVolume / totalTanks).toFixed(2)} L
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-rows-2 gap-2">
        <div className="w-full">
          <ProductLineChart />
        </div>
        <div className="w-full">
          <ProductDepthChart />
        </div>
      </div>
    </div>
  );
}
