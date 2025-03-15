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

const InventoryPage = () => {
  const [inventory, setInventory] = useState<any[]>();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [generatingReport, setGeneratingReport] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [inventoryToDelete, setInventoryToDelete] = useState<string | null>(
    null
  );

  // call the api
  const fetchInventory = async () => {
    try {
      const response = await API.get("/inventory");
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const generateReport = async () => {
    try {
      setGeneratingReport(true);
      const response = await API.get("/inventory/generate-inventory-report/");

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
    if (!inventoryToDelete) return;

    try {
      await API.delete(`/inventory/${inventoryToDelete}/`);
      setInventory(inventory?.filter((item) => item.id !== inventoryToDelete));
      toast({
        title: "Success",
        description: "Inventory deleted successfully",
        variant: "default",
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete inventory",
        variant: "destructive",
        className: "bg-red-500 text-white",
      });
    } finally {
      setShowDeleteDialog(false);
      setInventoryToDelete(null);
    }
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
  }, []);

  return (
    <>
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
              <Link href="/inventory/new">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" /> Add Inventory
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
                    <TableHead>Tank</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory?.map((row, i) => (
                    <TableRow key={row.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.tank?.name ?? "No Tank"}</TableCell>
                      <TableCell>{row.volume}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell>
                        {new Date(row.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Link href={`/inventory/${row.id}/edit`}>
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
                            setInventoryToDelete(row.id);
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
              inventory item.
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

export default InventoryPage;
