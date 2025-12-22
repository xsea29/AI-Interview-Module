"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Briefcase,
  Video,
  Plus
} from "lucide-react";
import RecruiterLayout from "@/components/layouts/RecruiterLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

const scheduledInterviews = [
  {
    id: 1,
    candidate: "Alex Johnson",
    role: "Senior Frontend Developer",
    time: "2:00 PM - 3:00 PM",
    type: "video",
    status: "confirmed",
  },
  {
    id: 2,
    candidate: "Sarah Chen",
    role: "Product Manager",
    time: "4:30 PM - 5:30 PM",
    type: "video",
    status: "confirmed",
  },
];

const upcomingDays = [
  {
    date: "Tomorrow",
    fullDate: "December 20, 2024",
    interviews: [
      { id: 3, candidate: "Mike Peters", role: "DevOps Engineer", time: "10:00 AM", type: "video" },
      { id: 4, candidate: "Emily Brown", role: "UX Designer", time: "2:00 PM", type: "text" },
    ],
  },
  {
    date: "Friday",
    fullDate: "December 21, 2024",
    interviews: [
      { id: 5, candidate: "David Kim", role: "Backend Developer", time: "11:00 AM", type: "video" },
    ],
  },
  {
    date: "Monday",
    fullDate: "December 24, 2024",
    interviews: [
      { id: 6, candidate: "Lisa Wang", role: "Data Analyst", time: "9:00 AM", type: "video" },
      { id: 7, candidate: "James Wilson", role: "Frontend Developer", time: "1:00 PM", type: "text" },
      { id: 8, candidate: "Anna Lee", role: "Product Designer", time: "3:30 PM", type: "video" },
    ],
  },
];

const Schedule = () => {
  const [date, setDate] = useState(new Date());

  return (
    <RecruiterLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Schedule</h1>
            <p className="text-muted-foreground mt-1">Manage your interview calendar and availability</p>
          </div>
          <Button variant="accent">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Interview
          </Button>
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
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full bg-accent" />
                  <span className="text-muted-foreground">Interviews scheduled</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full bg-success" />
                  <span className="text-muted-foreground">Available slots</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Today's Schedule</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">December 19, 2024</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {scheduledInterviews.length > 0 ? (
                <div className="space-y-4">
                  {scheduledInterviews.map((interview, index) => (
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
                          <Badge variant="accent">
                            <Video className="h-3 w-3 mr-1" />
                            Video
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{interview.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {interview.time}
                        </p>
                        <Badge variant="success" className="mt-1">Confirmed</Badge>
                      </div>
                      <Button variant="accent" size="sm">Join</Button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No interviews scheduled for today</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Schedule */}
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
                    <Badge variant="secondary">{day.interviews.length} interviews</Badge>
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
                        <Badge variant={interview.type === "video" ? "accent" : "secondary"}>
                          {interview.type === "video" ? (
                            <>
                              <Video className="h-3 w-3 mr-1" />
                              Video
                            </>
                          ) : (
                            "Text"
                          )}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </RecruiterLayout>
  );
};

export default Schedule;