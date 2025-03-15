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
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function EditTankPage() {
  const params = useParams();
  const [name, setName] = useState<string>("");
  const [product, setProduct] = useState<string>("");
  const [capacity, setCapacity] = useState<string>("");

  useEffect(() => {
    const fetchTankDetails = async () => {
      try {
        const response = await API.get(`/tanks/${params.id}/`);
        if (response.status === 200) {
          const tankData = response.data;
          setName(tankData.name);
          setProduct(tankData.product);
          setCapacity(tankData.capacity);
        }
      } catch (error: any) {
        toast({
          title: "Error Fetching Tank",
          description: "Could not load tank details",
          variant: "destructive",
          className: "bg-red-500 text-white",
        });
      }
    };

    if (params.id) {
      fetchTankDetails();
    }
  }, [params.id]);

  const handleUpdateTank = async () => {
    if (!capacity || !product || !name) {
      toast({
        title: "Missing Details",
        description: "Please enter all details to continue",
        variant: "destructive",
        className: "bg-red-500 text-white",
      });
    } else {
      try {
        const response = await API.put(
          `/tanks/${params.id}/`,
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

        if (response.status === 200) {
          toast({
            title: "Tank Update Successful",
            description: "The tank was successfully updated",
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
        } else {
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
      <CardTitle className="text-2xl">Edit Tank</CardTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="product">Product</Label>
          <Select value={product} onValueChange={(value) => setProduct(value)}>
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
          <Label htmlFor="name">Tank Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter tank name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            type="number"
            value={capacity}
            onChange={(event) => setCapacity(event.target.value)}
            placeholder="Enter capacity in liters"
          />
        </div>
      </div>

      <Button
        onClick={handleUpdateTank}
        className="bg-primary hover:bg-primary/90"
      >
        Update Tank
      </Button>
    </div>
  );
}
