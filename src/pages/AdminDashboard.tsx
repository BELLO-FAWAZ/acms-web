import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Eye,
  MessageSquare,
  User,
  Calendar,
  BarChart3,
  Vote,
  Database,
  Users,
  Settings,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/hooks/useRole";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Complaint {
  id: string;
  tracking_id: string;
  title: string;
  category: string;
  department: string;
  status: string;
  priority: string;
  created_at: string;
  user_id: string | null;
  anonymous_name: string | null;
  description: string;
}

interface Poll {
  id: string;
  title: string;
  description: string;
  type: string;
  options: string[];
  created_by: string | null;
  created_by_name: string | null;
  expires_at: string;
  is_active: boolean;
  created_at: string;
  vote_count: number;
  votes: { [key: string]: number };
}

interface SystemStats {
  total_users: number;
  total_complaints: number;
  total_polls: number;
  total_votes: number;
  pending_complaints: number;
  active_polls: number;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'complaints' | 'polls' | 'users'>('overview');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });
  const [systemStats, setSystemStats] = useState<SystemStats>({
    total_users: 0,
    total_complaints: 0,
    total_polls: 0,
    total_votes: 0,
    pending_complaints: 0,
    active_polls: 0
  });

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate('/dashboard');
      return;
    }
    if (isAdmin) {
      fetchAllData();
    }
  }, [isAdmin, roleLoading, navigate]);

  const fetchAllData = async () => {
    try {
      // Fetch complaints
      const { data: complaintsData, error: complaintsError } = await (supabase as any)
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (complaintsError) throw complaintsError;

      setComplaints(complaintsData || []);
      
      // Calculate complaint stats
      const total = complaintsData?.length || 0;
      const pending = complaintsData?.filter((c: Complaint) => c.status === 'pending').length || 0;
      const inProgress = complaintsData?.filter((c: Complaint) => c.status === 'in_progress').length || 0;
      const resolved = complaintsData?.filter((c: Complaint) => c.status === 'resolved').length || 0;
      
      setStats({ total, pending, inProgress, resolved });

      // Fetch polls with vote counts
      const { data: pollsData, error: pollsError } = await (supabase as any)
        .from('polls')
        .select(`
          *,
          poll_votes (
            option_text
          )
        `)
        .order('created_at', { ascending: false });

      if (pollsError) throw pollsError;

      // Process polls data to include vote counts
      const processedPolls = pollsData?.map((poll: any) => {
        const votes: { [key: string]: number } = {};
        const options = Array.isArray(poll.options) ? poll.options : [];
        
        // Initialize vote counts
        options.forEach((option: string) => {
          votes[option] = 0;
        });

        // Count votes
        poll.poll_votes?.forEach((vote: any) => {
          if (votes.hasOwnProperty(vote.option_text)) {
            votes[vote.option_text]++;
          }
        });

        return {
          ...poll,
          options,
          votes,
          vote_count: poll.poll_votes?.length || 0
        };
      }) || [];

      setPolls(processedPolls);

      // Fetch system statistics
      const { data: userRolesData } = await (supabase as any)
        .from('user_roles')
        .select('user_id')
        .eq('role', 'user');

      const totalVotes = processedPolls.reduce((sum: number, poll: Poll) => sum + poll.vote_count, 0);
      const activePolls = processedPolls.filter((poll: Poll) => poll.is_active && new Date(poll.expires_at) > new Date()).length;

      setSystemStats({
        total_users: userRolesData?.length || 0,
        total_complaints: total,
        total_polls: processedPolls.length,
        total_votes: totalVotes,
        pending_complaints: pending,
        active_polls: activePolls
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (complaintId: string, newStatus: string) => {
    try {
      const { error } = await (supabase as any)
        .from('complaints')
        .update({ status: newStatus })
        .eq('id', complaintId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: "Complaint status has been updated successfully.",
      });

      fetchAllData(); // Refresh the data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportData = () => {
    const data = {
      complaints: complaints,
      polls: polls,
      system_stats: systemStats,
      exported_at: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `acms_admin_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: "Admin data has been exported successfully.",
    });
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have admin privileges.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showAuthenticatedNav={true} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive system management and analytics</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={exportData}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Administrator
            </Badge>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'complaints', label: 'Complaints', icon: FileText },
            { id: 'polls', label: 'Polls', icon: Vote },
            { id: 'users', label: 'Users', icon: Users }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* System Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.total_users}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.total_complaints}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.pending_complaints}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Polls</CardTitle>
                  <Vote className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.total_polls}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Polls</CardTitle>
                  <BarChart3 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.active_polls}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats.total_votes}</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Complaints</CardTitle>
                  <CardDescription>Latest 5 complaints submitted</CardDescription>
                </CardHeader>
                <CardContent>
                  {complaints.slice(0, 5).map((complaint) => (
                    <div key={complaint.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium text-sm">{complaint.title}</p>
                        <p className="text-xs text-gray-500">{complaint.tracking_id}</p>
                      </div>
                      <Badge className={getStatusColor(complaint.status)}>
                        {complaint.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Polls</CardTitle>
                  <CardDescription>Latest 5 polls created</CardDescription>
                </CardHeader>
                <CardContent>
                  {polls.slice(0, 5).map((poll) => (
                    <div key={poll.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium text-sm">{poll.title}</p>
                        <p className="text-xs text-gray-500">{poll.vote_count} votes</p>
                      </div>
                      <Badge variant={poll.is_active ? "default" : "secondary"}>
                        {poll.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Complaints Tab */}
        {activeTab === 'complaints' && (
          <Card>
            <CardHeader>
              <CardTitle>All Complaints</CardTitle>
              <CardDescription>
                View and manage all submitted complaints
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading complaints...</p>
                </div>
              ) : complaints.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints yet</h3>
                  <p className="text-gray-600">Complaints will appear here when submitted</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tracking ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Submitter</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complaints.map((complaint) => (
                      <TableRow key={complaint.id}>
                        <TableCell className="font-medium">
                          {complaint.tracking_id}
                        </TableCell>
                        <TableCell>{complaint.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            {complaint.user_id ? 
                              'Registered User' : 
                              (complaint.anonymous_name || 'Anonymous')
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {complaint.department || 'Not specified'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(complaint.priority)}>
                            {complaint.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={complaint.status}
                            onValueChange={(value) => updateComplaintStatus(complaint.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(complaint.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/admin/complaint/${complaint.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Polls Tab */}
        {activeTab === 'polls' && (
          <Card>
            <CardHeader>
              <CardTitle>All Polls</CardTitle>
              <CardDescription>
                View and manage all polls and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading polls...</p>
                </div>
              ) : polls.length === 0 ? (
                <div className="text-center py-8">
                  <Vote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No polls yet</h3>
                  <p className="text-gray-600">Polls will appear here when created</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {polls.map((poll) => (
                    <div key={poll.id} className="border rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{poll.title}</h3>
                          <p className="text-gray-600 mb-3">{poll.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {poll.vote_count} votes
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Expires {new Date(poll.expires_at).toLocaleDateString()}
                            </span>
                            <Badge variant={poll.is_active ? "default" : "secondary"}>
                              {poll.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {poll.options.map((option: string) => {
                          const voteCount = poll.votes[option] || 0;
                          const percentage = poll.vote_count > 0 ? (voteCount / poll.vote_count) * 100 : 0;
                          return (
                            <div key={option} className="flex items-center justify-between">
                              <div className="flex-1 mr-4">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm font-medium text-gray-700">{option}</span>
                                  <span className="text-sm text-gray-500">
                                    {voteCount} ({percentage.toFixed(1)}%)
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
                <p className="text-gray-600">Advanced user management features coming soon</p>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;