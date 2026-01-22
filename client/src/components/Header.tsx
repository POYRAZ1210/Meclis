import { Home, Bell, BarChart3, Lightbulb, Users, Shield, LogOut, Image, User, ClipboardList, History, CalendarDays } from "lucide-react";
import mayaLogo from "@assets/maya-okullari-logo-simge_1763489344712.webp";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NotificationBell from "@/components/NotificationBell";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

interface HeaderProps {
  isAuthenticated?: boolean;
  userRole?: "admin" | "teacher" | "student";
  userName?: string;
  profilePictureUrl?: string | null;
  profilePictureStatus?: 'pending' | 'approved' | 'rejected';
  onLogout?: () => void;
}

export default function Header({ 
  isAuthenticated = false, 
  userRole = "student",
  userName = "Kullanıcı",
  profilePictureUrl,
  profilePictureStatus,
  onLogout 
}: HeaderProps) {
  const showProfilePicture = profilePictureUrl && profilePictureStatus === 'approved';
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Ana Sayfa", icon: Home },
    { path: "/duyurular", label: "Duyurular", icon: Bell },
    { path: "/bluten", label: "Bülten", icon: Image },
    { path: "/oylamalar", label: "Oylamalar", icon: BarChart3 },
    { path: "/fikirler", label: "Fikirler", icon: Lightbulb },
    { path: "/basvurular", label: "Başvurular", icon: ClipboardList, requireAuth: true },
    { path: "/takvim", label: "Takvim", icon: CalendarDays, adminOnly: true },
  ];

  if (userRole === "admin") {
    navItems.push({ path: "/siniflar", label: "Sınıflar", icon: Users });
    navItems.push({ path: "/yonetici", label: "Yönetici", icon: Shield });
  }

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3 rounded-md px-2 py-1.5 hover-elevate overflow-visible">
            <img 
              src={mayaLogo} 
              alt="Maya Okulları" 
              className="h-7 w-7 object-contain"
            />
            <div className="flex items-center gap-1.5">
              <span className="text-base font-semibold tracking-tight">
                Maya Meclisi
              </span>
              <span className="hidden sm:inline-flex text-xs text-muted-foreground border border-border/60 rounded px-1.5 py-0.5">Portal</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5">
            {navItems
              .filter((item) => {
                if (item.adminOnly && userRole !== "admin") return false;
                if (item.requireAuth && !isAuthenticated) return false;
                return true;
              })
              .map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                return (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      className={`text-sm font-medium ${!isActive ? "text-muted-foreground" : ""}`}
                      data-testid={`nav-${item.label.toLowerCase()}`}
                    >
                      <Icon className="h-4 w-4 mr-1.5" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
          </nav>

          <div className="flex items-center gap-1">
            <ThemeSwitcher />
            {isAuthenticated && <NotificationBell />}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full ml-1" data-testid="button-profile">
                    <Avatar className="h-8 w-8 border border-border/60">
                      {showProfilePicture && <AvatarImage src={profilePictureUrl} alt={userName} />}
                      <AvatarFallback className="bg-muted text-foreground text-xs font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-1">
                  <div className="flex items-center gap-3 p-3">
                    <Avatar className="h-9 w-9 border border-border/60">
                      {showProfilePicture && <AvatarImage src={profilePictureUrl} alt={userName} />}
                      <AvatarFallback className="bg-muted text-foreground text-xs font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{userName}</span>
                      <span className="text-xs text-muted-foreground capitalize">{userRole}</span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <Link href="/profil">
                    <DropdownMenuItem data-testid="link-profile" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Profil Ayarları
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/aktiviteler">
                    <DropdownMenuItem data-testid="link-activities" className="cursor-pointer">
                      <History className="h-4 w-4 mr-2" />
                      Aktivite Geçmişi
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} data-testid="button-logout" className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/giris">
                <Button size="sm" data-testid="button-login" className="ml-2">
                  Giriş Yap
                </Button>
              </Link>
            )}
          </div>
        </div>

        <nav className="md:hidden flex items-center gap-0.5 pb-2 overflow-x-auto scrollbar-none">
          {navItems
            .filter((item) => {
              if (item.adminOnly && userRole !== "admin") return false;
              if (item.requireAuth && !isAuthenticated) return false;
              return true;
            })
            .map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={`text-xs whitespace-nowrap ${!isActive ? "text-muted-foreground" : ""}`}
                    data-testid={`nav-mobile-${item.label.toLowerCase()}`}
                  >
                    <Icon className="h-3.5 w-3.5 mr-1" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
        </nav>
      </div>
    </header>
  );
}
