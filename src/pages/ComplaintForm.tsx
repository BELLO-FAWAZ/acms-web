import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Upload, X, Check, AlertCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { containsProfanity, getProfanityWords } from "@/utils/profanityFilter";

const ComplaintForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [formData, setFormData] = useState({
    category: '',
    priority: '',
    description: '',
    contactEmail: '',
    attachments: [] as File[]
  });

  const generateTrackingId = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    return `ACMS-${year}-${randomNum}`;
  };

  const copyTrackingId = () => {
    navigator.clipboard.writeText(trackingId);
    toast({
      title: "Copied!",
      description: "Tracking ID copied to clipboard",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    // Check for profanity in description field
    if (field === 'description' && containsProfanity(value)) {
      const profanityWords = getProfanityWords(value);
      toast({
        title: "Inappropriate language detected",
        description: `Please remove inappropriate words: ${profanityWords.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 5MB limit`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!formData.category || !formData.priority || !formData.description.trim()) {
      return false;
    }
    
    // Final profanity check before submission
    if (containsProfanity(formData.description)) {
      toast({
        title: "Inappropriate language detected",
        description: "Please remove inappropriate language from your complaint before submitting.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Generate tracking ID
    const newTrackingId = generateTrackingId();
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setTrackingId(newTrackingId);
      setShowConfirmation(true);
      console.log('Complaint submitted:', { ...formData, trackingId: newTrackingId });
    }, 2000);
  };

  if (showConfirmation) {
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
                <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Home
                </Link>
                <Link to="/complaint" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Submit
                </Link>
                <Link to="/status" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Track Complaint
                </Link>
                <Link to="/chat" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Chat
                </Link>
                <Link to="/poll" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Polls
                </Link>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Log In
                </Link>
                <Link to="/admin" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Admin
                </Link>
                <Button 
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Home
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Confirmation Message */}
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Complaint Submitted Successfully
              </h2>
              
              {/* Tracking ID Display */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600 mb-2">Your Tracking ID:</p>
                <div className="flex items-center justify-center space-x-2">
                  <code className="text-lg font-mono font-bold text-blue-600 bg-white px-3 py-1 rounded">
                    {trackingId}
                  </code>
                  <Button
                    onClick={copyTrackingId}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Save this ID to check your complaint status
                </p>
              </div>

              <p className="text-gray-600 mb-6">
                Thank you for submitting your complaint. We have received your information and want to assure you that we take all complaints seriously. Your privacy and confidentiality are our top priorities, and we will work diligently to address your concerns.
              </p>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/status')}
                  variant="outline"
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Check Status
                </Button>
                <Button 
                  onClick={() => navigate('/')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Return to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Home
              </Link>
              <Link to="/complaint" className="text-blue-600 px-3 py-2 text-sm font-medium">
                Submit
              </Link>
              <Link to="/status" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Track Complaint
              </Link>
              <Link to="/chat" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Chat
              </Link>
              <Link to="/poll" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Polls
              </Link>
              <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Log In
              </Link>
              <Link to="/admin" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Admin
              </Link>
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Complaint Form */}
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Submit Your Complaint
          </h1>
          <p className="text-gray-600">
            Please provide detailed information about your complaint
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div>
              <Label htmlFor="category">
                Complaint Category <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select complaint category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="facility">Facility</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority Level */}
            <div>
              <Label htmlFor="priority">
                Priority Level <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select priority level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Detailed Description */}
            <div>
              <Label htmlFor="description">
                Detailed Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Please provide a detailed description of your complaint..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="mt-1 min-h-[120px]"
                required
              />
            </div>

            {/* Optional Contact Email */}
            <div>
              <Label htmlFor="contactEmail">
                Contact Email (Optional)
              </Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="Enter your email for follow-up communication"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-gray-600 mt-1">
                Providing your email helps us communicate updates and resolve your complaint more effectively
              </p>
            </div>

            {/* File Upload */}
            <div>
              <Label htmlFor="attachments">
                Supporting Evidence (Optional)
              </Label>
              <div className="mt-1">
                <input
                  id="attachments"
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('attachments')?.click()}
                  className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400 h-20"
                >
                  <Upload className="h-6 w-6 mr-2" />
                  Click to upload files (Max 5MB each)
                </Button>
                <p className="text-sm text-gray-600 mt-1">
                  Supported formats: Images, PDF, Word documents
                </p>
              </div>

              {/* Uploaded Files Display */}
              {formData.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? 'Submitting Complaint...' : 'Submit Complaint'}
            </Button>
          </form>

          {/* Privacy Notice */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Privacy & Confidentiality</h4>
                <p className="text-sm text-blue-800">
                  We are committed to protecting your privacy and maintaining the confidentiality of your information. 
                  If you provide your email address, we will safeguard it for as long as you wish us to retain it. 
                  While providing contact information is optional, it significantly enhances our ability to serve you 
                  better, provide updates on your complaint, and ensure a more effective resolution process.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintForm;
