import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Tema = "claro" | "escuro";
type Fonte = "pequena" | "normal" | "grande";

interface ThemeContextType {
  tema: Tema;
  setTema: (tema: Tema) => void;
  fonte: Fonte;
  setFonte: (fonte: Fonte) => void;
  altoContraste: boolean;
  setAltoContraste: (altoContraste: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(() => (localStorage.getItem("app-tema") as Tema) || "claro");
  const [fonte, setFonte] = useState<Fonte>(() => (localStorage.getItem("app-fonte") as Fonte) || "normal");
  const [altoContraste, setAltoContraste] = useState<boolean>(() => localStorage.getItem("app-contraste") === "true");

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove("dark");
    if (tema === "escuro") {
      root.classList.add("dark");
    }

    root.classList.remove("text-sm", "text-base", "text-lg");
    if (fonte === "pequena") root.classList.add("text-sm");
    if (fonte === "normal") root.classList.add("text-base");
    if (fonte === "grande") root.classList.add("text-lg");

    localStorage.setItem("app-tema", tema);
    localStorage.setItem("app-fonte", fonte);
    localStorage.setItem("app-contraste", String(altoContraste));
  }, [tema, fonte, altoContraste]);

  return (
    <ThemeContext.Provider value={{ tema, setTema, fonte, setFonte, altoContraste, setAltoContraste }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme deve ser usado dentro de um ThemeProvider");
  }
  return context;
}