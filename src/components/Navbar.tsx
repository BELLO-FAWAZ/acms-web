
import { Link, useLocation } from "react-router-dom";
import { Shield, LogOut, Home, FileText, MessageSquare, BarChart3, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
  showAuthenticatedNav?: boolean;
}

const Navbar = ({ showAuthenticatedNav = false }: NavbarProps) => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <span className="text-xl font-bold text-gray-900">ACMS</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {showAuthenticatedNav && user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                    isActive('/dashboard') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  <Home className="h-4 w-4 mr-1" />
                  Dashboard
                </Link>
                <Link 
                  to="/complaint" 
                  className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                    isActive('/complaint') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Submit
                </Link>
                <Link 
                  to="/status" 
                  className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                    isActive('/status') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Track
                </Link>
                <Link 
                  to="/chat" 
                  className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                    isActive('/chat') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Chat
                </Link>
                <Link 
                  to="/poll" 
                  className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                    isActive('/poll') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Polls
                </Link>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link 
                  to="/" 
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive('/') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  to="/status" 
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive('/status') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Track Complaint
                </Link>
                <Link 
                  to="/chat" 
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive('/chat') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Chat
                </Link>
                <Link 
                  to="/poll" 
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive('/poll') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Polls
                </Link>
                <Link 
                  to="/admin" 
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive('/admin') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Admin
                </Link>
                <Link to="/login">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Submit Complaint
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
