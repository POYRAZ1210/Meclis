import { Home, Bell, BarChart3, Lightbulb, Users, Shield, LogOut, Image, User, ClipboardList } from "lucide-react";
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
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-3 py-2 transition-all">
            <img 
              src={mayaLogo} 
              alt="Maya Okulları" 
              className="h-8 w-8 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-none">
                <span className="text-primary">Maya</span> Meclisi
              </span>
              <span className="text-xs text-muted-foreground leading-none mt-0.5">Öğrenci Portalı</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems
              .filter((item) => !item.requireAuth || isAuthenticated)
              .map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                return (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant="ghost"
                      className={isActive ? "bg-accent" : ""}
                      data-testid={`nav-${item.label.toLowerCase()}`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            {isAuthenticated && <NotificationBell />}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-profile">
                    <Avatar className="h-8 w-8">
                      {showProfilePicture && <AvatarImage src={profilePictureUrl} alt={userName} />}
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      {showProfilePicture && <AvatarImage src={profilePictureUrl} alt={userName} />}
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
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
                    <DropdownMenuItem data-testid="link-profile">
                      <User className="h-4 w-4 mr-2" />
                      Profil Ayarları
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={onLogout} data-testid="button-logout">
                    <LogOut className="h-4 w-4 mr-2" />
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/giris">
                <Button variant="default" data-testid="button-login">
                  Giriş Yap
                </Button>
              </Link>
            )}
          </div>
        </div>

        <nav className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
          {navItems
            .filter((item) => !item.requireAuth || isAuthenticated)
            .map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={isActive ? "bg-accent" : ""}
                    data-testid={`nav-mobile-${item.label.toLowerCase()}`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
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
