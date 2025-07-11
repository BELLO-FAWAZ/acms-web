
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, User, Mail, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<'anonymous' | 'fake' | 'real'>('anonymous');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt:', { loginType, formData });
    // Redirect to complaint form after login
    navigate('/complaint');
  };

  const handleAnonymousLogin = () => {
    console.log('Proceeding anonymously');
    // Redirect to complaint form
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

              {/* Fake Name Option */}
              <div className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                loginType === 'fake' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`} onClick={() => setLoginType('fake')}>
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    loginType === 'fake' 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {loginType === 'fake' && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <User className="h-5 w-5 text-gray-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">Login with Fake Name</h3>
                    <p className="text-sm text-gray-600">Create account with pseudonym</p>
                  </div>
                </div>
              </div>

              {/* Real Name Option */}
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
                    <h3 className="font-medium text-gray-900">Login with Real Identity</h3>
                    <p className="text-sm text-gray-600">Use your real name and email</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          {loginType !== 'anonymous' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username/Name Field */}
                <div>
                  <Label htmlFor="username">
                    {loginType === 'fake' ? 'Fake Name' : 'Full Name'}
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder={loginType === 'fake' ? 'Enter a fake name' : 'Enter your full name'}
                    value={formData.username}
                    onChange={handleInputChange}
                    className="mt-1"
                    required
                  />
                </div>

                {/* Email Field (only for real name) */}
                {loginType === 'real' && (
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
                )}

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
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Login & Continue
                </Button>
              </form>
              
              <p className="text-center text-sm text-gray-600 mt-4">
                Don't have an account?{' '}
                <button className="text-blue-600 hover:text-blue-500 font-medium">
                  Create one now
                </button>
              </p>
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
