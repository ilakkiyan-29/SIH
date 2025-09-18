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
} from "./components/ui/sidebar";
import { StudentHeader } from "./components/StudentHeader";
import { DashboardOverview } from "./components/DashboardOverview";
import { AcademicPerformance } from "./components/AcademicPerformance";
import { AttendanceTracker } from "./components/AttendanceTracker";
import { ActivityTracker } from "./components/ActivityTracker";
import { Toaster } from "./components/ui/sonner";
import { 
  LayoutDashboard, 
  GraduationCap, 
  Calendar, 
  Trophy, 
  FileText, 
  BarChart3 
} from "lucide-react";

const menuItems = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    id: "overview"
  },
  {
    title: "Academic Performance",
    icon: GraduationCap,
    id: "performance"
  },
  {
    title: "Attendance",
    icon: Calendar,
    id: "attendance"
  },
  {
    title: "Activity Tracker",
    icon: Trophy,
    id: "activities"
  },
  {
    title: "Reports",
    icon: BarChart3,
    id: "reports"
  },
  {
    title: "Transcripts",
    icon: FileText,
    id: "transcripts"
  }
];

export default function App() {
  const [activeSection, setActiveSection] = useState("overview");

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            <DashboardOverview />
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-4">Quick Stats</h3>
                <AcademicPerformance />
              </div>
              <div>
                <h3 className="mb-4">Recent Activity</h3>
                <AttendanceTracker />
              </div>
            </div>
          </div>
        );
      case "performance":
        return <AcademicPerformance />;
      case "attendance":
        return <AttendanceTracker />;
      case "activities":
        return <ActivityTracker />;
      case "reports":
        return (
          <div className="space-y-6">
            <h2>Academic Reports</h2>
            <p className="text-muted-foreground">
              Detailed academic reports and analytics will be displayed here.
            </p>
            <DashboardOverview />
            <AcademicPerformance />
          </div>
        );
      case "transcripts":
        return (
          <div className="space-y-6">
            <h2>Transcripts & Documents</h2>
            <p className="text-muted-foreground">
              Access and download your official transcripts and academic documents.
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {['Official Transcript', 'Degree Progress Report', 'Course History'].map((doc) => (
                <div key={doc} className="p-4 border rounded-lg">
                  <h4 className="font-medium">{doc}</h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    Download or view your {doc.toLowerCase()}
                  </p>
                  <button className="mt-3 text-sm text-blue-600 hover:underline">
                    Download PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
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
          <StudentHeader />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h2 className="text-3xl font-bold tracking-tight">
                  {menuItems.find(item => item.id === activeSection)?.title || "Dashboard"}
                </h2>
                <p className="text-muted-foreground">
                  Welcome back, Alex! Here's your academic overview.
                </p>
              </div>
              {renderContent()}
            </div>
          </main>
        </SidebarInset>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}