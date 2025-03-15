"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { API } from "@/services";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export default function PredictionsPage() {
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [prediction, setPrediction] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  const handlePredict = async () => {
    if (!selectedProduct || !selectedDate) {
      toast({
        title: "Missing Information",
        description: "Please select both product and date",
        variant: "destructive",
        className: "bg-red-500 text-white",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/inventory/get-predictions/", {
        product: selectedProduct.toLowerCase(),
        date: selectedDate,
      });

      setPrediction(response.data);

      // Create chart data including current and predicted price
      const newChartData = [
        {
          date: "Current",
          price: response.data.current_price,
          currentPrice: response.data.current_price,
          volume: "1000L",
          total: response.data.current_price * 1000,
        },
        {
          date: new Date(selectedDate).toLocaleDateString(),
          price: response.data.predicted_price,
          currentPrice: response.data.current_price,
          volume: "1000L",
          total: response.data.predicted_price * 1000,
        },
      ];
      setChartData(newChartData);

      toast({
        title: "Prediction Generated",
        description: "Price prediction has been calculated successfully",
        variant: "default",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      toast({
        title: "Prediction Failed",
        description: "Failed to generate price prediction",
        variant: "destructive",
        className: "bg-red-500 text-white",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fuel Price Predictions</CardTitle>
          <CardDescription>
            Select a product and date to predict future prices (Based on 1000
            litres volume)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Select onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Select Product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Petrol">Petrol</SelectItem>
                <SelectItem value="Diesel">Diesel</SelectItem>
                <SelectItem value="Ethanol">Ethanol</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
            <Button onClick={handlePredict} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Generate Prediction"
              )}
            </Button>
          </div>

          {prediction && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-blue-500 text-white">
                  <CardHeader>
                    <CardTitle>Selected Product</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{selectedProduct}</div>
                    <div className="text-sm mt-2">Volume: 1000 litres</div>
                  </CardContent>
                </Card>
                <Card className="bg-purple-500 text-white">
                  <CardHeader>
                    <CardTitle>Current Price</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      ${prediction.current_price.toFixed(2)}/L
                    </div>
                    <div className="text-sm mt-2">
                      Total: ${(prediction.current_price * 1000).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
                <Card
                  className={`${
                    prediction.predicted_price > prediction.current_price
                      ? "bg-green-500"
                      : "bg-red-500"
                  } text-white`}
                >
                  <CardHeader>
                    <CardTitle>Predicted Price</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      ${prediction.predicted_price.toFixed(2)}/L
                    </div>
                    <div className="text-sm mt-2">
                      Total: ${(prediction.predicted_price * 1000).toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Price Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="price"
                          fill={
                            prediction.predicted_price >
                            prediction.current_price
                              ? "rgba(34, 197, 94, 0.2)"
                              : "rgba(239, 68, 68, 0.2)"
                          }
                          stroke={
                            prediction.predicted_price >
                            prediction.current_price
                              ? "#22c55e"
                              : "#ef4444"
                          }
                          strokeWidth={2}
                          name="Predicted Price"
                        />
                        <Area
                          type="monotone"
                          dataKey="currentPrice"
                          fill="rgba(147, 51, 234, 0.2)"
                          stroke="#9333ea"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name="Current Price"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
