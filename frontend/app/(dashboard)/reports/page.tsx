"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Report {
  id: number;
  file_url: string;
  report_type: string;
  created_at: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const response = await API.get("/reports/");
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchReports()
      .then((reports) => {
        setReports(reports);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        toast({
          title: "Server Error",
          description: "Error while fetching reports please try again",
          variant: "destructive",
          className: "bg-red-500 text-white",
        });
      });
  }, []);

  const handleView = (fileUrl: string) => {
    window.open(fileUrl, "_blank");
  };

  const handleDownload = async (fileUrl: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileUrl.split("/").pop() || "report.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Error while downloading report, please try again",
        variant: "destructive",
        className: "bg-red-500 text-white",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>All Reports</CardTitle>
        <CardDescription>View and manage all reports</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Type</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="capitalize">
                      {report.report_type}
                    </TableCell>
                    <TableCell>
                      {new Date(report.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(report.file_url)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(report.file_url)}
                      >
                        Download
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
}
