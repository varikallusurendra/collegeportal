import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, Briefcase, GraduationCap, Calendar, Settings, Download, LogOut, Plus, Edit, Trash2, FileText } from 'lucide-react';
import { DepartmentList } from '@/components/tpo/students/department-list';
import { YearList as StudentYearList } from '@/components/tpo/students/year-list';
import { StudentList } from '@/components/tpo/students/student-list';
import { StudentDetails } from '@/components/tpo/students/student-details';
import { CompanyList } from '@/components/tpo/events/company-list';
import { YearList as EventYearList } from '@/components/tpo/events/year-list';
import { EventList } from '@/components/tpo/events/event-list';
import { EventDetails } from '@/components/tpo/events/event-details';
import { YearList as AlumniYearList } from '@/components/tpo/alumni/year-list';
import { AlumniList } from '@/components/tpo/alumni/alumni-list';
import { AlumniDetails } from '@/components/tpo/alumni/alumni-details';
import { fetchDepartments, fetchYears as fetchStudentYears, fetchStudentsByDepartmentYear } from '@/api/students';
import { fetchCompanies, fetchYears as fetchEventYears, fetchEventsByCompanyYear } from '@/api/events';
import { Event, Student, Alumni, Attendance } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { ExportFunctions } from '@/components/export-functions';
import { ImportFunctions } from '@/components/import-functions';
import { NotificationManagement } from '@/components/notification-management';
import { EventManagement } from '@/components/event-management';
import { StudentManagement } from '@/components/student-management';
import { AlumniManagement } from '@/components/alumni-management';
import { AttendanceModal } from '@/components/attendance-modal';
import collegeHeaderImg from '@assets/Screenshot 2025-07-25 113411_1753423944040.png';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Existing dashboard data
  const { data: events = [] } = useQuery<Event[]>({ queryKey: ['/api/events'] });
  const { data: students = [] } = useQuery<Student[]>({ queryKey: ['/api/students'] });
  const { data: alumni = [] } = useQuery<Alumni[]>({ queryKey: ['/api/alumni'] });
  const { data: attendance = [] } = useQuery<Attendance[]>({ queryKey: ['/api/attendance'] });

  // Students navigation state
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [studentYears, setStudentYears] = useState<number[]>([]);
  const [selectedStudentYear, setSelectedStudentYear] = useState<number | null>(null);
  const [studentsNav, setStudentsNav] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Events navigation state
  const [companies, setCompanies] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [eventYears, setEventYears] = useState<number[]>([]);
  const [selectedEventYear, setSelectedEventYear] = useState<number | null>(null);
  const [eventsNav, setEventsNav] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  // Alumni navigation state
  const [alumniYears, setAlumniYears] = useState<number[]>([]);
  const [selectedAlumniYear, setSelectedAlumniYear] = useState<number | null>(null);
  const [alumniNav, setAlumniNav] = useState<any[]>([]);
  const [selectedAlumni, setSelectedAlumni] = useState<any | null>(null);

  // Modal states for management components
  const [showEventManagement, setShowEventManagement] = useState(false);
  const [showStudentManagement, setShowStudentManagement] = useState(false);
  const [showAlumniManagement, setShowAlumniManagement] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedEventForAttendance, setSelectedEventForAttendance] = useState<Event | null>(null);

  // Load departments, companies, and alumni years on mount with optimized queries
  useEffect(() => {
    // Use direct API calls instead of slow fetchDepartments function
    const loadData = async () => {
      try {
        // Extract departments from existing students data (filter out null/undefined)
        const depts = Array.from(new Set(students.map(s => s.branch).filter((branch): branch is string => Boolean(branch)))).sort();
        setDepartments(depts);

        // Extract companies from existing events data (filter out null/undefined)
        const comps = Array.from(new Set(events.map(e => e.company).filter((company): company is string => Boolean(company)))).sort();
        setCompanies(comps);

        // Extract unique alumni pass out years
        const years = Array.from(new Set(alumni.map(a => a.passOutYear))).sort((a, b) => b - a);
        setAlumniYears(years);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    if (students.length > 0 || events.length > 0 || alumni.length > 0) {
      loadData();
    }
  }, [students, events, alumni]);

  // Load years when department/company is selected - optimized
  useEffect(() => {
    if (selectedDept) {
      // Use existing students data instead of API call (filter out null/undefined)
      const years = Array.from(new Set(
        students.filter(s => s.branch === selectedDept).map(s => s.year).filter((year): year is number => Boolean(year))
      )).sort((a, b) => b - a);
      setStudentYears(years);
      setSelectedStudentYear(null);
      setStudentsNav([]);
      setSelectedStudent(null);
    }
  }, [selectedDept, students]);

  useEffect(() => {
    if (selectedCompany) {
      // Use existing events data instead of API call - extract year from startDate
      const years = Array.from(new Set(
        events.filter(e => e.company === selectedCompany).map(e => new Date(e.startDate).getFullYear()).filter(Boolean)
      )).sort((a, b) => (b || 0) - (a || 0));
      setEventYears(years);
      setSelectedEventYear(null);
      setEventsNav([]);
      setSelectedEvent(null);
    }
  }, [selectedCompany, events]);

  // Load students/events when year is selected - optimized
  useEffect(() => {
    if (selectedDept && selectedStudentYear !== null) {
      // Use existing students data instead of API call
      const filteredStudents = students.filter(
        s => s.branch === selectedDept && s.year === selectedStudentYear
      );
      setStudentsNav(filteredStudents);
    }
  }, [selectedDept, selectedStudentYear, students]);

  useEffect(() => {
    if (selectedCompany && selectedEventYear !== null) {
      // Use existing events data instead of API call
      const filteredEvents = events.filter(
        e => e.company === selectedCompany && new Date(e.startDate).getFullYear() === selectedEventYear
      );
      setEventsNav(filteredEvents);
    }
  }, [selectedCompany, selectedEventYear, events]);

  useEffect(() => {
    if (selectedAlumniYear !== null) {
      // Use existing alumni data instead of API call
      const filteredAlumni = alumni.filter(
        a => a.passOutYear === selectedAlumniYear
      );
      setAlumniNav(filteredAlumni);
      setSelectedStudent(null);
    }
  }, [selectedDept, selectedStudentYear]);

  // Fetch companies and years when events change
  useEffect(() => {
    if (events.length > 0) {
      const companies = Array.from(new Set(events.map(event => event.company)));
      const years = Array.from(new Set(events.map(event => 
        new Date(event.startDate!).getFullYear()
      ))).sort((a, b) => b - a);

      setCompanies(companies);
      setEventYears(years);
    }
  }, [events.length]);

  // Fetch students years
  useEffect(() => {
    if (students.length > 0) {
      const years = Array.from(new Set(students.map(student => student.year))).sort((a, b) => b - a);
      setStudentYears(years);
    }
  }, [students.length]);

  // Fetch alumni years
  useEffect(() => {
    if (alumni.length > 0) {
      const years = Array.from(new Set(alumni.map(a => a.passOutYear))).sort((a, b) => b - a);
      setAlumniYears(years);
    }
  }, [alumni.length]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setLocation('/');
    } catch (error) {}
  };

  const handleExport = async (endpoint: string, filename: string) => {
    try {
      const response = await fetch(endpoint, {
        credentials: 'include',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });
      if (!response.ok) throw new Error('Export failed');
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
      toast({ title: 'Success', description: 'File exported successfully!' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to export file', variant: 'destructive' });
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
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-slate-800">TPO Dashboard</h1>
                <span className="text-xs text-slate-600">KITS Akshar Institute of Technology</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">Welcome, {user?.username}</span>
              <Button variant="ghost" className="text-red-600 hover:text-red-700" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-8 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="alumni">Alumni</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="exports">Exports</TabsTrigger>
            <TabsTrigger value="imports">Imports</TabsTrigger>
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
                  {events.slice(0, 5).map((event) => {
                    let dateStr = 'Date not available';
                    if (event.startDate && !isNaN(new Date(event.startDate).getTime())) {
                      dateStr = new Date(event.startDate).toLocaleDateString();
                    }
                    const status = (event as any).status || 'upcoming';
                    return (
                      <div key={event.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                        <div className={`w-2 h-2 rounded-full ${status === 'ongoing' ? 'bg-green-500' : status === 'upcoming' ? 'bg-blue-500' : 'bg-slate-400'}`}></div>
                        <span className="text-sm text-slate-600">{event.title} - {event.company} ({status})</span>
                        <span className="text-xs text-slate-500 ml-auto">{dateStr}</span>
                      </div>
                    );
                  })}
                  {events.length === 0 && (
                    <p className="text-slate-600 text-center py-8">No recent activities.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Events Tab */}
          <TabsContent value="events">
            {!selectedCompany ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-semibold text-slate-800">Events by Company</h3>
                  <Button className="bg-primary text-white" onClick={() => setShowEventManagement(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </div>
                <CompanyList companies={companies} onSelect={setSelectedCompany} />
              </>
            ) : !selectedEventYear ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <button className="px-4 py-2 bg-slate-200 rounded" onClick={() => setSelectedCompany(null)}>Back</button>
                  <Button className="bg-primary text-white" onClick={() => setShowEventManagement(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </div>
                <EventYearList years={eventYears} onSelect={setSelectedEventYear} />
              </>
            ) : !selectedEvent ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <button className="px-4 py-2 bg-slate-200 rounded" onClick={() => setSelectedEventYear(null)}>Back</button>
                  <Button className="bg-primary text-white" onClick={() => setShowEventManagement(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </div>
                <EventList 
                  events={eventsNav} 
                  onSelect={setSelectedEvent}
                  onEdit={(event) => {
                    setShowEventManagement(true);
                  }}
                  onDelete={async (eventId) => {
                    try {
                      const response = await fetch(`/api/events/${eventId}`, {
                        method: 'DELETE',
                        credentials: 'include'
                      });
                      if (response.ok) {
                        toast({ title: 'Success', description: 'Event deleted successfully!' });
                        window.location.reload();
                      }
                    } catch (error) {
                      toast({ title: 'Error', description: 'Failed to delete event', variant: 'destructive' });
                    }
                  }}
                />
              </>
            ) : (
              <EventDetails event={selectedEvent} onBack={() => setSelectedEvent(null)} />
            )}
          </TabsContent>
          {/* Students Tab */}
          <TabsContent value="students">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-semibold text-slate-800">Student Management</h3>
                  <p className="text-slate-600">Complete CRUD operations - Create, Read, Update, Delete students</p>
                </div>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white" 
                  onClick={() => setShowStudentManagement(true)}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Students (CRUD)
                </Button>
              </div>

              {!selectedDept ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Browse Students by Department</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DepartmentList departments={departments} onSelect={setSelectedDept} />
                  </CardContent>
                </Card>
              ) : !selectedStudentYear ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Years in {selectedDept}</CardTitle>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedDept(null)}
                      className="ml-auto"
                    >
                      Back to Departments
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <StudentYearList years={studentYears} onSelect={setSelectedStudentYear} />
                  </CardContent>
                </Card>
              ) : !selectedStudent ? (
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedDept} Year {selectedStudentYear} Students</CardTitle>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedStudentYear(null)}
                      className="ml-auto"
                    >
                      Back to Years
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <StudentList 
                      students={studentsNav} 
                      onSelect={setSelectedStudent}
                      onEdit={(student) => {
                        // Set editing student and open management modal
                        setShowStudentManagement(true);
                      }}
                      onDelete={async (studentId) => {
                        try {
                          const response = await fetch(`/api/students/${studentId}`, {
                            method: 'DELETE',
                            credentials: 'include'
                          });
                          if (response.ok) {
                            toast({ title: 'Success', description: 'Student deleted successfully!' });
                            // Refresh data
                            window.location.reload();
                          }
                        } catch (error) {
                          toast({ title: 'Error', description: 'Failed to delete student', variant: 'destructive' });
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Student Details</CardTitle>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedStudent(null)}
                      className="ml-auto"
                    >
                      Back to List
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <StudentDetails student={selectedStudent} onBack={() => setSelectedStudent(null)} />
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          {/* Attendance Tab */}
          <TabsContent value="attendance">
            {!selectedDept ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-semibold text-slate-800">Attendance by Department</h3>
                  <Button 
                    className="bg-primary text-white" 
                    onClick={() => {
                      if (events.length > 0) {
                        setSelectedEventForAttendance(events[0]);
                        setShowAttendanceModal(true);
                      } else {
                        toast({
                          title: "No Events Available",
                          description: "Please create an event first before marking attendance.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Attendance
                  </Button>
                </div>
                <DepartmentList departments={departments} onSelect={setSelectedDept} />
              </>
            ) : !selectedStudentYear ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <button className="px-4 py-2 bg-slate-200 rounded" onClick={() => setSelectedDept(null)}>Back</button>
                  <Button 
                    className="bg-primary text-white" 
                    onClick={() => {
                      if (events.length > 0) {
                        setSelectedEventForAttendance(events[0]);
                        setShowAttendanceModal(true);
                      } else {
                        toast({
                          title: "No Events Available",
                          description: "Please create an event first before marking attendance.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Attendance
                  </Button>
                </div>
                <StudentYearList years={studentYears} onSelect={setSelectedStudentYear} />
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <button className="px-4 py-2 bg-slate-200 rounded" onClick={() => setSelectedStudentYear(null)}>Back</button>
                  <div className="space-x-2">
                    <Button 
                      className="bg-primary text-white" 
                      onClick={() => {
                        if (events.length > 0) {
                          setSelectedEventForAttendance(events[0]);
                          setShowAttendanceModal(true);
                        } else {
                          toast({
                            title: "No Events Available",
                            description: "Please create an event first before marking attendance.",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Attendance
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('/api/export/attendance', 'attendance.xlsx')}>
                      <Download className="w-4 h-4 mr-2" /> Export
                    </Button>
                  </div>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Attendance Records - {selectedDept} Year {selectedStudentYear}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {attendance.filter(a => a.branch === selectedDept && a.year === selectedStudentYear).length === 0 ? (
                        <p className="text-slate-600 text-center py-8">No attendance records found for this department and year.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Roll Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Event</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                              {attendance
                                .filter(a => a.branch === selectedDept && a.year === selectedStudentYear)
                                .map((record) => (
                                <tr key={record.id}>
                                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-800">{record.studentName}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">{record.rollNumber}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                    {events.find(e => e.id === record.eventId)?.title || 'Unknown Event'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                    {record.markedAt ? new Date(record.markedAt).toLocaleDateString() : 'N/A'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                    <div className="flex space-x-2">
                                      <Button size="sm" variant="outline">
                                        <Edit className="w-3 h-3" />
                                      </Button>
                                      <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
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
              </>
            )}
          </TabsContent>
          {/* Alumni Tab */}
          <TabsContent value="alumni">
            {!selectedAlumniYear ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-semibold text-slate-800">Alumni by Pass Out Year</h3>
                  <Button className="bg-primary text-white" onClick={() => setShowAlumniManagement(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Alumni
                  </Button>
                </div>
                <AlumniYearList years={alumniYears} onSelect={setSelectedAlumniYear} />
              </>
            ) : !selectedAlumni ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <button className="px-4 py-2 bg-slate-200 rounded" onClick={() => setSelectedAlumniYear(null)}>Back</button>
                  <Button className="bg-primary text-white" onClick={() => setShowAlumniManagement(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Alumni
                  </Button>
                </div>
                <AlumniList 
                  alumni={alumniNav} 
                  onSelect={setSelectedAlumni}
                  onEdit={(alumni) => {
                    setShowAlumniManagement(true);
                  }}
                  onDelete={async (alumniId) => {
                    try {
                      const response = await fetch(`/api/alumni/${alumniId}`, {
                        method: 'DELETE',
                        credentials: 'include'
                      });
                      if (response.ok) {
                        toast({ title: 'Success', description: 'Alumni deleted successfully!' });
                        window.location.reload();
                      }
                    } catch (error) {
                      toast({ title: 'Error', description: 'Failed to delete alumni', variant: 'destructive' });
                    }
                  }}
                />
              </>
            ) : (
              <AlumniDetails alumni={selectedAlumni} onBack={() => setSelectedAlumni(null)} />
            )}
          </TabsContent>
          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <NotificationManagement />
          </TabsContent>
          {/* Exports Tab */}
          <TabsContent value="exports">
            <ExportFunctions />
          </TabsContent>
          {/* Imports Tab */}
          <TabsContent value="imports">
            <ImportFunctions />
          </TabsContent>
        </Tabs>
      </div>

      {/* Management Component Modals */}
      {showEventManagement && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Event Management</h2>
                <Button variant="outline" onClick={() => setShowEventManagement(false)}>
                  Close
                </Button>
              </div>
              <EventManagement />
            </div>
          </div>
        </div>
      )}

      {showStudentManagement && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Student Management</h2>
                <Button variant="outline" onClick={() => setShowStudentManagement(false)}>
                  Close
                </Button>
              </div>
              <StudentManagement />
            </div>
          </div>
        </div>
      )}

      {showAlumniManagement && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Alumni Management</h2>
                <Button variant="outline" onClick={() => setShowAlumniManagement(false)}>
                  Close
                </Button>
              </div>
              <AlumniManagement />
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      <AttendanceModal 
        open={showAttendanceModal}
        onOpenChange={setShowAttendanceModal}
        event={selectedEventForAttendance}
      />
    </div>
  );
}