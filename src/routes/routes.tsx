import { Routes, Route } from "react-router-dom";
import Kanban from "../pages/Kanban";
import Calendario from "../pages/Calendario";
import Configuracoes from "../pages/Configuracoes";
import NotFound from "../pages/NotFound";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Kanban />} />
      <Route path="/calendario" element={<Calendario />} />
      <Route path="/configuracoes" element={<Configuracoes />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
