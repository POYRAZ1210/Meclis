import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Palette, Sun, Moon, Sparkles, GraduationCap } from "lucide-react";
import { useTheme, type DesignTheme } from "@/contexts/ThemeContext";

export function ThemeSwitcher() {
  const { designTheme, colorMode, setDesignTheme, toggleColorMode } = useTheme();

  const themes: { id: DesignTheme; name: string; icon: typeof Sparkles; description: string }[] = [
    { 
      id: 'maya', 
      name: 'Maya Klasik', 
      icon: GraduationCap, 
      description: 'Mor ve beyaz okul teması' 
    },
    { 
      id: 'framer', 
      name: 'Modern', 
      icon: Sparkles, 
      description: 'Cam efektli modern tasarım' 
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" data-testid="button-theme-switcher">
          <Palette className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Tema Seçimi</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => setDesignTheme(theme.id)}
            className="flex items-center gap-3 cursor-pointer"
            data-testid={`menu-item-theme-${theme.id}`}
          >
            <theme.icon className={`h-4 w-4 ${designTheme === theme.id ? 'text-primary' : ''}`} />
            <div className="flex-1">
              <div className={`text-sm font-medium ${designTheme === theme.id ? 'text-primary' : ''}`}>
                {theme.name}
              </div>
              <div className="text-xs text-muted-foreground">{theme.description}</div>
            </div>
            {designTheme === theme.id && (
              <div className="h-2 w-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Renk Modu</DropdownMenuLabel>
        
        <DropdownMenuItem 
          onClick={toggleColorMode} 
          className="flex items-center gap-3 cursor-pointer"
          data-testid="menu-item-toggle-color-mode"
        >
          {colorMode === 'dark' ? (
            <>
              <Sun className="h-4 w-4" />
              <span>Açık Mod</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" />
              <span>Koyu Mod</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
