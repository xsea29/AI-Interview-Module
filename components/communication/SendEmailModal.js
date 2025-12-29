import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Paperclip,
  Send,
  Clock,
  FileText,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const emailTemplates = [
  { id: "interview-invite", name: "Interview Invitation", subject: "Interview Invitation - {{job_title}}" },
  { id: "rejection", name: "Application Update", subject: "Update on Your Application" },
  { id: "next-round", name: "Next Round", subject: "Congratulations! Moving to Next Round" },
  { id: "offer", name: "Offer Discussion", subject: "We'd Like to Make You an Offer" },
  { id: "custom", name: "Custom Email", subject: "" },
];

const templateBodies = {
  "interview-invite": `Dear {{candidate_name}},

Thank you for your interest in the {{job_title}} position at our company.

We were impressed by your background and would like to invite you for an interview. Please let us know your availability for the coming week.

Best regards,
{{sender_name}}`,
  "rejection": `Dear {{candidate_name}},

Thank you for taking the time to apply for the {{job_title}} position.

After careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current needs.

We appreciate your interest and wish you the best in your job search.

Best regards,
{{sender_name}}`,
  "next-round": `Dear {{candidate_name}},

Congratulations! We're pleased to inform you that you've been selected to move forward to the next round of interviews for the {{job_title}} position.

We'll be in touch shortly to schedule your next interview.

Best regards,
{{sender_name}}`,
  "offer": `Dear {{candidate_name}},

We are delighted to extend an offer for the {{job_title}} position at our company.

Please find the offer details attached. We're excited about the possibility of having you join our team.

Best regards,
{{sender_name}}`,
  "custom": "",
};

const variables = [
  { key: "{{candidate_name}}", label: "Candidate Name" },
  { key: "{{job_title}}", label: "Job Title" },
  { key: "{{interview_date}}", label: "Interview Date" },
  { key: "{{sender_name}}", label: "Your Name" },
];

const SendEmailModal = ({ open, onOpenChange, candidate }) => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [cc, setCc] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [scheduleFor, setScheduleFor] = useState("now");

  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject.replace("{{job_title}}", candidate.jobId?.title || "the position"));
      setBody(templateBodies[templateId]
        .replace(/{{candidate_name}}/g, candidate.personalInfo?.name || "Candidate")
        .replace(/{{job_title}}/g, candidate.jobId?.title || "the position")
        .replace(/{{sender_name}}/g, "Your Name")
      );
    }
  };

  const insertVariable = (variable) => {
    setBody(prev => `${prev}${variable}`);
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) return;
    
    try {
      setIsSending(true);
      
      // Get user info from localStorage
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Prepare email data
      const emailData = {
        organizationId: user.organizationId,
        userId: user._id,
        subject,
        body,
        template: selectedTemplate === "custom" ? "custom" : selectedTemplate,
        recipient: {
          name: candidate.personalInfo?.name,
          email: candidate.personalInfo?.email,
        },
      };

      // Send email via API
      const response = await fetch(`http://localhost:5000/api/v1/candidates/${candidate._id}/email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      toast({
        title: "Email sent",
        description: `Email sent to ${candidate.personalInfo?.email}`,
      });
      
      // Reset form
      setSelectedTemplate("");
      setSubject("");
      setBody("");
      setCc("");
      setAttachments([]);
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const removeAttachment = (name) => {
    setAttachments(prev => prev.filter(a => a !== name));
  };

  const handleAddAttachment = (file) => {
    // In a real implementation, you would upload the file
    // For now, we'll just add a placeholder
    setAttachments(prev => [...prev, file.name]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Email to Candidate</DialogTitle>
          <DialogDescription>
            Compose and send an email to {candidate.personalInfo?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* To Field */}
          <div className="space-y-2">
            <Label>To</Label>
            <Input value={candidate.personalInfo?.email || ''} disabled className="bg-muted" />
          </div>

          {/* CC Field */}
          <div className="space-y-2">
            <Label>CC (optional)</Label>
            <Input
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="hiring-manager@company.com"
            />
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <Label>Email Template</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template..." />
              </SelectTrigger>
              <SelectContent>
                {emailTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Message</Label>
              <div className="flex flex-wrap gap-1">
                {variables.map((v) => (
                  <Badge
                    key={v.key}
                    variant="outline"
                    className="cursor-pointer text-xs hover:bg-accent hover:text-accent-foreground"
                    onClick={() => insertVariable(v.key)}
                  >
                    {v.label}
                  </Badge>
                ))}
              </div>
            </div>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your email here..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              Attachments
            </Label>
            <div className="flex flex-wrap gap-2">
              {attachments.map((file) => (
                <Badge key={file} variant="secondary" className="gap-1">
                  <FileText className="h-3 w-3" />
                  {file}
                  <button 
                    onClick={() => removeAttachment(file)}
                    className="hover:bg-muted rounded"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <input
                type="file"
                id="attachment-upload"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleAddAttachment(e.target.files[0]);
                  }
                }}
              />
              <label htmlFor="attachment-upload">
                <Button
                  variant="outline"
                  size="sm"
                  as="span"
                  className="cursor-pointer"
                >
                  <Paperclip className="h-4 w-4 mr-1" />
                  Add File
                </Button>
              </label>
            </div>
          </div>

          <Separator />

          {/* Send Options */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant={scheduleFor === "now" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setScheduleFor("now")}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Now
              </Button>
              <Button
                variant={scheduleFor === "later" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setScheduleFor("later")}
              >
                <Clock className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                variant="accent"
                onClick={handleSend}
                disabled={!subject.trim() || !body.trim() || isSending}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSending ? "Sending..." : "Send Email"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendEmailModal;