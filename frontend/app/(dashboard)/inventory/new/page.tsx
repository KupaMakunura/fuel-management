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

export default function NewInventoryPage() {
  const [product, setProduct] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<any>(null);
  const { data: session } = useSession();

  const handleCreateInventory = async () => {
    if (!quantity || !product) {
      toast({
        title: "Missing Details",
        description: "Please enter all details to continue",
        variant: "destructive",
        className: "bg-red-500 text-white",
      });
    } else {
      try {
        const response = await API.post(
          "/inventory",
          {
            product,
            quantity,
          },
          {
            headers: {
              Authorization: `Bearer ${session?.user.access_token}`,
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

  return (
    <div className="space-y-4">
      <CardTitle className="text-2xl">New Inventory</CardTitle>

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
          <Label htmlFor="depth">Quantity</Label>
          <Input
            id="depth"
            type="number"
            step="0.01"
            onChange={(event) => setQuantity(event.target.value as any)}
            placeholder="Enter Quantity"
          />
        </div>
      </div>

      <Button
        onClick={() => handleCreateInventory()}
        className="bg-primary hover:bg-primary/90"
      >
        Save Tank
      </Button>
    </div>
  );
}
