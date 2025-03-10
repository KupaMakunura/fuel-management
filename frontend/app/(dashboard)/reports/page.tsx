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
import { Download, Plus, Loader2, BarChart } from "lucide-react";

interface Report {
  id: string;
  product: string;
  price: number;
  quantity: number;
  volume: number;
  depth: number;
  fileName: string;
  date: string;
}

const ReportsPage = () => {
  const { data: session } = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchReports = async () => {
    try {
      const response = await API.get("/reports", {
        headers: {
          Authorization: `Bearer ${session?.user.access_token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch reports");
    }
  };

  useEffect(() => {
    fetchReports()
      .then((fetchedReports) => {
        setReports(fetchedReports);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        toast({
          title: "Error",
          description: "Failed to fetch reports. Please try again.",
          variant: "destructive",
        });
      });
  }, [toast]);

  const filteredReports = reports.filter((report) =>
    report.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>All Reports</CardTitle>
        <CardDescription>
          Manage and view all your fuel product reports
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <Input
              placeholder="Search for Reports"
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
          <Link href="/reports/new">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Add Report
            </Button>
          </Link>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">No</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Depth</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report, i) => (
                  <TableRow key={report.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell className="font-medium">
                      {report.product}
                    </TableCell>
                    <TableCell>${report.price.toFixed(2)}</TableCell>
                    <TableCell>{report.quantity}</TableCell>
                    <TableCell>{report.volume.toFixed(2)} L</TableCell>
                    <TableCell>{report.depth.toFixed(2)} m</TableCell>
                    <TableCell>{report.fileName}</TableCell>
                    <TableCell>{report.date}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          Generate Predictions
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <BarChart className="h-4 w-4" />
                        </Button>
                      </div>
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

export default ReportsPage;
