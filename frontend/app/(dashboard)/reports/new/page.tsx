"use client";

import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { API } from "@/services";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function UploadReportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [product, setProduct] = useState<string | null>(null);
  const [depth, setDepth] = useState<any>(null);
  const [quantity, setQuantity] = useState<any>(null);
  const [price, setPrice] = useState<any>(null);
  const [volume, setVolume] = useState<any>(null);
  const { data: session } = useSession();

  const handleSubmitReport = async () => {
    if (!price || !volume || !quantity || !depth || !product) {
      toast({
        title: "Missing Details",
        description: "Please enter all details to continue",
        variant: "destructive",
        className: "bg-red-500 text-white",
      });
    } else if (!file) {
      toast({
        title: "Missing Details",
        description: "Select the report file",
        variant: "destructive",
        className: "bg-red-500 text-white",
      });
    } else {
      const formData = new FormData();
      formData.append("price", price);
      formData.append("quantity", quantity);
      formData.append("product", product);
      formData.append("volume", volume);
      if (file) {
        formData.append("file", file);
      }
      try {
        const response = await API.post("/reports", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${session?.user.access_token}`,
          },
        });

        if (response.status === 201) {
          toast({
            title: "Report Upload Successful",
            description: "The report was successfully uploaded",
            variant: "destructive",
            className: "bg-green-500 text-white",
          });
        }
      } catch (error: any) {
        if (error.status === 401) {
          toast({
            title: "Authentication Error",
            description: "User not authorized",
            variant: "destructive",
            className: "bg-red-500 text-white",
          });
        } else if (error.status === 500) {
          toast({
            title: "Server error",
            description: "Unexpected server error",
            variant: "destructive",
            className: "bg-red-500 text-white",
          });
        } else if (error.status) {
          toast({
            title: "Client error",
            description: "Unexpected error please try again",
            variant: "destructive",
            className: "bg-red-500 text-white",
          });
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      <CardTitle className="text-2xl">Add New Report</CardTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="product">Product</Label>
          <Select onValueChange={(value) => setProduct(value)}>
            <SelectTrigger id="product">
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="petrol">Petrol</SelectItem>
              <SelectItem value="diesel">Diesel</SelectItem>
              <SelectItem value="ethanol">Ethanol</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            onChange={(event) => setPrice(event.target.value as any)}
            step="0.01"
            placeholder="Enter price"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            placeholder="Enter quantity"
            onChange={(event) => setQuantity(event.target.value as any)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="volume">Volume</Label>
          <Input
            id="volume"
            type="number"
            step="0.01"
            onChange={(event) => setVolume(event.target.value as any)}
            placeholder="Enter volume"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="depth">Depth</Label>
          <Input
            id="depth"
            type="number"
            step="0.01"
            onChange={(event) => setDepth(event.target.value as any)}
            placeholder="Enter depth"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="file">Upload File</Label>
        <Input
          id="file"
          type="file"
          accept=".csv,.xls,.xlsx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>
      <Button
        onClick={() => handleSubmitReport()}
        className="bg-primary hover:bg-primary/90"
      >
        Upload Report
      </Button>
    </div>
  );
}
