import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Calendar, Users, Trophy, Briefcase, User, TrendingUp, Building2 } from "lucide-react";
import { AlumniRegistrationModal } from "@/components/alumni-registration-modal";
import { AttendanceModal } from "@/components/attendance-modal";
import { Event, News } from "@shared/schema";

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

  const ongoingEvents = events.filter(event => event.status === 'ongoing');
  const upcomingEvents = events.filter(event => event.status === 'upcoming');
  const pastEvents = events.filter(event => event.status === 'past');

  const handleMarkAttendance = (event: Event) => {
    setSelectedEvent(event);
    setShowAttendanceModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="text-primary text-2xl mr-3" />
              <span className="text-xl font-semibold text-slate-800">T&P Portal</span>
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Training & Placement Portal</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Empowering students with industry connections and career opportunities
            </p>
            <div className="rounded-xl shadow-2xl mx-auto max-w-4xl w-full h-64 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <div className="text-center">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-white/80" />
                <p className="text-white/90">Modern Campus Facilities</p>
              </div>
            </div>
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
                    <div className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50 rounded-r-lg">
                      <h3 className="font-semibold text-slate-800">Placement Registration Open</h3>
                      <p className="text-slate-600 text-sm mt-1">Students can now register for upcoming placement drives. Last date: 31st Jan 2025</p>
                      <span className="text-xs text-orange-600 font-medium">URGENT</span>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 rounded-r-lg">
                      <h3 className="font-semibold text-slate-800">Resume Building Workshop</h3>
                      <p className="text-slate-600 text-sm mt-1">Join our expert-led resume building session on 28th Jan 2025</p>
                      <span className="text-xs text-green-600 font-medium">NEW</span>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r-lg">
                      <h3 className="font-semibold text-slate-800">Mock Interview Sessions</h3>
                      <p className="text-slate-600 text-sm mt-1">Practice interviews with industry professionals. Book your slot now</p>
                      <span className="text-xs text-blue-600 font-medium">INFO</span>
                    </div>
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
                            <div>
                              <h3 className="font-semibold text-slate-800">{event.title}</h3>
                              <p className="text-slate-600 text-sm mt-1">{event.description}</p>
                              <p className="text-slate-600 text-sm">Company: {event.company}</p>
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
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-sm text-slate-500">
                              {new Date(event.eventDate).toLocaleDateString()} • {new Date(event.eventDate).toLocaleTimeString()}
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
                              {new Date(event.eventDate).toLocaleDateString()}
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
                    <span className="font-semibold text-green-600">342</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Active Companies</span>
                    <span className="font-semibold text-primary">28</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Avg Package</span>
                    <span className="font-semibold text-yellow-600">₹6.5 LPA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Highest Package</span>
                    <span className="font-semibold text-red-600">₹42 LPA</span>
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
                  <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Rahul Kumar</p>
                      <p className="text-xs text-slate-600">Microsoft - SDE</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Priya Singh</p>
                      <p className="text-xs text-slate-600">Google - SWE</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Arjun Patel</p>
                      <p className="text-xs text-slate-600">Amazon - SDE-I</p>
                    </div>
                  </div>
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
