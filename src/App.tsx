import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppRoutes } from "./routes/routes";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppToaster />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background text-foreground transition-colors duration-300">
              <AppSidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <header className="h-12 flex items-center bg-card border-b border-border transition-colors duration-300">
                  <SidebarTrigger className="ml-2" />
                </header>
                <main className="flex-1 overflow-hidden">
                  <AppRoutes />
                </main>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;