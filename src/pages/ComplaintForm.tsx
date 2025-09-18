
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

const ComplaintForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    department: '',
    priority: 'medium',
    location: '',
    anonymousName: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Insert complaint
      const complaintData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        department: formData.department,
        priority: formData.priority,
        location: formData.location,
        status: 'pending',
        user_id: user?.id || null,
        anonymous_name: !user ? (formData.anonymousName || 'Anonymous') : null
      };

      const { data: complaint, error: complaintError } = await (supabase as any)
        .from('complaints')
        .insert([complaintData])
        .select()
        .single();

      if (complaintError) throw complaintError;

      // Handle file uploads if any
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${complaint.id}/${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('complaint-attachments')
            .upload(fileName, file);

          if (uploadError) {
            console.error('File upload error:', uploadError);
            continue;
          }

          // Save attachment record
          await (supabase as any)
            .from('complaint_attachments')
            .insert([{
              complaint_id: complaint.id,
              file_name: file.name,
              file_path: fileName,
              file_size: file.size,
              file_type: file.type
            }]);
        }
      }

      toast({
        title: "Complaint Submitted Successfully!",
        description: `Your tracking ID is: ${complaint.tracking_id}`,
      });

      // Redirect based on user authentication
      if (user) {
        navigate('/dashboard');
      } else {
        navigate('/status');
      }
      
    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showAuthenticatedNav={!!user} />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Submit a Complaint</CardTitle>
            <CardDescription>
              {user ? 'Submit your complaint and track its progress' : 'Submit your complaint anonymously'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Anonymous Name Field (only for non-authenticated users) */}
              {!user && (
                <div>
                  <Label htmlFor="anonymousName">Display Name (Optional)</Label>
                  <Input
                    id="anonymousName"
                    name="anonymousName"
                    placeholder="Leave blank to remain completely anonymous"
                    value={formData.anonymousName}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    If you provide a name, it will be used for display purposes only
                  </p>
                </div>
              )}

              {/* Title Field */}
              <div>
                <Label htmlFor="title">Complaint Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Brief description of your complaint"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1"
                  required
                />
              </div>

              {/* Department Field */}
              <div>
                <Label htmlFor="department">Department/Recipient *</Label>
                <Select onValueChange={(value) => handleSelectChange('department', value)} required>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select department to handle your complaint" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic-affairs">Academic Affairs</SelectItem>
                    <SelectItem value="student-services">Student Services</SelectItem>
                    <SelectItem value="administration">Administration</SelectItem>
                    <SelectItem value="facilities">Facilities Management</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="it-support">IT Support</SelectItem>
                    <SelectItem value="financial-aid">Financial Aid</SelectItem>
                    <SelectItem value="registrar">Registrar's Office</SelectItem>
                    <SelectItem value="security">Campus Security</SelectItem>
                    <SelectItem value="dean-office">Dean's Office</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Field */}
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select onValueChange={(value) => handleSelectChange('category', value)} required>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic Issues</SelectItem>
                    <SelectItem value="administrative">Administrative</SelectItem>
                    <SelectItem value="facilities">Facilities & Infrastructure</SelectItem>
                    <SelectItem value="harassment">Harassment/Discrimination</SelectItem>
                    <SelectItem value="financial">Financial Issues</SelectItem>
                    <SelectItem value="services">Student Services</SelectItem>
                    <SelectItem value="technology">Technology Issues</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Field */}
              <div>
                <Label htmlFor="priority">Priority Level</Label>
                <Select onValueChange={(value) => handleSelectChange('priority', value)} defaultValue="medium">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location Field */}
              <div>
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Where did this issue occur?"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>

              {/* Description Field */}
              <div>
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Please provide detailed information about your complaint..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 min-h-[120px]"
                  required
                />
              </div>

              {/* File Upload */}
              <div>
                <Label htmlFor="files">Attachments (Optional)</Label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="files" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>Upload files</span>
                        <input
                          id="files"
                          name="files"
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={handleFileChange}
                          accept="image/*,.pdf,.doc,.docx,audio/*,video/*,.mp3,.mp4,.wav,.avi,.mov,.wmv,.flv,.webm,.ogg,.m4a"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      Images, documents (PDF, DOC), audio, and video files up to 10MB each
                    </p>
                  </div>
                </div>
                {files && files.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Selected files:</p>
                    <ul className="text-sm text-gray-500">
                      {Array.from(files).map((file, index) => (
                        <li key={index}>• {file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Privacy Notice */}
              {!user && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your complaint will be submitted anonymously. You can track its status using the tracking ID that will be provided after submission.
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? 'Submitting...' : 'Submit Complaint'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComplaintForm;
