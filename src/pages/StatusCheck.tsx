
import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Search, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const StatusCheck = () => {
  const [trackingId, setTrackingId] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!trackingId.trim()) return;
    
    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      // Mock status based on tracking ID (in real app, this would be from backend)
      const statuses = ['received', 'in-progress', 'resolved'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      setStatus(randomStatus);
      setIsSearching(false);
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'in-progress':
        return <AlertCircle className="h-6 w-6 text-blue-500" />;
      case 'resolved':
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
        return 'bg-blue-50 border-blue-200';
      case 'resolved':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-red-50 border-red-200';
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

      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Check Complaint Status
          </h1>
          <p className="text-gray-600">
            Enter your tracking ID to check the status of your complaint
          </p>
        </div>

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

            {status && (
              <div className={`p-4 rounded-lg border ${getStatusColor(status)}`}>
                <div className="flex items-center space-x-3">
                  {getStatusIcon(status)}
                  <div>
                    <h3 className="font-semibold text-gray-900 capitalize">
                      {status.replace('-', ' ')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {status === 'received' && 'Your complaint has been received and is being reviewed.'}
                      {status === 'in-progress' && 'Your complaint is currently being investigated.'}
                      {status === 'resolved' && 'Your complaint has been resolved. Thank you for your patience.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

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
