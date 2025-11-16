import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
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
  //todo: remove mock functionality - replace with actual auth
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [userRole] = useState<"admin" | "teacher" | "student">("admin");
  const [userName] = useState("Ahmet Yılmaz");

  const handleLogout = () => {
    setIsAuthenticated(false);
    console.log("Çıkış yapıldı");
  };

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
        <Route path="/" component={Dashboard} />
        <Route path="/duyurular" component={Announcements} />
        <Route path="/oylamalar" component={Polls} />
        <Route path="/fikirler" component={Ideas} />
        <Route path="/siniflar" component={Classes} />
        <Route path="/yonetici" component={Admin} />
        <Route path="/giris" component={Login} />
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
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
