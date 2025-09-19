import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
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
import { StudentHeader } from "./StudentHeader";
import { DashboardOverview } from "./DashboardOverview";
import { AcademicPerformance } from "./AcademicPerformance";
import { AttendanceTracker } from "./AttendanceTracker";
import { ActivityTracker } from "./ActivityTracker";
import { GradingSection } from "./GradingSection";
import { 
  LayoutDashboard, 
  GraduationCap, 
  Calendar, 
  Trophy, 
  FileText, 
  BarChart3,
  LogOut
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
    title: "Grading",
    icon: BarChart3,
    id: "grading"
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
    title: "Transcripts",
    icon: FileText,
    id: "transcripts"
  }
];

interface StudentDashboardProps {
  onLogout: () => void;
}

export function StudentDashboard({ onLogout }: StudentDashboardProps) {
  const [activeSection, setActiveSection] = useState("overview");
  const { user } = useAuth();

  const handleDownloadTranscript = async (docType: string) => {
    if (!user) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Verified Digital Portfolio', 20, 20);
    doc.setFontSize(12);
    doc.text(`Name: ${user.firstName} ${user.lastName}`, 20, 35);
    doc.text(`Email: ${user.email}`, 20, 45);
    doc.text(`Role: ${user.role}`, 20, 55);
    if (user.studentId) doc.text(`Student ID: ${user.studentId}`, 20, 65);
    if (user.department) doc.text(`Department: ${user.department}`, 20, 75);
    if (user.year) doc.text(`Year: ${user.year}`, 20, 85);
    if (user.semester) doc.text(`Semester: ${user.semester}`, 20, 95);
    doc.text(`Document Type: ${docType}`, 20, 110);

    // Add random projects
    const projects = [
      'AI Chatbot for Student Support',
      'Online Exam Proctoring System',
      'Smart Attendance Tracker',
      'Course Recommendation Engine',
      'Digital Gradebook',
      'Faculty Feedback Portal',
      'Student Portfolio Website',
      'Mobile App for Campus Events',
      'Library Management System',
      'Virtual Lab Simulator'
    ];
    // Pick 3 random projects
    const shuffled = projects.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    doc.setFontSize(14);
    doc.text('Projects:', 20, 130);
    doc.setFontSize(12);
    selected.forEach((proj, idx) => {
      doc.text(`• ${proj}`, 28, 140 + idx * 10);
    });

    // Generate a random QR code
    const qrData = `Verified for ${user.firstName} ${user.lastName} - ${Date.now()}`;
    const qrUrl = await QRCode.toDataURL(qrData, { width: 80, margin: 1 });
    // Place QR at bottom right
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.addImage(qrUrl, 'PNG', pageWidth - 50, pageHeight - 50, 40, 40);

    doc.save(`${user.firstName}_${user.lastName}_${docType.replace(/\s/g, '_')}_portfolio.pdf`);
  };

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
      case "grading":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Grading Overview</h2>
            <GradingSection />
          </div>
        );
      case "attendance":
        return <AttendanceTracker />;
      case "activities":
        return <ActivityTracker />;
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
                  <button
                    className="mt-3 text-sm text-blue-600 hover:underline"
                    onClick={() => handleDownloadTranscript(doc)}
                  >
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
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6" />
              <h1 className="text-lg font-semibold">Student Dashboard</h1>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Welcome, Alex!</span>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </header>
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
    </SidebarProvider>
  );
}
