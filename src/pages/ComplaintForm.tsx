import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Upload, X, Check, AlertCircle, Copy, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { containsProfanity, getProfanityWords } from "@/utils/profanityFilter";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const ComplaintForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    recipient: '',
    priority: '',
    expectedResolutionDate: undefined as Date | undefined,
    description: '',
    location: '',
    contactEmail: '',
    attachments: [] as File[]
  });

  const copyTrackingId = () => {
    navigator.clipboard.writeText(trackingId);
    toast({
      title: "Copied!",
      description: "Tracking ID copied to clipboard",
    });
  };

  const handleInputChange = (field: string, value: string | Date | undefined) => {
    // Check for profanity in title and description fields
    if (typeof value === 'string' && (field === 'title' || field === 'description') && containsProfanity(value)) {
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
    if (!formData.title.trim() || !formData.category || !formData.recipient || !formData.priority || !formData.description.trim()) {
      return false;
    }
    
    // Final profanity check before submission
    if (containsProfanity(formData.title) || containsProfanity(formData.description)) {
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
    
    try {
      // Insert complaint into database
      const { data: complaint, error } = await (supabase as any)
        .from('complaints')
        .insert({
          user_id: user?.id || null,
          title: formData.title,
          category: formData.category,
          recipient: formData.recipient,
          priority: formData.priority,
          description: formData.description,
          location: formData.location || null,
          contact_email: formData.contactEmail || null,
          expected_resolution_date: formData.expectedResolutionDate || null,
        })
        .select('tracking_id')
        .single();

      if (error) {
        console.error('Error submitting complaint:', error);
        toast({
          title: "Submission failed",
          description: "There was an error submitting your complaint. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // TODO: Handle file attachments here when storage is set up
      if (formData.attachments.length > 0) {
        console.log('File attachments will be handled when storage is configured');
      }

      if (complaint?.tracking_id) {
        setTrackingId(complaint.tracking_id);
        setShowConfirmation(true);
        
        toast({
          title: "Complaint submitted successfully",
          description: `Your tracking ID is: ${complaint.tracking_id}`,
        });
      }

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Submission failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
            {/* Complaint Title */}
            <div>
              <Label htmlFor="title">
                Complaint Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Brief title describing your complaint"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="mt-1"
                required
              />
            </div>

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
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="bullying">Bullying</SelectItem>
                  <SelectItem value="discrimination">Discrimination</SelectItem>
                  <SelectItem value="academic-misconduct">Academic Misconduct</SelectItem>
                  <SelectItem value="facility-issues">Facility Issues</SelectItem>
                  <SelectItem value="staff-conduct">Staff Conduct</SelectItem>
                  <SelectItem value="safety-concerns">Safety Concerns</SelectItem>
                  <SelectItem value="financial-issues">Financial Issues</SelectItem>
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recipient Selection */}
            <div>
              <Label htmlFor="recipient">
                Send Complaint To <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.recipient} onValueChange={(value) => handleInputChange('recipient', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select who should receive this complaint" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vice-chancellor">Vice Chancellor</SelectItem>
                  <SelectItem value="chief-security-officer">Chief Security Officer</SelectItem>
                  <SelectItem value="student-affairs">Student Affairs</SelectItem>
                  <SelectItem value="head-of-department">Head of Department</SelectItem>
                  <SelectItem value="dean-of-faculty">Dean of Faculty</SelectItem>
                  <SelectItem value="registrar">Registrar</SelectItem>
                  <SelectItem value="counseling-services">Counseling Services</SelectItem>
                  <SelectItem value="facilities-management">Facilities Management</SelectItem>
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
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expected Resolution Date */}
            <div>
              <Label htmlFor="expected-date">
                Expected Resolution Date (Optional)
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !formData.expectedResolutionDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.expectedResolutionDate ? format(formData.expectedResolutionDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={formData.expectedResolutionDate}
                    onSelect={(date) => handleInputChange('expectedResolutionDate', date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-sm text-gray-600 mt-1">
                When would you like this complaint to be resolved?
              </p>
            </div>

            {/* Location (Optional) */}
            <div>
              <Label htmlFor="location">
                Location (Optional)
              </Label>
              <Input
                id="location"
                placeholder="Where did this incident occur? (e.g., Library, Cafeteria, Lecture Hall A)"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-gray-600 mt-1">
                Providing the location helps us investigate and address the issue more effectively
              </p>
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
