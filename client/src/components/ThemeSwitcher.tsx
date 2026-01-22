import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Palette, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeSwitcher() {
  const { colorMode, toggleColorMode } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" data-testid="button-theme-switcher">
          {colorMode === 'dark' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
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
