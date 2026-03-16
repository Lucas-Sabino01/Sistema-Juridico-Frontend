import { Scale, LayoutDashboard, CalendarDays, Settings, Archive, PieChart, Bell, FileSpreadsheet, ClipboardList } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: PieChart },
  { title: "Kanban", url: "/", icon: LayoutDashboard },
  { title: "Importar Excel", url: "/importar", icon: FileSpreadsheet },
  { title: "Relatórios", url: "/relatorios", icon: ClipboardList },
  { title: "Notificações", url: "/notificacoes", icon: Bell },
  { title: "Calendário", url: "/calendario", icon: CalendarDays },
  { title: "Arquivo", url: "/arquivo", icon: Archive },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-2.5">
          <Scale className="h-6 w-6 shrink-0" />
          {!collapsed && <span className="text-lg font-bold tracking-tight">JurídicoApp</span>}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}