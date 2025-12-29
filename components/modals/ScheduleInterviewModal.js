"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, User, Briefcase, Brain, Link, Mail, Bell, MessageSquare, Video } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
];

export function ScheduleInterviewModal({ open, onOpenChange }) {
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [interviewType, setInterviewType] = useState("ai_assisted");
  const [interviewRound, setInterviewRound] = useState("");
  const [date, setDate] = useState();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [sendEmailToCandidate, setSendEmailToCandidate] = useState(true);
  const [sendCalendarInvite, setSendCalendarInvite] = useState(true);
  const [reminderTime, setReminderTime] = useState("24h");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!selectedCandidate || !interviewRound || !date || !startTime || !endTime) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Time validation
    const startIndex = timeSlots.indexOf(startTime);
    const endIndex = timeSlots.indexOf(endTime);
    
    if (startIndex >= endIndex) {
      toast({
        title: "Invalid time",
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Prepare interview data
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Combine date and time
      const startDateTime = new Date(date);
      const [startHour, startMinute, startAmPm] = startTime.match(/(\d+):(\d+)\s*(AM|PM)/i).slice(1);
      const endDateTime = new Date(date);
      const [endHour, endMinute, endAmPm] = endTime.match(/(\d+):(\d+)\s*(AM|PM)/i).slice(1);

      // Convert to 24-hour format
      let startHour24 = parseInt(startHour);
      if (startAmPm === 'PM' && startHour24 !== 12) startHour24 += 12;
      if (startAmPm === 'AM' && startHour24 === 12) startHour24 = 0;

      let endHour24 = parseInt(endHour);
      if (endAmPm === 'PM' && endHour24 !== 12) endHour24 += 12;
      if (endAmPm === 'AM' && endHour24 === 12) endHour24 = 0;

      startDateTime.setHours(startHour24, parseInt(startMinute), 0, 0);
      endDateTime.setHours(endHour24, parseInt(endMinute), 0, 0);

      const interviewData = {
        candidateId: selectedCandidate,
        interviewType: interviewType,
        interviewRound: interviewRound,
        scheduledAt: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        duration: (endDateTime - startDateTime) / (1000 * 60), // in minutes
        sendEmailToCandidate: sendEmailToCandidate,
        sendCalendarInvite: sendCalendarInvite,
        reminderTime: reminderTime,
        organizationId: user.organizationId,
        recruiterId: user._id,
        // AI bot interview doesn't require interviewers
        status: 'scheduled'
      };

      // Call API to schedule interview
      const response = await fetch('http://localhost:5000/api/v1/interviews/schedule', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interviewData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to schedule interview');
      }

      const result = await response.json();

      toast({
        title: "Interview scheduled",
        description: `AI interview has been scheduled. Candidate will receive ${interviewType === 'ai_assisted' ? 'a platform link' : 'a meeting link'} to join.`,
      });
      
      // Reset form and close modal
      resetForm();
      onOpenChange(false);

    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to schedule interview",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCandidate("");
    setInterviewType("ai_assisted");
    setInterviewRound("");
    setDate(undefined);
    setStartTime("");
    setEndTime("");
    setSendEmailToCandidate(true);
    setSendCalendarInvite(true);
    setReminderTime("24h");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold">Schedule AI Interview</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-140px)]">
          <div className="px-6 pb-6 space-y-6">
            {/* Candidate Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <User className="h-4 w-4 text-primary" />
                Candidate Information
              </div>
              <div className="space-y-2">
                <Label htmlFor="candidate">Select Candidate *</Label>
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <p className="text-sm text-muted-foreground">
                    Candidate selection will be handled from the candidate list page.
                    Click "Schedule Interview" from a candidate's actions menu.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Interview Configuration */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Brain className="h-4 w-4 text-primary" />
                AI Interview Configuration
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Interview Type *</Label>
                  <RadioGroup 
                    value={interviewType} 
                    onValueChange={setInterviewType}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ai_assisted" id="ai_assisted" />
                      <Label htmlFor="ai_assisted" className="flex items-center gap-2 cursor-pointer">
                        <Brain className="h-4 w-4" />
                        AI Screening
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ai_video" id="ai_video" />
                      <Label htmlFor="ai_video" className="flex items-center gap-2 cursor-pointer">
                        <Video className="h-4 w-4" />
                        AI + Live Video
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="round">Interview Round *</Label>
                  <Select value={interviewRound} onValueChange={setInterviewRound}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select round" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="initial_screening">Initial Screening</SelectItem>
                      <SelectItem value="technical_assessment">Technical Assessment</SelectItem>
                      <SelectItem value="coding_challenge">Coding Challenge</SelectItem>
                      <SelectItem value="behavioral_assessment">Behavioral Assessment</SelectItem>
                      <SelectItem value="culture_fit">Culture Fit Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Date & Time */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Clock className="h-4 w-4 text-primary" />
                Date & Time
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "MMM d, yyyy") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        className="pointer-events-auto"
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Start Time *</Label>
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Start" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>End Time *</Label>
                  <Select value={endTime} onValueChange={setEndTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="End" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone} (auto-detected)
              </p>
            </div>

            <Separator />

            {/* Meeting Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Link className="h-4 w-4 text-primary" />
                Interview Platform
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {interviewType === 'ai_assisted' ? (
                    "AI Screening: Candidate will receive a secure platform link to complete the AI-powered interview at their convenience within the scheduled timeframe."
                  ) : (
                    "AI + Live Video: Candidate will receive a link for the live video interview with AI assistance."
                  )}
                </p>
                <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-sm text-accent-foreground">
                    <strong>Platform Link:</strong> Will be automatically generated and sent to the candidate.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Notifications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Bell className="h-4 w-4 text-primary" />
                Notifications
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="emailCandidate" 
                    checked={sendEmailToCandidate}
                    onCheckedChange={(checked) => setSendEmailToCandidate(checked === true)}
                  />
                  <Label htmlFor="emailCandidate" className="cursor-pointer flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Send email to candidate with platform link
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="calendarInvite" 
                    checked={sendCalendarInvite}
                    onCheckedChange={(checked) => setSendCalendarInvite(checked === true)}
                  />
                  <Label htmlFor="calendarInvite" className="cursor-pointer flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    Send calendar invite
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label>Reminder</Label>
                  <Select value={reminderTime} onValueChange={setReminderTime}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 hour before</SelectItem>
                      <SelectItem value="24h">24 hours before</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                      <SelectItem value="none">No reminder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Scheduling..." : "Schedule AI Interview"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}