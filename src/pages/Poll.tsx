
import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Plus, Vote, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Poll {
  id: string;
  title: string;
  description: string;
  type: 'yes-no' | 'multiple-choice';
  options: string[];
  votes: { [key: string]: number };
  expiryDate: Date;
  createdBy: string;
  totalVotes: number;
}

const Poll = () => {
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [polls, setPolls] = useState<Poll[]>([
    {
      id: '1',
      title: 'Should the library extend operating hours?',
      description: 'Many students have requested longer library hours for better study opportunities.',
      type: 'yes-no',
      options: ['Yes', 'No'],
      votes: { 'Yes': 45, 'No': 12 },
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdBy: 'Anonymous',
      totalVotes: 57
    },
    {
      id: '2',
      title: 'What is the most needed facility improvement?',
      description: 'Help prioritize campus facility improvements.',
      type: 'multiple-choice',
      options: ['Better WiFi', 'More Study Rooms', 'Cafeteria Expansion', 'Parking Spaces'],
      votes: { 'Better WiFi': 23, 'More Study Rooms': 34, 'Cafeteria Expansion': 12, 'Parking Spaces': 8 },
      expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      createdBy: 'Anonymous',
      totalVotes: 77
    }
  ]);

  const [newPoll, setNewPoll] = useState({
    title: '',
    description: '',
    type: 'yes-no' as 'yes-no' | 'multiple-choice',
    options: [''],
    expiryDays: '7'
  });

  const handleCreatePoll = () => {
    if (!newPoll.title.trim() || !newPoll.description.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in title and description",
        variant: "destructive"
      });
      return;
    }

    const poll: Poll = {
      id: Date.now().toString(),
      title: newPoll.title,
      description: newPoll.description,
      type: newPoll.type,
      options: newPoll.type === 'yes-no' ? ['Yes', 'No'] : newPoll.options.filter(opt => opt.trim()),
      votes: {},
      expiryDate: new Date(Date.now() + parseInt(newPoll.expiryDays) * 24 * 60 * 60 * 1000),
      createdBy: 'Anonymous',
      totalVotes: 0
    };

    // Initialize votes
    poll.options.forEach(option => {
      poll.votes[option] = 0;
    });

    setPolls(prev => [poll, ...prev]);
    setShowCreateForm(false);
    setNewPoll({
      title: '',
      description: '',
      type: 'yes-no',
      options: [''],
      expiryDays: '7'
    });

    toast({
      title: "Poll created!",
      description: "Your poll has been published successfully",
    });
  };

  const handleVote = (pollId: string, option: string) => {
    setPolls(prev => prev.map(poll => {
      if (poll.id === pollId) {
        return {
          ...poll,
          votes: {
            ...poll.votes,
            [option]: poll.votes[option] + 1
          },
          totalVotes: poll.totalVotes + 1
        };
      }
      return poll;
    }));

    toast({
      title: "Vote recorded!",
      description: "Thank you for participating in the poll",
    });
  };

  const addOption = () => {
    setNewPoll(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const updateOption = (index: number, value: string) => {
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const removeOption = (index: number) => {
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
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
              <Link to="/status" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Check Status
              </Link>
              <Link to="/chat" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Chat
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

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Polls</h1>
            <p className="text-gray-600">Create and participate in polls to raise awareness about recurring issues</p>
          </div>
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Poll
          </Button>
        </div>

        {/* Create Poll Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Poll</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Poll Title</Label>
                <Input
                  id="title"
                  value={newPoll.title}
                  onChange={(e) => setNewPoll(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter poll title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPoll.description}
                  onChange={(e) => setNewPoll(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your poll"
                />
              </div>

              <div>
                <Label htmlFor="type">Poll Type</Label>
                <Select 
                  value={newPoll.type} 
                  onValueChange={(value: 'yes-no' | 'multiple-choice') => 
                    setNewPoll(prev => ({ ...prev, type: value, options: value === 'yes-no' ? [''] : [''] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes-no">Yes/No</SelectItem>
                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newPoll.type === 'multiple-choice' && (
                <div>
                  <Label>Options</Label>
                  {newPoll.options.map((option, index) => (
                    <div key={index} className="flex space-x-2 mt-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      {newPoll.options.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => removeOption(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addOption}
                    className="mt-2"
                  >
                    Add Option
                  </Button>
                </div>
              )}

              <div>
                <Label htmlFor="expiry">Expires in (days)</Label>
                <Select 
                  value={newPoll.expiryDays} 
                  onValueChange={(value) => setNewPoll(prev => ({ ...prev, expiryDays: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleCreatePoll} className="bg-blue-600 hover:bg-blue-700">
                  Create Poll
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Polls List */}
        <div className="space-y-6">
          {polls.map((poll) => (
            <div key={poll.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{poll.title}</h3>
                  <p className="text-gray-600 mb-3">{poll.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {poll.totalVotes} votes
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Expires {poll.expiryDate.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {poll.options.map((option) => {
                  const percentage = poll.totalVotes > 0 ? (poll.votes[option] / poll.totalVotes) * 100 : 0;
                  return (
                    <div key={option} className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">{option}</span>
                          <span className="text-sm text-gray-500">
                            {poll.votes[option] || 0} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVote(poll.id, option)}
                        className="ml-2"
                      >
                        <Vote className="w-4 h-4 mr-1" />
                        Vote
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Poll;
