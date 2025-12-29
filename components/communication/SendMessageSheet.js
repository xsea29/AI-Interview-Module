import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  AtSign,
  Paperclip,
  Send,
  Lock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const teamMembers = [
  { id: 1, name: "John Smith", role: "Recruiter" },
  { id: 2, name: "Sarah Johnson", role: "Hiring Manager" },
  { id: 3, name: "Mike Chen", role: "Engineering Lead" },
];

const SendMessageSheet = ({ open, onOpenChange, candidateName, candidateId }) => {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isInternal, setIsInternal] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [noteType, setNoteType] = useState("general");

  const handleSend = async () => {
    if (!message.trim()) return;
    
    try {
      setIsSending(true);
      
      // Get user info from localStorage
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Prepare note data
      const noteData = {
        text: message,
        organizationId: user.organizationId,
        userId: user._id,
        type: noteType,
        visibility: isInternal ? 'team' : 'public',
        mentions: getMentionsFromMessage(message),
      };

      // Send note via API
      const response = await fetch(`http://localhost:5000/api/v1/candidates/${candidateId}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        throw new Error('Failed to add note');
      }

      toast({
        title: "Note added",
        description: "Your internal note has been added.",
      });
      
      // Reset form
      setMessage("");
      setNoteType("general");
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

  const getMentionsFromMessage = (text) => {
    // Extract @mentions from message
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const matches = [...text.matchAll(mentionRegex)];
    return matches.map(match => match[1]);
  };

  const insertMention = (name) => {
    setMessage(prev => `${prev}@${name} `);
  };

  const handleAddAttachment = async (file) => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('organizationId', user.organizationId);
      formData.append('type', 'note_attachment');
      formData.append('candidateId', candidateId);

      const response = await fetch(`http://localhost:5000/api/v1/candidates/${candidateId}/attachments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload attachment');
      }

      const data = await response.json();
      
      // Add attachment reference to message
      const attachmentText = `[Attachment: ${file.name}]`;
      setMessage(prev => `${prev}\n${attachmentText}`);

      toast({
        title: "Attachment added",
        description: "File attached to note",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Add Internal Note</SheetTitle>
          <SheetDescription>
            Add an internal note about {candidateName}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Note Type Selection */}
          <div className="space-y-2">
            <Label>Note Type</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "general", label: "General" },
                { id: "screening", label: "Screening" },
                { id: "interview", label: "Interview" },
                { id: "feedback", label: "Feedback" },
                { id: "internal", label: "Internal" },
              ].map((type) => (
                <Badge
                  key={type.id}
                  variant={noteType === type.id ? "accent" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setNoteType(type.id)}
                >
                  {type.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {isInternal ? "Team Only" : "Public Note"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isInternal ? "Visible only to team members" : "May be shared with candidate"}
                </p>
              </div>
            </div>
            <Switch checked={isInternal} onCheckedChange={setIsInternal} />
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <Label>Note Content</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Write your notes about ${candidateName}...\nUse @ to mention team members\n\nConsider:\n- Why they're a good fit\n- Any concerns\n- Next steps`}
              className="min-h-[200px] text-sm leading-relaxed"
            />
          </div>

          {/* Quick Mentions */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <AtSign className="h-4 w-4" />
              Mention Team Member
            </Label>
            <div className="flex flex-wrap gap-2">
              {teamMembers.map((member) => (
                <Badge
                  key={member.id}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  onClick={() => insertMention(member.name)}
                >
                  @{member.name}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
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
                <Button variant="ghost" size="sm" as="span" className="cursor-pointer">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Attach File
                </Button>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                variant="accent" 
                onClick={handleSend}
                disabled={!message.trim() || isSending}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSending ? "Saving..." : "Save Note"}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SendMessageSheet;