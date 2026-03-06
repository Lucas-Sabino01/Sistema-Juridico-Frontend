import { Routes, Route } from "react-router-dom";
import Kanban from "../pages/Kanban";
import Calendario from "../pages/Calendario";
import Arquivo from "../pages/Arquivo";
import Dashboard from "../pages/Dashboard";
import Notificacoes from "../pages/Notificacoes";
import Configuracoes from "../pages/Configuracoes";
import NotFound from "../pages/NotFound";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Kanban />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/calendario" element={<Calendario />} />
      <Route path="/notificacoes" element={<Notificacoes />} />
      <Route path="/arquivo" element={<Arquivo />} />
      <Route path="/configuracoes" element={<Configuracoes />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
