import { Home, Bell, BarChart3, Lightbulb, Users, Shield, LogOut, User, ClipboardList, History, CalendarDays } from "lucide-react";
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
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <img 
              src={mayaLogo} 
              alt="Maya Okulları" 
              className="h-8 w-8 object-contain"
            />
            <span className="text-base font-semibold tracking-tight">
              Maya <span className="text-primary">Meclisi</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
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
                      variant="ghost"
                      size="sm"
                      className={`text-sm font-medium gap-1.5 ${
                        isActive 
                          ? "text-foreground bg-accent" 
                          : "text-muted-foreground"
                      }`}
                      data-testid={`nav-${item.label.toLowerCase()}`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            {isAuthenticated && <NotificationBell />}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full" 
                    data-testid="button-profile"
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-border/50">
                      {showProfilePicture && <AvatarImage src={profilePictureUrl} alt={userName} />}
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <div className="flex items-center gap-3 p-3">
                    <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                      {showProfilePicture && <AvatarImage src={profilePictureUrl} alt={userName} />}
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{userName}</span>
                      <span className="text-xs text-muted-foreground capitalize">{userRole}</span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <Link href="/profil">
                    <DropdownMenuItem data-testid="link-profile" className="cursor-pointer gap-2">
                      <User className="h-4 w-4" />
                      Profil Ayarları
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/aktiviteler">
                    <DropdownMenuItem data-testid="link-activities" className="cursor-pointer gap-2">
                      <History className="h-4 w-4" />
                      Aktivite Geçmişi
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={onLogout} 
                    data-testid="button-logout" 
                    className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/giris">
                <Button size="sm" data-testid="button-login">
                  Giriş Yap
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center gap-1 pb-2 overflow-x-auto scrollbar-none -mx-1 px-1">
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
                    variant="ghost"
                    size="sm"
                    className={`text-xs whitespace-nowrap gap-1 ${
                      isActive 
                        ? "text-foreground bg-accent" 
                        : "text-muted-foreground"
                    }`}
                    data-testid={`nav-mobile-${item.label.toLowerCase()}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
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
