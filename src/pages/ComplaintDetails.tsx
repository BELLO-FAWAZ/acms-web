import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  FileText, 
  User,
  Calendar,
  MapPin,
  Building,
  AlertTriangle,
  Download,
  Eye,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/hooks/useRole";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Complaint {
  id: string;
  tracking_id: string;
  title: string;
  description: string;
  category: string;
  department: string;
  status: string;
  priority: string;
  location: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  anonymous_name: string | null;
  admin_notes: string | null;
  resolution_notes: string | null;
}

interface Attachment {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

const ComplaintDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();
  const { toast } = useToast();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/dashboard');
      return;
    }
    if (isAdmin && id) {
      fetchComplaintDetails();
    }
  }, [isAdmin, roleLoading, navigate, id]);

  const fetchComplaintDetails = async () => {
    if (!id) return;

    try {
      // Fetch complaint details
      const { data: complaintData, error: complaintError } = await (supabase as any)
        .from('complaints')
        .select('*')
        .eq('id', id)
        .single();

      if (complaintError) throw complaintError;

      setComplaint(complaintData);
      setAdminNotes(complaintData.admin_notes || "");
      setResolutionNotes(complaintData.resolution_notes || "");
      setCurrentStatus(complaintData.status);

      // Fetch attachments
      const { data: attachmentData, error: attachmentError } = await (supabase as any)
        .from('complaint_attachments')
        .select('*')
        .eq('complaint_id', id)
        .order('created_at', { ascending: false });

      if (attachmentError) throw attachmentError;

      setAttachments(attachmentData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch complaint details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateComplaint = async () => {
    if (!complaint) return;

    try {
      const { error } = await (supabase as any)
        .from('complaints')
        .update({ 
          admin_notes: adminNotes,
          resolution_notes: resolutionNotes,
          status: currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', complaint.id);

      if (error) throw error;

      toast({
        title: "Complaint Updated",
        description: "Status, admin notes and resolution notes have been saved.",
      });

      fetchComplaintDetails(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update complaint",
        variant: "destructive"
      });
    }
  };

  const downloadFile = async (attachment: Attachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('complaint-attachments')
        .download(attachment.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `Downloading ${attachment.file_name}`,
      });
    } catch (error: any) {
      toast({
        title: "Download Error",
        description: error.message || "Failed to download file",
        variant: "destructive"
      });
    }
  };

  const viewFile = async (attachment: Attachment) => {
    try {
      const { data } = supabase.storage
        .from('complaint-attachments')
        .getPublicUrl(attachment.file_path);

      window.open(data.publicUrl, '_blank');
    } catch (error: any) {
      toast({
        title: "View Error",
        description: "Failed to open file",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'in_progress': return 'default';
      case 'resolved': return 'default';
      case 'closed': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / (1024 * 1024)) + ' MB';
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You don't have admin privileges.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar showAuthenticatedNav={true} />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar showAuthenticatedNav={true} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Complaint Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested complaint could not be found.</p>
            <Button onClick={() => navigate('/admin/dashboard')}>
              Back to Admin Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar showAuthenticatedNav={true} />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin/dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Complaint Details</h1>
            <p className="text-muted-foreground">Tracking ID: {complaint.tracking_id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{complaint.title}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {complaint.description}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant={getPriorityColor(complaint.priority)}>
                    {complaint.priority} priority
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Submitter</p>
                    <p className="text-sm text-muted-foreground">
                      {complaint.user_id ? 'Registered User' : (complaint.anonymous_name || 'Anonymous')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Department</p>
                    <p className="text-sm text-muted-foreground">{complaint.department || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Category</p>
                    <p className="text-sm text-muted-foreground">{complaint.category || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{complaint.location || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(complaint.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Attachments ({attachments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {attachments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No attachments uploaded</p>
              ) : (
                <div className="space-y-3">
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{attachment.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.file_size)} • {attachment.file_type}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewFile(attachment)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadFile(attachment)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Admin Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={currentStatus} onValueChange={setCurrentStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium mb-2 block">Internal Notes</Label>
                <Textarea
                  placeholder="Add internal notes about this complaint..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                />
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-sm font-medium mb-2 block">Resolution Notes</Label>
                <Textarea
                  placeholder="Add resolution details (visible to user)..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={4}
                />
              </div>
              
              <Button onClick={updateComplaint} className="w-full">
                Update Complaint
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;