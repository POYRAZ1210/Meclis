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
import Polls from "@/pages/Polls";
import Ideas from "@/pages/Ideas";
import Classes from "@/pages/Classes";
import Admin from "@/pages/Admin";
import Login from "@/pages/Login";
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
      {isAuthenticated && (
        <Header
          isAuthenticated={isAuthenticated}
          userRole={userRole}
          userName={userName}
          onLogout={handleLogout}
        />
      )}
      
      <Switch>
        <Route path="/giris" component={Login} />
        <Route path="/">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/duyurular">
          <ProtectedRoute>
            <Announcements />
          </ProtectedRoute>
        </Route>
        <Route path="/oylamalar">
          <ProtectedRoute>
            <Polls />
          </ProtectedRoute>
        </Route>
        <Route path="/fikirler">
          <ProtectedRoute>
            <Ideas />
          </ProtectedRoute>
        </Route>
        <Route path="/siniflar">
          <ProtectedRoute>
            <Classes />
          </ProtectedRoute>
        </Route>
        <Route path="/yonetici">
          <ProtectedRoute requireAdmin={true}>
            <Admin />
          </ProtectedRoute>
        </Route>
        <Route component={NotFound} />
      </Switch>

      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 lg:px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Okul Meclisi. Tüm hakları saklıdır.
            </p>
            <button
              className="text-sm text-primary hover:underline"
              onClick={() => console.log("Tema değiştir")}
              data-testid="link-theme"
            >
              Mor-Kırmızı Tema
            </button>
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
