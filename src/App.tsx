import { Toaster } from "./components/ui/sonner";
import LoginPage from "./components/LoginPage";
import { StudentDashboard } from "./components/StudentDashboard";
import { FacultyDashboard } from "./components/FacultyDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Loader2 } from "lucide-react";

type UserRole = 'student' | 'faculty' | 'admin';

function AppContent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  console.log('App state:', { user, isAuthenticated, isLoading });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-12 w-12 text-white animate-spin" />
          </div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log('Not authenticated, showing login page');
    return <LoginPage onLogin={() => {}} />;
  }

  console.log('Authenticated, showing dashboard for role:', user.role);

  const renderDashboard = () => {
    switch (user.role) {
      case 'student':
        return <StudentDashboard onLogout={logout} />;
      case 'faculty':
        return <FacultyDashboard onLogout={logout} />;
      case 'admin':
        return <AdminDashboard onLogout={logout} />;
      default:
        return <StudentDashboard onLogout={logout} />;
    }
  };

  return (
    <>
      {renderDashboard()}
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}