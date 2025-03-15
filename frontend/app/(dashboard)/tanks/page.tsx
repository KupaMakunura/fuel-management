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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { API } from "@/services";
import { Loader2, Pencil, Plus, Trash2, FileText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Tank {
  id: string;
  name: string;
  product: string;
  capacity: number;
  created_at: string;
  updated_at: string;
}

const TankPage = () => {
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [tankToDelete, setTankToDelete] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  const fetchTanks = async () => {
    try {
      const response = await API.get("/tanks");
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch tanks");
    }
  };

  const generateReport = async () => {
    try {
      setGeneratingReport(true);
      const response = await API.get("/tanks/generate-tanks-report/");

      if (response.data.file_url) {
        window.open(response.data.file_url, "_blank");
      }

      setGeneratingReport(false);
      toast({
        title: "Report Generated Successfully",
        description: "The report has been generated and opened in a new tab.",
        variant: "default",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      setGeneratingReport(false);
      toast({
        title: "Report Generation Failed",
        description: "Error while generating report, please try again",
        variant: "destructive",
        className: "bg-red-500 text-white",
      });
    }
  };

  const handleDelete = async () => {
    if (!tankToDelete) return;

    try {
      await API.delete(`/tanks/${tankToDelete}/`);
      setTanks(tanks.filter((tank) => tank.id !== tankToDelete));
      toast({
        title: "Success",
        description: "Tank deleted successfully",
        variant: "default",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete tank",
        variant: "destructive",
        className: "bg-red-500 text-white",
      });
    } finally {
      setShowDeleteDialog(false);
      setTankToDelete(null);
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
    <>
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
            <div className="flex gap-2">
              <Button
                onClick={() => generateReport()}
                disabled={generatingReport}
                className="bg-black"
              >
                {generatingReport ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                Generate Report
              </Button>
              <Link href="/tanks/new">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" /> Add Tank
                </Button>
              </Link>
            </div>
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
                      <TableCell className="flex gap-2">
                        <Link href={`/tanks/${tank.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                          onClick={() => {
                            setTankToDelete(tank.id);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              tank.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TankPage;
