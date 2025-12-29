import { useState } from "react";
import {
  Calendar,
  ClipboardList,
  FileText,
  RefreshCw,
  XCircle,
  MoreHorizontal,
  Eye,
  MessageSquare,
  Loader2,
  FileEdit,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { CANDIDATE_STATUS } from "@/constants/candidateStatus";


const API_BASE_URL = "http://localhost:5000/api/v1";

const CandidateActionsMenu = ({
  candidateId,
  candidateName,
  status,
  jobId,
  onScheduleInterview,
  onViewHistory,
  onViewReport,
  onChangeStatus,
  onReject,
  onDelete,
  onEdit,
  onSuccess,
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);


  const handleAction = async (action, callback) => {
    if (callback) {
      callback();
    } else {
      // Handle default actions
      switch (action) {
        case "View Profile":
          router.push(`/recruiter/candidates/${candidateId}`);
          break;
        case "Schedule Interview":
          router.push(`/recruiter/interviews/new?candidateId=${candidateId}&jobId=${jobId}`);
          break;
        case "View Interview History":
          router.push(`/recruiter/candidates/${candidateId}/interviews`);
          break;
        case "View Report":
          router.push(`/recruiter/reports/candidate/${candidateId}`);
          break;
        case "Send Message":
          // This would open a messaging modal
          toast({
            title: "Send Message",
            description: `Message feature coming soon for ${candidateName}`,
          });
          break;
        case "Change Status":
          // This would open a status change modal
          toast({
            title: "Change Status",
            description: `Status change feature coming soon`,
          });
          break;
        default:
          toast({
            title: `${action}`,
            description: `Action triggered for ${candidateName}`,
          });
      }
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${candidateName}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId: user.organizationId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete candidate');
      }

      toast({
        title: "Success",
        description: `${candidateName} has been deleted successfully.`,
      });

      if (onSuccess) {
        onSuccess();
      }

      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Error deleting candidate:', error);
      
      let errorMessage = error.message;
      if (error.message.includes('existing interviews')) {
        errorMessage = "Cannot delete candidate with existing interviews. Please reject instead.";
      }

      toast({
        title: "Delete Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReject = async () => {
    if (!confirm(`Are you sure you want to reject ${candidateName}?`)) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: CANDIDATE_STATUS.REJECTED,
          note: 'Rejected via candidate actions menu',
          organizationId: user.organizationId,
          userId: user._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject candidate');
      }

      toast({
        title: "Candidate Rejected",
        description: `${candidateName} has been rejected.`,
      });

      if (onSuccess) {
        onSuccess();
      }

      if (onReject) {
        onReject();
      }
    } catch (error) {
      console.error('Error rejecting candidate:', error);
      
      toast({
        title: "Reject Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    const statusDisplay = newStatus.toLowerCase().replace('_', ' ');

    if (!confirm(`Change ${candidateName}'s status to ${statusDisplay}?`)) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const response = await fetch(`${API_BASE_URL}/candidates/${candidateId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          note: `Status changed to ${statusDisplay}`,
          organizationId: user.organizationId,
          userId: user._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      toast({
        title: "Status Updated",
        description: `${candidateName}'s status changed to ${statusDisplay}.`,
      });

      if (onSuccess) {
        onSuccess();
      }

      if (onChangeStatus) {
        onChangeStatus();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isRejected = status === CANDIDATE_STATUS.REJECTED;
  const isHired = status === CANDIDATE_STATUS.HIRED;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={loading || isDeleting}>
          {loading || isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* View Profile */}
        <DropdownMenuItem onClick={() => handleAction("View Profile")}>
          <Eye className="h-4 w-4 mr-2" />
          View Profile
        </DropdownMenuItem>

        {/* Edit Candidate */}
        {!isRejected && !isHired && (
          <DropdownMenuItem onClick={() => onEdit && onEdit()}>
            <FileEdit className="h-4 w-4 mr-2" />
            Edit Candidate
          </DropdownMenuItem>
        )}

        {/* Schedule Interview */}
        {!isRejected && status !== CANDIDATE_STATUS.HIRED && (
          <DropdownMenuItem onClick={() => handleAction("Schedule Interview")}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Interview
          </DropdownMenuItem>
        )}

        {/* Interview History */}
        <DropdownMenuItem onClick={() => handleAction("View Interview History")}>
          <ClipboardList className="h-4 w-4 mr-2" />
          Interview History
        </DropdownMenuItem>

        {/* View Report (only for interviewed candidates) */}
        {(status === CANDIDATE_STATUS.INTERVIEW || status === CANDIDATE_STATUS.OFFER || status === CANDIDATE_STATUS.HIRED) && (
          <DropdownMenuItem onClick={() => handleAction("View Report")}>
            <FileText className="h-4 w-4 mr-2" />
            View Report
          </DropdownMenuItem>
        )}

        {/* Send Message */}
        <DropdownMenuItem onClick={() => handleAction("Send Message")}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Send Message
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Status Change Options */}
        {!isRejected && !isHired && (
          <>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Change Status To
            </div>
            
            {status !== CANDIDATE_STATUS.SCREENING && (
              <DropdownMenuItem onClick={() => handleStatusChange(CANDIDATE_STATUS.SCREENING)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Move to Screening
              </DropdownMenuItem>
            )}
            
            {status !== CANDIDATE_STATUS.INTERVIEW && (
              <DropdownMenuItem onClick={() => handleStatusChange(CANDIDATE_STATUS.INTERVIEW)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Move to Interview
              </DropdownMenuItem>
            )}
            
            {status !== CANDIDATE_STATUS.OFFER && (
              <DropdownMenuItem onClick={() => handleStatusChange(CANDIDATE_STATUS.OFFER)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Move to Offer
              </DropdownMenuItem>
            )}
            
            {status !== CANDIDATE_STATUS.HIRED && (
              <DropdownMenuItem onClick={() => handleStatusChange(CANDIDATE_STATUS.HIRED)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Mark as Hired
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
          </>
        )}

        {/* Reject (only if not already rejected or hired) */}
        {!isRejected && !isHired && (
          <DropdownMenuItem 
            onClick={handleReject}
            className="text-destructive focus:text-destructive"
            disabled={loading}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject Candidate
          </DropdownMenuItem>
        )}

        {/* Delete Candidate */}
        <DropdownMenuItem 
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Candidate
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CandidateActionsMenu;