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
import { useState } from "react";

export default function NewTankPage() {
  const [name, setName] = useState<string | null>(null);
  const [product, setProduct] = useState<string | null>(null);
  const [capacity, setCapacity] = useState<any>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const handleCreateTank = async () => {
    if (!capacity || !product || !name) {
      toast({
        title: "Missing Details",
        description: "Please enter all details to continue",
        variant: "destructive",
        className: "bg-red-500 text-white",
      });
    } else {
      try {
        const response = await API.post(
          "/tanks/",
          {
            name,
            product,
            capacity,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 201) {
          toast({
            title: "Tank Creation Successful",
            description: "The tank was successfully created",
            variant: "default",
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

  const handleCsvUpload = async () => {
    if (!csvFile) {
      toast({
        title: "Missing File",
        description: "Please select a CSV file to upload",
        variant: "destructive",
        className: "bg-red-500 text-white",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", csvFile);

      const response = await API.post("/tanks/upload-csv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        toast({
          title: "CSV Upload Successful",
          description: "The tanks were successfully imported",
          variant: "default",
          className: "bg-green-500 text-white",
        });
      }
    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: "Failed to upload CSV file",
        variant: "destructive",
        className: "bg-red-500 text-white",
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <CardTitle className="text-2xl mb-4">Add Single Tank</CardTitle>
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
            <Label htmlFor="price">Tank Name</Label>
            <Input
              id="name"
              type="text"
              onChange={(event) => setName(event.target.value as any)}
              step="0.01"
              placeholder="Enter tank name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              step="0.01"
              onChange={(event) => setCapacity(event.target.value as any)}
              placeholder="Enter capacity in liters"
            />
          </div>
        </div>
        <Button
          onClick={() => handleCreateTank()}
          className="bg-primary hover:bg-primary/90 mt-4"
        >
          Save Tank
        </Button>
      </div>

      <div className="border-t pt-8">
        <CardTitle className="text-2xl mb-4">Bulk Import Tanks</CardTitle>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv">Upload CSV File</Label>
            <Input
              id="csv"
              type="file"
              accept=".csv"
              onChange={(event) => setCsvFile(event.target.files?.[0] || null)}
            />
          </div>
          <Button
            onClick={handleCsvUpload}
            className="bg-black text-white w-full"
          >
            Upload CSV
          </Button>
        </div>
      </div>
    </div>
  );
}
