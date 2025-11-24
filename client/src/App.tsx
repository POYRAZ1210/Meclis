import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";
import Dashboard from "@/pages/Dashboard";
import Announcements from "@/pages/Announcements";
import Bluten from "@/pages/Bluten";
import Polls from "@/pages/Polls";
import Ideas from "@/pages/Ideas";
import Classes from "@/pages/Classes";
import Admin from "@/pages/Admin";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, profile, signOut, loading } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await signOut();
    setLocation("/giris");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const isAuthenticated = !!user;
  const userRole = profile?.role || "student";
  const userName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : user?.email || "Kullanıcı";

  return (
    <div className="min-h-screen bg-background">
      <Header
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        userName={userName}
        onLogout={handleLogout}
      />
      
      <Switch>
        <Route path="/giris" component={Login} />
        <Route path="/kayit" component={Register} />
        <Route path="/sifre-sifirla" component={ForgotPassword} />
        <Route path="/auth/reset" component={ResetPassword} />
        <Route path="/">
          <ProtectedRoute requireAuth={false}>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/duyurular">
          <ProtectedRoute requireAuth={false}>
            <Announcements />
          </ProtectedRoute>
        </Route>
        <Route path="/bluten">
          <ProtectedRoute requireAuth={false}>
            <Bluten />
          </ProtectedRoute>
        </Route>
        <Route path="/oylamalar">
          <ProtectedRoute requireAuth={false}>
            <Polls />
          </ProtectedRoute>
        </Route>
        <Route path="/fikirler">
          <ProtectedRoute requireAuth={false}>
            <Ideas />
          </ProtectedRoute>
        </Route>
        <Route path="/siniflar">
          <ProtectedRoute requireAdmin={true}>
            <Classes />
          </ProtectedRoute>
        </Route>
        <Route path="/yonetici">
          <ProtectedRoute requireAdmin={true}>
            <Admin />
          </ProtectedRoute>
        </Route>
        <Route path="/profil">
          <ProtectedRoute requireAuth={true}>
            <Profile />
          </ProtectedRoute>
        </Route>
        <Route component={NotFound} />
      </Switch>

      <footer className="border-t mt-16 bg-card">
        <div className="container mx-auto px-4 lg:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm font-semibold mb-1">
                <span className="text-primary">Maya</span> Okulları Öğrenci Meclisi
              </p>
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} Tüm hakları saklıdır.
              </p>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">
                Gizlilik
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Kullanım Şartları
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                İletişim
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
