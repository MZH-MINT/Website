import { useTheme } from "@/hooks/use-theme";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  const handleToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  return (
    <div className="flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">
      <Sun className="h-4 w-4 text-yellow-500 mr-1" />
      <Label htmlFor="theme-toggle" className="mr-2 font-medium">Light</Label>
      <Switch
        id="theme-toggle"
        checked={theme === "dark"}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor="theme-toggle" className="ml-2 text-gray-500 dark:text-gray-300">Dark</Label>
      <Moon className="h-4 w-4 text-blue-600 dark:text-blue-400 ml-1" />
    </div>
  );
}