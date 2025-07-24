import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FileSpreadsheet, FileText, Download, Users, Calendar, GraduationCap, Briefcase } from "lucide-react";

export function ExportFunctions() {
  const { toast } = useToast();

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
            <Button 
              className="w-full bg-green-600 text-white hover:bg-green-700"
              onClick={exportStudents}
            >
              <Users className="w-4 h-4 mr-2" />
              Export Students Data
            </Button>
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
