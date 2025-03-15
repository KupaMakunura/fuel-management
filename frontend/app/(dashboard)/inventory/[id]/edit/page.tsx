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

export default function EditInventoryPage() {
  const params = useParams();
  const [name, setName] = useState<string>("");
  const [volume, setVolume] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [tank, setTank] = useState<string>("");
  const [tanks, setTanks] = useState<any[]>([]);

  useEffect(() => {
    const fetchInventoryDetails = async () => {
      try {
        const response = await API.get(`/inventory/${params.id}/`);
        if (response.status === 200) {
          const inventoryData = response.data;
          setName(inventoryData.name);
          setVolume(inventoryData.volume);
          setDescription(inventoryData.description);
          setTank(inventoryData.tank);
        }
      } catch (error: any) {
        toast({
          title: "Error Fetching Inventory",
          description: "Could not load inventory details",
          variant: "destructive",
          className: "bg-red-500 text-white",
        });
      }
    };

    const fetchTanks = async () => {
      try {
        const response = await API.get("/tanks/");
        if (response.status === 200) {
          setTanks(response.data);
        }
      } catch (error) {
        toast({
          title: "Error Fetching Tanks",
          description: "Could not load tanks list",
          variant: "destructive",
          className: "bg-red-500 text-white",
        });
      }
    };

    if (params.id) {
      fetchInventoryDetails();
      fetchTanks();
    }
  }, [params.id]);

  const handleUpdateInventory = async () => {
    if (!volume || !name) {
      toast({
        title: "Missing Details",
        description: "Please enter all required details to continue",
        variant: "destructive",
        className: "bg-red-500 text-white",
      });
    } else {
      try {
        const response = await API.put(
          `/inventory/${params.id}/`,
          {
            name,
            volume,
            description,
            tank,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          toast({
            title: "Inventory Update Successful",
            description: "The inventory was successfully updated",
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
      <CardTitle className="text-2xl">Edit Inventory</CardTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Fuel Type</Label>
          <Select value={name} onValueChange={(value) => setName(value)}>
            <SelectTrigger id="name">
              <SelectValue placeholder="Select fuel type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="petrol">Petrol</SelectItem>
              <SelectItem value="diesel">Diesel</SelectItem>
              <SelectItem value="ethanol">Ethanol</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tank">Tank</Label>
          <Select value={tank} onValueChange={(value) => setTank(value)}>
            <SelectTrigger id="tank">
              <SelectValue placeholder="Select tank" />
            </SelectTrigger>
            <SelectContent>
              {tanks.map((tank) => (
                <SelectItem key={tank.id} value={tank.id.toString()}>
                  {tank.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="volume">Volume</Label>
          <Input
            id="volume"
            type="number"
            value={volume}
            onChange={(event) => setVolume(event.target.value)}
            placeholder="Enter volume in liters"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Enter description"
          />
        </div>
      </div>

      <Button
        onClick={handleUpdateInventory}
        className="bg-primary hover:bg-primary/90"
      >
        Update Inventory
      </Button>
    </div>
  );
}
