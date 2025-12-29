"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Briefcase,
  Video,
  Plus,
  Loader2,
  MessageSquare,
  Phone,
  Users,
  CheckCircle2,
  XCircle
} from "lucide-react";
import RecruiterLayout from "@/components/layouts/RecruiterLayout";
import { ScheduleInterviewModal } from "@/components/modals/ScheduleInterviewModal"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const API_BASE_URL = "http://localhost:5000/api/v1";

const Schedule = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [todayInterviews, setTodayInterviews] = useState([]);
  const [upcomingDays, setUpcomingDays] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState({});
  const [stats, setStats] = useState({
    totalInterviews: 0,
    todayInterviews: 0,
    completedInterviews: 0,
    pendingInterviews: 0
  });

  // Fetch schedule data on component mount
  useEffect(() => {
    fetchScheduleData();
  }, []);

  // Fetch data when date changes for calendar
  useEffect(() => {
    fetchCalendarEvents();
  }, [date.getMonth(), date.getFullYear()]);

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Fetch today's interviews
      const todayResponse = await fetch(
        `${API_BASE_URL}/schedule/today?recruiterId=${user._id}&organizationId=${user.organizationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Fetch upcoming interviews
      const upcomingResponse = await fetch(
        `${API_BASE_URL}/schedule/upcoming?recruiterId=${user._id}&organizationId=${user.organizationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Fetch stats
      const statsResponse = await fetch(
        `${API_BASE_URL}/schedule/stats?recruiterId=${user._id}&organizationId=${user.organizationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (todayResponse.ok) {
        const todayData = await todayResponse.json();
        setTodayInterviews(todayData.data?.interviews || []);
      }

      if (upcomingResponse.ok) {
        const upcomingData = await upcomingResponse.json();
        setUpcomingDays(upcomingData.data || []);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data || {
          totalInterviews: 0,
          todayInterviews: 0,
          completedInterviews: 0,
          pendingInterviews: 0
        });
      }

    } catch (err) {
      console.error('Error fetching schedule data:', err);
      toast({
        title: "Error",
        description: "Failed to load schedule data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarEvents = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const month = date.getMonth();
      const year = date.getFullYear();
      
      const response = await fetch(
        `${API_BASE_URL}/schedule/calendar?recruiterId=${user._id}&organizationId=${user.organizationId}&month=${month}&year=${year}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCalendarEvents(data.data || {});
      }
    } catch (err) {
      console.error('Error fetching calendar events:', err);
    }
  };

  const getInterviewTypeIcon = (type) => {
    switch (type) {
      case 'video':
      case 'ai_assisted':
        return <Video className="h-4 w-4" />;
      case 'phone_screen':
        return <Phone className="h-4 w-4" />;
      case 'manual':
      case 'take-home':
        return <MessageSquare className="h-4 w-4" />;
      case 'in_person':
        return <Users className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
      case 'ready':
        return <Badge variant="warning">Scheduled</Badge>;
      case 'in_progress':
        return <Badge variant="accent">In Progress</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleJoinInterview = (interviewId) => {
    router.push(`/recruiter/interviews/${interviewId}/live`);
  };

  const handleScheduleNew = () => {
    setShowScheduleModal(true);
    // router.push('/recruiter/interviews/new');
  };

  const handlePreviousDay = () => {
    const prevDay = new Date(date);
    prevDay.setDate(prevDay.getDate() - 1);
    setDate(prevDay);
    // In a real implementation, you would fetch interviews for the previous day
  };

  const handleNextDay = () => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    setDate(nextDay);
    // In a real implementation, you would fetch interviews for the next day
  };

  // Format date for display
  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Check if there are any events on the selected calendar date
  const getEventsForSelectedDate = () => {
    const day = date.getDate();
    return calendarEvents[day] || [];
  };

  if (loading) {
    return (
      <RecruiterLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <span className="ml-2">Loading schedule...</span>
        </div>
      </RecruiterLayout>
    );
  }

  return (
    <RecruiterLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Schedule</h1>
            <p className="text-muted-foreground mt-1">Manage your interview calendar and availability</p>
          </div>
          <Button variant="accent" 
          // onClick={handleScheduleNew}
          onClick={handleScheduleNew} 
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Interview
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalInterviews}</p>
                  <p className="text-sm text-muted-foreground">Total Interviews</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.todayInterviews}</p>
                  <p className="text-sm text-muted-foreground">Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.completedInterviews}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.pendingInterviews}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
              <div className="mt-4 space-y-3">
                <div className="text-sm font-medium text-foreground mb-2">
                  Events on {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                {getEventsForSelectedDate().length > 0 ? (
                  <div className="space-y-2">
                    {getEventsForSelectedDate().map((event, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm p-2 bg-secondary/50 rounded">
                        <div className="h-2 w-2 rounded-full bg-accent" />
                        <span className="text-foreground font-medium truncate">{event.candidate}</span>
                        <span className="text-muted-foreground text-xs">{event.time}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No interviews scheduled</p>
                )}
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-accent" />
                    <span className="text-muted-foreground">Interviews scheduled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-success" />
                    <span className="text-muted-foreground">Completed interviews</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Today's Schedule</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{formatDisplayDate(new Date())}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePreviousDay}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextDay}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {todayInterviews.length > 0 ? (
                <div className="space-y-4">
                  {todayInterviews.map((interview, index) => (
                    <motion.div
                      key={interview.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                        <span className="text-lg font-semibold text-accent">
                          {interview.candidate.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground">{interview.candidate}</h3>
                          <Badge variant="accent" className="gap-1">
                            {getInterviewTypeIcon(interview.type)}
                            {interview.type.charAt(0).toUpperCase() + interview.type.slice(1)}
                          </Badge>
                          {getStatusBadge(interview.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{interview.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {interview.time}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(interview.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {interview.status === 'scheduled' || interview.status === 'ready' ? (
                        <Button 
                          variant="accent" 
                          size="sm"
                          onClick={() => handleJoinInterview(interview.id)}
                        >
                          Join
                        </Button>
                      ) : interview.status === 'completed' ? (
                        <Button variant="outline" size="sm">View Report</Button>
                      ) : null}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No interviews scheduled for today</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={handleScheduleNew}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Interview
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Schedule */}
        {upcomingDays.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Interviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {upcomingDays.map((day, dayIndex) => (
                  <motion.div
                    key={day.date}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: dayIndex * 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-foreground">{day.date}</h3>
                      <span className="text-sm text-muted-foreground">{day.fullDate}</span>
                      <Badge variant="secondary">{day.interviews.length} interview(s)</Badge>
                    </div>
                    <div className="space-y-2 pl-4 border-l-2 border-border">
                      {day.interviews.map((interview) => (
                        <div
                          key={interview.id}
                          className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/30 transition-colors"
                        >
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{interview.candidate}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Briefcase className="h-3.5 w-3.5" />
                              {interview.role}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-foreground">{interview.time}</span>
                          </div>
                          <Badge variant={interview.type === "video" ? "accent" : "secondary"} className="gap-1">
                            {getInterviewTypeIcon(interview.type)}
                            {interview.type.charAt(0).toUpperCase() + interview.type.slice(1)}
                          </Badge>
                          {getStatusBadge(interview.status)}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Schedule Interview Modal */}
<ScheduleInterviewModal 
  open={showScheduleModal} 
  onOpenChange={setShowScheduleModal} 
/>
    </RecruiterLayout>
  );
};

export default Schedule;