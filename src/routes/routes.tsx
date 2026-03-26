import { Routes, Route, Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Kanban from "../pages/Kanban";
import Calendario from "../pages/Calendario";
import Arquivo from "../pages/Arquivo";
import Dashboard from "../pages/Dashboard";
import Notificacoes from "../pages/Notificacoes";
import Configuracoes from "../pages/Configuracoes";
import NotFound from "../pages/NotFound";
import Login from "../pages/Login";
import RedefinirSenha from "../pages/RedefinirSenha";
import UsuariosAdmin from "../pages/UsuariosAdmin";
import RelatorioProcessos from "../pages/RelatorioProcessos";
import ImportadorExcel from "../pages/ImportadorExcel";
import ExtratorAudiencia from "../pages/ExtratorAudiencia";

function MainLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground transition-colors duration-300">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center bg-card border-b border-border transition-colors duration-300">
            <SidebarTrigger className="ml-2" />
          </header>
          <main className="flex-1 overflow-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/redefinir-senha" element={<RedefinirSenha />} />
      
      <Route element={<MainLayout />}>
        <Route path="/" element={<Kanban />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/notificacoes" element={<Notificacoes />} />
        <Route path="/arquivo" element={<Arquivo />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/admin/usuarios" element={<UsuariosAdmin />} />
        <Route path="/relatorios" element={<RelatorioProcessos />} />
        <Route path="/importar" element={<ImportadorExcel />} />
        <Route path="/extrator-audiencia" element={<ExtratorAudiencia />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
