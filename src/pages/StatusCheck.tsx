
import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Search, Clock, CheckCircle, XCircle, AlertCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type ComplaintStatus = {
  id: string;
  tracking_id: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  description?: string;
  location?: string;
  admin_notes?: string;
  resolution_notes?: string;
};

const StatusCheck = () => {
  const { toast } = useToast();
  const [trackingId, setTrackingId] = useState('');
  const [complaint, setComplaint] = useState<ComplaintStatus | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    if (!trackingId.trim()) return;
    
    setIsSearching(true);
    setNotFound(false);
    setComplaint(null);
    
    try {
      const { data, error } = await (supabase as any)
        .from('complaints')
        .select('*')
        .eq('tracking_id', trackingId.trim())
        .maybeSingle();

      if (error) {
        console.error('Error fetching complaint:', error);
        toast({
          title: "Search failed",
          description: "There was an error searching for your complaint. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (!data) {
        setNotFound(true);
        toast({
          title: "Complaint not found",
          description: "No complaint found with this tracking ID. Please check and try again.",
          variant: "destructive"
        });
        return;
      }

      setComplaint(data);
      toast({
        title: "Complaint found",
        description: "Your complaint details have been retrieved successfully.",
      });

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Search failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'in-progress':
      case 'under-review':
        return <AlertCircle className="h-6 w-6 text-blue-500" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      default:
        return <XCircle className="h-6 w-6 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-yellow-50 border-yellow-200';
      case 'in-progress':
      case 'under-review':
        return 'bg-blue-50 border-blue-200';
      case 'resolved':
      case 'closed':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-red-50 border-red-200';
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'received':
        return 'Your complaint has been received and is awaiting initial review.';
      case 'in-progress':
        return 'Your complaint is currently being investigated by the relevant department.';
      case 'under-review':
        return 'Your complaint is under detailed review by the appropriate authorities.';
      case 'resolved':
        return 'Your complaint has been resolved. Check below for resolution details.';
      case 'closed':
        return 'Your complaint has been closed. Thank you for your patience.';
      default:
        return 'Status information not available.';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <span className="text-xl font-bold text-gray-900">ACMS</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/complaint" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Submit Complaint
              </Link>
              <Link to="/chat" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Chat
              </Link>
              <Link to="/poll" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Polls
              </Link>
              <Link to="/">
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Check Complaint Status
          </h1>
          <p className="text-gray-600">
            Enter your tracking ID to check the status of your complaint
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="space-y-4">
            <div>
              <Label htmlFor="trackingId">Tracking ID</Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  id="trackingId"
                  placeholder="ACMS-2025-1000"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button 
                  onClick={handleSearch}
                  disabled={isSearching || !trackingId.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSearching ? (
                    <>Searching...</>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Complaint Details */}
        {complaint && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="border-b pb-4 mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{complaint.title}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(complaint.priority)}`}>
                  {complaint.priority.toUpperCase()} Priority
                </span>
              </div>
              <p className="text-gray-600 mt-2">Tracking ID: <span className="font-mono font-bold">{complaint.tracking_id}</span></p>
            </div>

            {/* Status Display */}
            <div className={`p-4 rounded-lg border mb-6 ${getStatusColor(complaint.status)}`}>
              <div className="flex items-center space-x-3">
                {getStatusIcon(complaint.status)}
                <div>
                  <h3 className="font-semibold text-gray-900 capitalize">
                    {complaint.status.replace('-', ' ')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {getStatusDescription(complaint.status)}
                  </p>
                </div>
              </div>
            </div>

            {/* Complaint Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Complaint Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Category:</span> {complaint.category.replace('-', ' ')}</p>
                  <p><span className="font-medium">Submitted:</span> {new Date(complaint.created_at).toLocaleDateString()}</p>
                  <p><span className="font-medium">Last Updated:</span> {new Date(complaint.updated_at).toLocaleDateString()}</p>
                  {complaint.location && (
                    <p><span className="font-medium">Location:</span> {complaint.location}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  {complaint.description}
                </p>
              </div>
            </div>

            {/* Admin Notes */}
            {complaint.admin_notes && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  Administrator Notes
                </h4>
                <p className="text-sm text-blue-800">{complaint.admin_notes}</p>
              </div>
            )}

            {/* Resolution Notes */}
            {complaint.resolution_notes && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Resolution Details
                </h4>
                <p className="text-sm text-green-800">{complaint.resolution_notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Not Found Message */}
        {notFound && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Complaint Not Found</h3>
              <p className="text-gray-600">
                No complaint was found with the tracking ID "{trackingId}". 
                Please check your tracking ID and try again.
              </p>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How long does it take to process a complaint?</h3>
              <p className="text-gray-600 text-sm">
                Most complaints are reviewed within 24-48 hours. Complex issues may take longer to investigate and resolve.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I update my complaint after submission?</h3>
              <p className="text-gray-600 text-sm">
                Yes, you can provide additional information through our chat feature or by submitting a new complaint with your original tracking ID.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What if I lost my tracking ID?</h3>
              <p className="text-gray-600 text-sm">
                If you provided an email address, we can help you retrieve your tracking ID. Please contact us through the chat feature.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is my complaint anonymous?</h3>
              <p className="text-gray-600 text-sm">
                Yes, unless you choose to provide contact information, your complaint remains completely anonymous while still being trackable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusCheck;
