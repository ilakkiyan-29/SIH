import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react";

export function AttendanceTracker() {
  const attendanceData = [
    { course: 'Mathematics 301', attended: 28, total: 30, percentage: 93.3, status: 'excellent' },
    { course: 'Computer Science 401', attended: 25, total: 28, percentage: 89.3, status: 'good' },
    { course: 'English 205', attended: 22, total: 25, percentage: 88.0, status: 'good' },
    { course: 'Physics 301', attended: 20, total: 22, percentage: 90.9, status: 'excellent' },
    { course: 'History 101', attended: 15, total: 18, percentage: 83.3, status: 'warning' },
  ];

  const recentAttendance = [
    { date: '2024-01-15', course: 'Math 301', status: 'present', time: '09:00 AM' },
    { date: '2024-01-15', course: 'CS 401', status: 'present', time: '11:00 AM' },
    { date: '2024-01-14', course: 'Eng 205', status: 'absent', time: '02:00 PM' },
    { date: '2024-01-14', course: 'Phy 301', status: 'present', time: '10:00 AM' },
    { date: '2024-01-13', course: 'Hist 101', status: 'late', time: '03:15 PM' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
      case 'good':
        return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Needs Improvement</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Course Attendance Summary
          </CardTitle>
          <CardDescription>Your attendance rate for each course</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendanceData.map((course) => (
              <div key={course.course} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{course.course}</span>
                  {getStatusBadge(course.status)}
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{course.attended}/{course.total} classes</span>
                  <span>{course.percentage.toFixed(1)}%</span>
                </div>
                <Progress value={course.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
          <CardDescription>Your latest class attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentAttendance.map((record, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{record.date}</TableCell>
                  <TableCell>{record.course}</TableCell>
                  <TableCell>{record.time}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getAttendanceIcon(record.status)}
                      <span className="capitalize">{record.status}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}