import { useState } from 'react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider, 
  SidebarInset 
} from "./ui/sidebar";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  LayoutDashboard, 
  GraduationCap, 
  Calendar, 
  Users, 
  FileText, 
  BarChart3,
  LogOut,
  BookOpen,
  ClipboardList
} from "lucide-react";

const menuItems = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    id: "overview"
  },
  {
    title: "My Courses",
    icon: BookOpen,
    id: "courses"
  },
  {
    title: "Grade Management",
    icon: BarChart3,
    id: "grading"
  },
  {
    title: "Student Roster",
    icon: Users,
    id: "students"
  },
  {
    title: "Attendance",
    icon: Calendar,
    id: "attendance"
  },
  {
    title: "Reports",
    icon: FileText,
    id: "reports"
  }
];

interface FacultyDashboardProps {
  onLogout: () => void;
}

export function FacultyDashboard({ onLogout }: FacultyDashboardProps) {
  const [activeSection, setActiveSection] = useState("overview");

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4</div>
                  <p className="text-xs text-muted-foreground">This semester</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">127</div>
                  <p className="text-xs text-muted-foreground">Across all courses</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Grades</CardTitle>
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-xs text-muted-foreground">Assignments to grade</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates from your courses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New assignment submitted</p>
                      <p className="text-xs text-muted-foreground">CS101 - Data Structures</p>
                    </div>
                    <Badge variant="secondary">2 min ago</Badge>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Grade posted</p>
                      <p className="text-xs text-muted-foreground">MATH201 - Calculus II</p>
                    </div>
                    <Badge variant="secondary">1 hour ago</Badge>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Attendance marked</p>
                      <p className="text-xs text-muted-foreground">PHYS101 - Physics I</p>
                    </div>
                    <Badge variant="secondary">3 hours ago</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Deadlines</CardTitle>
                  <CardDescription>Important dates and deadlines</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Midterm Exam</p>
                      <p className="text-xs text-muted-foreground">CS101 - Data Structures</p>
                    </div>
                    <Badge variant="destructive">Tomorrow</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Assignment Due</p>
                      <p className="text-xs text-muted-foreground">MATH201 - Calculus II</p>
                    </div>
                    <Badge variant="secondary">3 days</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Grade Submission</p>
                      <p className="text-xs text-muted-foreground">All Courses</p>
                    </div>
                    <Badge variant="outline">1 week</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case "courses":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">My Courses</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { name: "CS101 - Data Structures", students: 32, credits: 3, status: "Active" },
                { name: "MATH201 - Calculus II", students: 28, credits: 4, status: "Active" },
                { name: "PHYS101 - Physics I", students: 35, credits: 4, status: "Active" },
                { name: "CS301 - Algorithms", students: 25, credits: 3, status: "Active" }
              ].map((course, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    <CardDescription>
                      {course.credits} credits • {course.students} students
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="default">{course.status}</Badge>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">
              {menuItems.find(item => item.id === activeSection)?.title || "Dashboard"}
            </h2>
            <Card>
              <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>This section is under development</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  The {menuItems.find(item => item.id === activeSection)?.title.toLowerCase()} functionality will be available soon.
                </p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Faculty Portal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveSection(item.id)}
                        isActive={activeSection === item.id}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6" />
              <h1 className="text-lg font-semibold">Faculty Dashboard</h1>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Welcome, Dr. Smith</span>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </header>
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
