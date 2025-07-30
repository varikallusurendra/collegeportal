import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Calendar, Users, Trophy, Briefcase, User, TrendingUp, Building2, AlertCircle, Info, Star, ExternalLink, FileText } from "lucide-react";
import { AlumniRegistrationModal } from "@/components/alumni-registration-modal";
import { AttendanceModal } from "@/components/attendance-modal";
import { Event, News, ImportantNotification } from "@shared/schema";
import collegeHeaderImg from "@assets/Screenshot 2025-07-25 113411_1753423944040.png";
import campusImg from "@assets/OUTR_1753423951311.jpg";

interface PlacementStats {
  studentsPlaced: number;
  activeCompanies: number;
  avgPackage: number;
  highestPackage: number;
}
interface PlacementRecord {
  studentName: string;
  company: string;
  role: string;
}

export default function HomePage() {
  const [showAlumniModal, setShowAlumniModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const { data: news = [] } = useQuery<News[]>({
    queryKey: ["/api/news"],
  });

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: importantNotifications = [] } = useQuery<ImportantNotification[]>({
    queryKey: ["/api/important-notifications"],
  });

  // Determine event status based on dates
  const now = new Date();
  const ongoingEvents = events.filter(event => {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    return startDate <= now && now <= endDate;
  });
  
  const upcomingEvents = events.filter(event => {
    const startDate = new Date(event.startDate);
    return startDate > now;
  });
  
  const pastEvents = events.filter(event => {
    const endDate = new Date(event.endDate);
    return endDate < now;
  });

  const defaultPlacementStats: PlacementStats = {
    studentsPlaced: 0,
    activeCompanies: 0,
    avgPackage: 0,
    highestPackage: 0,
  };
  const { data: placementStats = defaultPlacementStats } = useQuery<PlacementStats>({
    queryKey: ["/api/placements/stats"],
  });
  const { data: recentPlacements = [] } = useQuery<PlacementRecord[]>({
    queryKey: ["/api/placements/recent"],
  });

  const handleMarkAttendance = (event: Event) => {
    setSelectedEvent(event);
    setShowAttendanceModal(true);
  };

  // Default notifications to show if no important notifications are available
  const defaultNotifications = [
    {
      title: "Placement Registration Open",
      description: "Students can now register for upcoming placement drives. Last date: 31st Jan 2025",
      type: "URGENT",
      color: "orange",
      link: "/placements/register",
      icon: Briefcase
    },
    {
      title: "Resume Building Workshop",
      description: "Join our expert-led resume building session on 28th Jan 2025",
      type: "NEW",
      color: "green",
      link: "/workshops/resume-building",
      icon: Star
    },
    {
      title: "Mock Interview Sessions",
      description: "Practice interviews with industry professionals. Book your slot now",
      type: "INFO",
      color: "blue",
      link: "/interviews/mock",
      icon: Info
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex flex-col justify-center">
                <span className="text-xl font-bold text-slate-900 leading-tight text-left">KITS Akshar Institute of Technology</span>
                <span className="text-base font-medium text-slate-700 text-left">T&P CELL Portal</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button className="bg-primary text-white hover:bg-primary/90">
                  <User className="w-4 h-4 mr-2" />
                  TPO Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 drop-shadow-lg" style={{textShadow: '0 2px 8px rgba(0,0,0,0.18)'}}>KITS Akshar Institute of Technology</h1>
            <p className="text-xl text-blue-100 mb-4 max-w-3xl mx-auto drop-shadow" style={{textShadow: '0 2px 8px rgba(0,0,0,0.18)'}}>
              T&P CELL Portal
            </p>
            <p className="text-lg text-blue-200 mb-8 max-w-3xl mx-auto drop-shadow" style={{textShadow: '0 2px 8px rgba(0,0,0,0.18)'}}>
              Empowering students with industry connections and career opportunities | Autonomous | AICTE Approved | Affiliated to JNTUK
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - News & Events */}
          <div className="lg:col-span-2 space-y-8">
            {/* News and Notifications Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Latest News Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 text-primary mr-3" />
                    Latest News
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {news.length === 0 ? (
                      <p className="text-slate-600 text-center py-8">No news available at the moment.</p>
                    ) : (
                      news.slice(0, 3).map((item) => (
                        <div key={item.id} className="border-l-4 border-primary pl-4 py-2">
                          <h3 className="font-semibold text-slate-800">{item.title}</h3>
                          <p className="text-slate-600 text-sm mt-1">{item.content.substring(0, 80)}...</p>
                          <span className="text-xs text-slate-500">
                            {new Date(item.createdAt!).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Notifications Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Briefcase className="w-5 h-5 text-orange-600 mr-3" />
                    Important Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {importantNotifications.length === 0 ? (
                      <div className="space-y-3">
                        {defaultNotifications.map((note, idx) => {
                          const Icon = note.icon;
                          const NotificationContent = (
                            <div className="flex items-center p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer">
                              <Icon className="w-5 h-5 text-orange-500 mr-3" />
                              <div className="flex-1">
                                <h3 className="font-semibold text-slate-800 text-sm">{note.title}</h3>
                                <p className="text-slate-600 text-xs mt-1">{note.description}</p>
                              </div>
                              <Badge className="text-xs bg-orange-500 text-white">{note.type}</Badge>
                            </div>
                          );
                          
                          return note.link ? (
                            <a 
                              key={idx} 
                              href={note.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block"
                            >
                              {NotificationContent}
                            </a>
                          ) : (
                            <div key={idx}>
                              {NotificationContent}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {importantNotifications.map((notification) => {
                          const NotificationContent = (
                            <div className="flex items-center p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
                              <AlertCircle className="w-5 h-5 text-orange-500 mr-3" />
                              <div className="flex-1">
                                <h3 className="font-semibold text-slate-800 text-sm">{notification.title}</h3>
                                <p className="text-slate-600 text-xs mt-1">{notification.type}</p>
                              </div>
                              <Badge className="text-xs bg-orange-500 text-white">{notification.type}</Badge>
                            </div>
                          );
                          
                          return notification.link ? (
                            <a 
                              key={notification.id} 
                              href={notification.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block cursor-pointer"
                            >
                              {NotificationContent}
                            </a>
                          ) : (
                            <div key={notification.id}>
                              {NotificationContent}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Events Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 text-primary mr-3" />
                  Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="ongoing" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="ongoing" className="space-y-4">
                    {ongoingEvents.length === 0 ? (
                      <p className="text-slate-600 text-center py-8">No ongoing events.</p>
                    ) : (
                      ongoingEvents.map((event) => (
                        <div key={event.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-800">{event.title}</h3>
                              <p className="text-slate-600 text-sm mt-1">{event.description}</p>
                              <p className="text-slate-600 text-sm">Company: {event.company}</p>
                              {(event.notificationLink || event.attachmentUrl) && (
                                <div className="flex gap-2 mt-2">
                                  {event.notificationLink && (
                                    <a 
                                      href={event.notificationLink} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                                    >
                                      <ExternalLink className="w-3 h-3 mr-1" />
                                      Link
                                    </a>
                                  )}
                                  {event.attachmentUrl && (
                                    <a 
                                      href={event.attachmentUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                                    >
                                      <FileText className="w-3 h-3 mr-1" />
                                      Attachment
                                    </a>
                                  )}
                                </div>
                              )}
                              <Badge className="mt-2 bg-green-500 text-white">LIVE</Badge>
                            </div>
                            <Button 
                              className="bg-green-500 text-white hover:bg-green-600"
                              onClick={() => handleMarkAttendance(event)}
                            >
                              Mark Attendance
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </TabsContent>
                  
                  <TabsContent value="upcoming" className="space-y-4">
                    {upcomingEvents.length === 0 ? (
                      <p className="text-slate-600 text-center py-8">No upcoming events.</p>
                    ) : (
                      upcomingEvents.map((event) => (
                        <div key={event.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h3 className="font-semibold text-slate-800">{event.title}</h3>
                          <p className="text-slate-600 text-sm mt-1">{event.description}</p>
                          <p className="text-slate-600 text-sm">Company: {event.company}</p>
                          {(event.notificationLink || event.attachmentUrl) && (
                            <div className="flex gap-2 mt-2">
                              {event.notificationLink && (
                                <a 
                                  href={event.notificationLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                                >
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  Link
                                </a>
                              )}
                              {event.attachmentUrl && (
                                <a 
                                  href={event.attachmentUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  Attachment
                                </a>
                              )}
                            </div>
                          )}
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-sm text-slate-500">
                              {new Date(event.startDate).toLocaleDateString()} • {new Date(event.startDate).toLocaleTimeString()}
                            </span>
                            <Badge className="bg-blue-500 text-white">UPCOMING</Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </TabsContent>
                  
                  <TabsContent value="past" className="space-y-4">
                    {pastEvents.length === 0 ? (
                      <p className="text-slate-600 text-center py-8">No past events.</p>
                    ) : (
                      pastEvents.map((event) => (
                        <div key={event.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 opacity-75">
                          <h3 className="font-semibold text-slate-700">{event.title}</h3>
                          <p className="text-slate-600 text-sm mt-1">{event.description}</p>
                          <p className="text-slate-600 text-sm">Company: {event.company}</p>
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-sm text-slate-500">
                              {new Date(event.startDate).toLocaleDateString()}
                            </span>
                            <Badge className="bg-slate-400 text-white">COMPLETED</Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Alumni Registration & Quick Stats */}
          <div className="space-y-8">
            {/* Alumni Registration Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 text-primary mr-3" />
                  Alumni Registration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm mb-4">
                  Join our alumni network and stay connected with your alma mater
                </p>
                <Button 
                  className="w-full bg-green-600 text-white hover:bg-green-700"
                  onClick={() => setShowAlumniModal(true)}
                >
                  Register Now
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-primary mr-3" />
                  Placement Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Students Placed</span>
                    <span className="font-semibold text-green-600">{placementStats?.studentsPlaced ?? '-'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Active Companies</span>
                    <span className="font-semibold text-primary">{placementStats?.activeCompanies ?? '-'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Avg Package</span>
                    <span className="font-semibold text-yellow-600">
                      {typeof placementStats?.avgPackage === 'number' ? '₹' + Math.round(placementStats.avgPackage) + ' LPA' : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Highest Package</span>
                    <span className="font-semibold text-red-600">
                      {typeof placementStats?.highestPackage === 'number' ? '₹' + Math.round(placementStats.highestPackage) + ' LPA' : '-'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Placements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 text-primary mr-3" />
                  Recent Placements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentPlacements.length === 0 ? (
                    <p className="text-slate-600 text-center py-8">No recent placements.</p>
                  ) : (
                    recentPlacements.map((placement: PlacementRecord, idx: number) => (
                      <div key={idx} className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                          <p className="font-medium text-sm">{placement.studentName}</p>
                          <p className="text-xs text-slate-600">{placement.company} - {placement.role}</p>
                    </div>
                  </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AlumniRegistrationModal 
        open={showAlumniModal} 
        onOpenChange={setShowAlumniModal} 
      />
      <AttendanceModal 
        open={showAttendanceModal} 
        onOpenChange={setShowAttendanceModal}
        event={selectedEvent}
      />
    </div>
  );
}
