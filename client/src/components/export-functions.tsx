import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FileSpreadsheet, FileText, Download, Users, Calendar, GraduationCap, Briefcase, Filter } from "lucide-react";
import { useState } from "react";

export function ExportFunctions() {
  const { toast } = useToast();
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleExport = async (endpoint: string, filename: string) => {
    try {
      const response = await fetch(endpoint, {
        credentials: "include",
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "File exported successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export file",
        variant: "destructive",
      });
    }
  };

  const exportStudents = () => handleExport("/api/export/students", "students.xlsx");
  const exportAlumni = () => handleExport("/api/export/alumni", "alumni.xlsx");
  const exportAttendance = () => handleExport("/api/export/attendance", "attendance.xlsx");

  const exportStudentsFiltered = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedBranch && selectedBranch !== 'all') params.append('branch', selectedBranch);
      if (selectedYear && selectedYear !== 'all') params.append('year', selectedYear);
      if (selectedBatch && selectedBatch !== 'all') params.append('batch', selectedBatch);
      
      const endpoint = `/api/export/students${params.toString() ? '?' + params.toString() : ''}`;
      
      const response = await fetch(endpoint, {
        credentials: "include",
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Generate filename based on filters
      let filename = "students";
      if (selectedBranch && selectedBranch !== 'all') filename += `_${selectedBranch}`;
      if (selectedYear && selectedYear !== 'all') filename += `_${selectedYear}`;
      if (selectedBatch && selectedBatch !== 'all') filename += `_${selectedBatch}`;
      filename += ".xlsx";
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Students data exported successfully!",
      });
      
      setIsDialogOpen(false);
      setSelectedBranch("all");
      setSelectedYear("all");
      setSelectedBatch("all");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export students data",
        variant: "destructive",
      });
    }
  };

  const generateReport = (type: string) => {
    toast({
      title: "Coming Soon",
      description: `${type} report generation will be available soon!`,
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-slate-800">Data Export Options</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileSpreadsheet className="w-5 h-5 text-green-600 mr-3" />
              Excel Exports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full bg-green-600 text-white hover:bg-green-700"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Export Students Data
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Export Students Data</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="branch">Department (Optional)</Label>
                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="CSE">Computer Science Engineering</SelectItem>
                        <SelectItem value="ECE">Electronics & Communication</SelectItem>
                        <SelectItem value="ME">Mechanical Engineering</SelectItem>
                        <SelectItem value="CE">Civil Engineering</SelectItem>
                        <SelectItem value="IT">Information Technology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year (Optional)</Label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        <SelectItem value="2020">2020</SelectItem>
                        <SelectItem value="2021">2021</SelectItem>
                        <SelectItem value="2022">2022</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="batch">Batch (Optional)</Label>
                    <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select batch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Batches</SelectItem>
                        <SelectItem value="2020-2024">2020-2024</SelectItem>
                        <SelectItem value="2021-2025">2021-2025</SelectItem>
                        <SelectItem value="2022-2026">2022-2026</SelectItem>
                        <SelectItem value="2023-2027">2023-2027</SelectItem>
                        <SelectItem value="2024-2028">2024-2028</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={exportStudentsFiltered}
                      className="flex-1 bg-green-600 text-white hover:bg-green-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSelectedBranch("all");
                        setSelectedYear("all");
                        setSelectedBatch("all");
                        setIsDialogOpen(false);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button 
              className="w-full bg-green-600 text-white hover:bg-green-700"
              onClick={exportAttendance}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Export Attendance Records
            </Button>
            <Button 
              className="w-full bg-green-600 text-white hover:bg-green-700"
              onClick={exportAlumni}
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Export Alumni Database
            </Button>
            <Button 
              className="w-full bg-green-600 text-white hover:bg-green-700"
              onClick={() => generateReport("Placement Results")}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Export Placement Results
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 text-red-600 mr-3" />
              PDF Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full bg-red-600 text-white hover:bg-red-700"
              onClick={() => generateReport("Placement Statistics")}
            >
              <Download className="w-4 h-4 mr-2" />
              Placement Statistics Report
            </Button>
            <Button 
              className="w-full bg-red-600 text-white hover:bg-red-700"
              onClick={() => generateReport("Event Summary")}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Event Summary Report
            </Button>
            <Button 
              className="w-full bg-red-600 text-white hover:bg-red-700"
              onClick={() => generateReport("Student Profiles")}
            >
              <Users className="w-4 h-4 mr-2" />
              Student Profile Cards
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
