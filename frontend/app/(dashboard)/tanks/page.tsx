"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { API } from "@/services";
import { toast } from "@/hooks/use-toast";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pencil, Plus, Loader2 } from "lucide-react";

interface Tank {
  id: string;
  name: string;
  product: string;
  capacity: number;
  created_at: string;
  updated_at: string;
}

const TankPage = () => {
  const { data: session } = useSession();
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTanks = async () => {
    try {
      const response = await API.get("/tanks");
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch tanks");
    }
  };

  useEffect(() => {
    fetchTanks()
      .then((fetchedTanks) => {
        setTanks(fetchedTanks);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        toast({
          title: "Error",
          description: "Failed to fetch tanks. Please try again.",
          variant: "destructive",
        });
      });
  }, []);

  const filteredTanks = tanks.filter((tank) =>
    tank.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>All Tanks</CardTitle>
        <CardDescription>Manage and view all your tanks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <Input
              placeholder="Search for Tanks"
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
          <Link href="/tanks/new">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Add Tank
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
                  <TableHead>Name</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTanks.map((tank, i) => (
                  <TableRow key={tank.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell className="font-medium">{tank.name}</TableCell>
                    <TableCell>{tank.product}</TableCell>
                    <TableCell>{tank.capacity} L</TableCell>
                    <TableCell>
                      {new Date(tank.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
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

export default TankPage;
