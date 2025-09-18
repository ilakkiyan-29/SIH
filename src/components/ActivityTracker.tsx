import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Upload, FileText, Calendar, Trophy, Star } from "lucide-react";
import { toast } from "sonner@2.0.3";

export function ActivityTracker() {
  const [activities] = useState([
    {
      id: 1,
      title: "React.js Masterclass",
      type: "Online Course",
      provider: "Coursera",
      credits: 3,
      status: "Completed",
      date: "2024-01-10",
      certificate: "react-certificate.pdf"
    },
    {
      id: 2,
      title: "AI/ML Conference 2024",
      type: "Conference",
      provider: "Tech Institute",
      credits: 2,
      status: "Verified",
      date: "2024-01-05",
      certificate: "conference-certificate.pdf"
    },
    {
      id: 3,
      title: "Software Engineering Internship",
      type: "Internship",
      provider: "TechCorp Inc.",
      credits: 6,
      status: "In Progress",
      date: "2023-12-01",
      certificate: null
    },
    {
      id: 4,
      title: "Data Science Seminar",
      type: "Seminar",
      provider: "University",
      credits: 1,
      status: "Pending Review",
      date: "2024-01-12",
      certificate: "seminar-attendance.pdf"
    }
  ]);

  const [newActivity, setNewActivity] = useState({
    title: '',
    type: '',
    provider: '',
    credits: '',
    description: '',
    certificate: null as File | null
  });

  const totalCredits = activities.reduce((sum, activity) => 
    activity.status === 'Completed' || activity.status === 'Verified' 
      ? sum + activity.credits 
      : sum, 0
  );

  const targetCredits = 20;
  const creditProgress = (totalCredits / targetCredits) * 100;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewActivity(prev => ({ ...prev, certificate: file }));
      toast("File uploaded successfully!");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    toast("Activity submitted for review!");
    setNewActivity({
      title: '',
      type: '',
      provider: '',
      credits: '',
      description: '',
      certificate: null
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'Verified':
        return <Badge className="bg-blue-100 text-blue-800">Verified</Badge>;
      case 'In Progress':
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case 'Pending Review':
        return <Badge className="bg-orange-100 text-orange-800">Pending Review</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Credit Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Credit Progress
          </CardTitle>
          <CardDescription>
            Track your extracurricular activity credits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Credits Earned</span>
              <span className="font-bold">{totalCredits}/{targetCredits}</span>
            </div>
            <Progress value={creditProgress} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {targetCredits - totalCredits} credits remaining to reach your target
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Add New Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Add New Activity
            </CardTitle>
            <CardDescription>
              Upload and validate your participation in activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Activity Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., React.js Masterclass"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Activity Type</Label>
                <Select value={newActivity.type} onValueChange={(value) => setNewActivity(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seminar">Seminar</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="online-course">Online Course (MOOC)</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="extracurricular">Extracurricular</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider">Provider/Organization</Label>
                <Input
                  id="provider"
                  placeholder="e.g., Coursera, University"
                  value={newActivity.provider}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, provider: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="credits">Expected Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  placeholder="Number of credits"
                  value={newActivity.credits}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, credits: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the activity..."
                  value={newActivity.description}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certificate">Certificate/Proof</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="certificate"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                  {newActivity.certificate && (
                    <Badge variant="secondary">
                      <FileText className="h-3 w-3 mr-1" />
                      Uploaded
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload certificate, completion proof, or attendance record
                </p>
              </div>

              <Button type="submit" className="w-full">
                Submit for Review
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Activity History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Activity History
            </CardTitle>
            <CardDescription>
              Your submitted and verified activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{activity.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {activity.provider}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{activity.type}</TableCell>
                    <TableCell>{activity.credits}</TableCell>
                    <TableCell>{getStatusBadge(activity.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}