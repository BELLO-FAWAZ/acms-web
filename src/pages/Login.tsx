
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, User, Mail, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const [loginType, setLoginType] = useState<'anonymous' | 'fake' | 'real'>('anonymous');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/complaint');
    }
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          toast({
            title: "Sign Up Failed",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Account Created!",
            description: "Please check your email to verify your account.",
          });
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
          navigate('/complaint');
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = () => {
    console.log('Proceeding anonymously');
    navigate('/complaint');
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
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Login Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Submit Your Complaint
            </h2>
            <p className="text-gray-600">
              Choose how you'd like to proceed
            </p>
          </div>

          {/* Login Type Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">
              {/* Anonymous Option */}
              <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                loginType === 'anonymous' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`} onClick={() => setLoginType('anonymous')}>
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    loginType === 'anonymous' 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {loginType === 'anonymous' && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <UserX className="h-5 w-5 text-gray-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">Submit Anonymously</h3>
                    <p className="text-sm text-gray-600">No registration required</p>
                  </div>
                </div>
              </div>

              {/* Account Login Option */}
              <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                loginType === 'real' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`} onClick={() => setLoginType('real')}>
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    loginType === 'real' 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {loginType === 'real' && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <Mail className="h-5 w-5 text-gray-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">Login with Account</h3>
                    <p className="text-sm text-gray-600">Track your complaints and get updates</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields for Account Login */}
          {loginType === 'real' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-center mb-6">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      !isSignUp 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isSignUp 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name Field (only for sign up) */}
                {isSignUp && (
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="mt-1"
                      required
                    />
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1"
                    required
                  />
                </div>

                {/* Password Field */}
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Login & Continue')}
                </Button>
              </form>
            </div>
          )}

          {/* Anonymous Continue Button */}
          {loginType === 'anonymous' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <Button
                onClick={handleAnonymousLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Continue Anonymously
              </Button>
              <p className="text-center text-sm text-gray-600 mt-4">
                No account needed. Your complaint will be completely anonymous.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
