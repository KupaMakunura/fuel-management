"use client";
import React, { useState } from "react";
import { useEffect } from "react";
import { API } from "@/services";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Pencil, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const InventoryPage = () => {
  const { data: session } = useSession();
  const [inventory, setInventory] = useState<any[]>();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // call the api
  const fetchInventory = async () => {
    const response = await API.get("/inventory", {
      headers: {
        Authorization: `Bearer ${session?.user.access_token}`,
      },
    });

    return response.data;
  };

  useEffect(() => {
    fetchInventory()
      .then((inventory) => {
        setInventory(inventory);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        toast({
          title: "Server Error",
          description: "Error while fetching inventory please try again",
          variant: "destructive",
          className: "bg-red-500 text-white",
        });
      });
  }, [toast]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>All Inventory</CardTitle>
        <CardDescription>Manage and view all Inventory</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <Input
              placeholder="Search for Inventory"
              className="w-[300px] pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <Link href="/inventory/new">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Add Inventory
            </Button>
          </Link>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="rounded-md ">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">No</TableHead>

                  <TableHead>Product</TableHead>
                  <TableHead>Measured Depth</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory?.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>{i}</TableCell>
                    <TableCell>{row.product}</TableCell>
                    <TableCell>{row.quantity}</TableCell>
                    <TableCell>{row.date}</TableCell>

                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4 text-gray-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryPage;
