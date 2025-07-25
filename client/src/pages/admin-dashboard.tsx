import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, Users, Briefcase, GraduationCap, 
  Calendar, Settings, Download, LogOut,
  Plus, Edit, Trash2, FileText
} from "lucide-react";
import { useLocation } from "wouter";
import { EventManagement } from "@/components/event-management";
import { StudentManagement } from "@/components/student-management";
import { ExportFunctions } from "@/components/export-functions";
import { Event, Student, Alumni, Attendance } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: alumni = [] } = useQuery<Alumni[]>({
    queryKey: ["/api/alumni"],
  });

  const { data: attendance = [] } = useQuery<Attendance[]>({
    queryKey: ["/api/attendance"],
  });

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setLocation("/");
    } catch (error) {
      // Error handled by mutation
    }
  };

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

  const stats = {
    totalStudents: students.length,
    placedStudents: students.filter(s => s.selected).length,
    activeCompanies: Array.from(new Set(events.map(e => e.company))).length,
    alumniRegistered: alumni.length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Dashboard Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BarChart3 className="text-primary text-xl mr-3" />
              <h1 className="text-xl font-semibold text-slate-800">TPO Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">Welcome, {user?.username}</span>
              <Button 
                variant="ghost" 
                className="text-red-600 hover:text-red-700"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="alumni">Alumni</TabsTrigger>
            <TabsTrigger value="exports">Exports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Users className="text-primary text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-600">Total Students</p>
                      <p className="text-2xl font-bold text-slate-800">{stats.totalStudents}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Briefcase className="text-green-600 text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-600">Placed Students</p>
                      <p className="text-2xl font-bold text-slate-800">{stats.placedStudents}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Calendar className="text-yellow-600 text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-600">Active Companies</p>
                      <p className="text-2xl font-bold text-slate-800">{stats.activeCompanies}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <GraduationCap className="text-blue-600 text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-600">Alumni Registered</p>
                      <p className="text-2xl font-bold text-slate-800">{stats.alumniRegistered}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        event.status === 'ongoing' ? 'bg-green-500' : 
                        event.status === 'upcoming' ? 'bg-blue-500' : 'bg-slate-400'
                      }`}></div>
                      <span className="text-sm text-slate-600">
                        {event.title} - {event.company} ({event.status})
                      </span>
                      <span className="text-xs text-slate-500 ml-auto">
                        {new Date(event.eventDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  {events.length === 0 && (
                    <p className="text-slate-600 text-center py-8">No recent activities.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <EventManagement />
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <StudentManagement />
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Attendance Records</CardTitle>
                  <Button 
                    variant="outline"
                    onClick={() => handleExport("/api/export/attendance", "attendance.xlsx")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Attendance
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attendance.length === 0 ? (
                    <p className="text-slate-600 text-center py-8">No attendance records found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Student Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Roll Number
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Event
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                          {attendance.map((record) => (
                            <tr key={record.id}>
                              <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-800">
                                {record.studentName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                {record.rollNumber}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                Event #{record.eventId}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                {new Date(record.markedAt!).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alumni Tab */}
          <TabsContent value="alumni">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Alumni Database</CardTitle>
                  <Button 
                    variant="outline"
                    onClick={() => handleExport("/api/export/alumni", "alumni.xlsx")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Alumni
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alumni.length === 0 ? (
                    <p className="text-slate-600 text-center py-8">No alumni registered yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Roll No
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Pass Out Year
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Higher Education
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                              Contact
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                          {alumni.map((alumnus) => (
                            <tr key={alumnus.id}>
                              <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-800">
                                {alumnus.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                {alumnus.rollNumber}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                {alumnus.passOutYear}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                {alumnus.higherEducationCollege || 'Working'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                {alumnus.contactNumber}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exports Tab */}
          <TabsContent value="exports">
            <ExportFunctions />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
