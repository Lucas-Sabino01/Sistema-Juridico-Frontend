import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes/routes";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

import { AuthProvider } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

const AppToaster = () => {
  const { tema } = useTheme();
  return (
    <Sonner 
      position="top-right" 
      richColors 
      theme={tema === "escuro" ? "dark" : "light"} 
      toastOptions={{
        className: "rounded-2xl shadow-lg border border-border font-medium",
      }}
    />
  );
};

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AppToaster />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;