import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

export function ThemeSwitcher() {
  const { tema, setTema } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full bg-background/50 backdrop-blur-sm border border-border/50 hover:bg-background/80"
      onClick={() => setTema(tema === "claro" ? "escuro" : "claro")}
      title={`Mudar para tema ${tema === "claro" ? "escuro" : "claro"}`}
    >
      {tema === "claro" ? (
        <Moon className="h-5 w-5 text-foreground/70" />
      ) : (
        <Sun className="h-5 w-5 text-foreground/70" />
      )}
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
