import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { GraduationCap, Users, Shield, Eye, EyeOff, Loader2, BookOpen, UserCheck, Settings } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

type UserRole = 'student' | 'faculty' | 'admin';

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<UserRole>('student');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Password: at least 6 characters
    const passwordRegex = /^.{6,}$/;

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!passwordRegex.test(password)) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    
    setError("");
    setIsLoading(true);
    
    try {
      console.log('Attempting login with:', { email, role: activeTab });
      const result = await login(email, password, activeTab);
      console.log('Login result:', result);
      
      if (result.success) {
        console.log('Login successful, calling onLogin');
        onLogin(activeTab);
      } else {
        setError(result.error || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'student':
        return <GraduationCap className="h-6 w-6 text-blue-500" />;
      case 'faculty':
        return <Users className="h-6 w-6 text-purple-500" />;
      case 'admin':
        return <Shield className="h-6 w-6 text-red-500" />;
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'student':
        return "Access your courses, grades, and academic progress";
      case 'faculty':
        return "Manage courses, grade students, and track attendance";
      case 'admin':
        return "System administration, user management, and institutional oversight";
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'student':
        return 'from-blue-500 to-blue-600';
      case 'faculty':
        return 'from-purple-500 to-purple-600';
      case 'admin':
        return 'from-red-500 to-red-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content Container - Perfectly Centered */}
  <div className="w-full max-w-xl relative z-10 flex flex-col items-center justify-center text-center">
        {/* Header - Perfectly Centered */}
  <div className="text-center mb-8 w-full flex flex-col items-center justify-center gap-0.5">
          <div className="flex justify-center items-center">
            <div className="p-4 bg-white rounded-2xl shadow-lg flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Academic Portal</h1>
          <p className="text-gray-600 text-lg">Sign in to access your dashboard</p>
        </div>

        {/* Login Card - Perfectly Centered */}
  <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm w-full max-w-xl flex flex-col items-center justify-center text-center">
          <CardHeader className="space-y-1 pb-6 text-center flex flex-col items-center justify-center">
            <div className="flex flex-col items-center w-full gap-1">
              <CardTitle className="text-2xl text-gray-900 font-bold whitespace-nowrap">Welcome Back</CardTitle>
              <CardDescription className="text-gray-600 text-lg whitespace-nowrap mb-1">Choose the mode of role and sign in to continue</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="w-full flex flex-col items-center justify-center text-center">
            <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as UserRole)} className="w-full flex flex-col items-center justify-center text-center">
              <TabsList className="grid w-full grid-cols-3 mb-6 mt-0 bg-gray-100">
                <TabsTrigger 
                  value="student" 
                  className="flex items-center justify-center gap-0 data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600"
                >
                  <GraduationCap className="h-4 w-4" />
                  Student
                </TabsTrigger>
                <TabsTrigger 
                  value="faculty" 
                  className="flex items-center justify-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white text-gray-600"
                >
                  <Users className="h-4 w-4" />
                  Faculty
                </TabsTrigger>
                <TabsTrigger 
                  value="admin" 
                  className="flex items-center justify-center gap-2 data-[state=active]:bg-red-500 data-[state=active]:text-white text-gray-600"
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-6 w-full flex flex-col items-center justify-center text-center">
                {/* Role Info Card - Centered */}
                <div className={`flex flex-col items-center justify-center gap-4 p-4 bg-gradient-to-r ${getRoleColor(activeTab)} rounded-xl text-white w-full`}>
                  <div className="p-2 bg-white/20 rounded-lg flex items-center justify-center mx-auto">
                    {getRoleIcon(activeTab)}
                  </div>
                  <div className="text-center flex-1">
                    <p className="font-semibold capitalize">{activeTab} Portal</p>
                    <p className="text-sm opacity-90">{getRoleDescription(activeTab)}</p>
                  </div>
                </div>

                {/* Login Form - Centered */}
                <form onSubmit={handleSubmit} className="space-y-5 w-full flex flex-col items-center justify-center text-center">
                  <div className="space-y-2 w-full flex flex-col items-center justify-center text-center">
                    <Label htmlFor="email" className="text-gray-700 font-medium text-center block">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-72 mx-auto text-center"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2 w-full flex flex-col items-center justify-center text-center">
                    <Label htmlFor="password" className="text-gray-700 font-medium text-center block">Password</Label>
                    <div className="relative w-72 mx-auto">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 pr-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full text-center"
                        required
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 w-72 mx-auto">
                      <AlertDescription className="text-center">{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className={`w-72 h-12 bg-gradient-to-r ${getRoleColor(activeTab)} hover:opacity-90 text-white font-semibold shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Sign In as {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-8 text-center w-full">
              <p className="text-sm text-gray-500">Need help? Contact your system administrator</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer - Perfectly Centered */}
        <div className="mt-8 text-center w-full">
          <p className="text-gray-500 text-sm text-center">
            © 2024 Academic Portal. All rights reserved.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}