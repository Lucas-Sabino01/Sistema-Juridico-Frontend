import { useProcessos } from "@/hooks/useProcesso";
import { 
  Building2, 
  Archive, 
  Clock, 
  CheckCircle2, 
  Scale, 
  PieChart as PieChartIcon,
  BellRing
} from "lucide-react";
import { isBefore, startOfDay, differenceInDays, parseISO } from "date-fns";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { processos, isLoading, isError } = useProcessos();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-theme(spacing.16))]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-theme(spacing.16))]">
        <p className="text-destructive font-medium">Erro ao carregar dados do Dashboard.</p>
      </div>
    );
  }

  const ativos = processos.filter(p => !p.arquivado);
  const arquivados = processos.filter(p => p.arquivado);
  const concluidos = ativos.filter(p => p.status === "Concluído");
  
  const hoje = startOfDay(new Date());
  
  const urgentes = ativos.filter(p => {
    if (p.status === "Concluído") return false;
    
    if ((p.etiquetas || []).some(tag => tag && tag.toLowerCase().includes("urgente"))) return true;
    
    if (!p.dataPrazo) return false;
    const dataPrazoObj = startOfDay(parseISO(p.dataPrazo));
    const isLate = isBefore(dataPrazoObj, hoje);
    const diffDays = differenceInDays(dataPrazoObj, hoje);
    
    return isLate || diffDays <= 3;
  });

  const porStatus = {
    "Triagem": ativos.filter(p => p.status === "A Fazer").length,
    "Petição Inicial": ativos.filter(p => p.status === "Fazendo").length,
    "Em Andamento": ativos.filter(p => p.status === "Feito ou realizado").length,
    "Aguardando Prazo": ativos.filter(p => p.status === "Aguardando Prazo").length,
    "Concluído": concluidos.length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Triagem": return "bg-blue-500 text-white";
      case "Petição Inicial": return "bg-purple-500 text-white";
      case "Em Andamento": return "bg-amber-500 text-white";
      case "Aguardando Prazo": return "bg-orange-500 text-white";
      case "Concluído": return "bg-emerald-500 text-white";
      default: return "bg-primary text-primary-foreground";
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] bg-background overflow-y-auto custom-scrollbar">
      <div className="flex flex-col px-8 py-5 border-b border-border bg-card shadow-sm z-10 sticky top-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <PieChartIcon className="h-6 w-6 text-primary" />
            Visão Geral
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Métricas e resumos do seu escritório
          </p>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Notificação Banner se houver urgências */}
        {urgentes.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-4 shadow-sm">
            <div className="bg-destructive/20 p-2 rounded-full mt-0.5">
              <BellRing className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-destructive">Atenção aos Prazos!</h3>
              <p className="text-sm text-destructive/90 mt-1">
                Você tem <strong>{urgentes.length}</strong> processo(s) com prazos críticos (vencendo em breve ou atrasados) ou marcados como Urgentes.
              </p>
              <Link to="/notificacoes" className="text-sm font-semibold text-destructive underline mt-2 inline-block hover:opacity-80">
                Ver Central de Notificações &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* Cards Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processos Ativos</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">{ativos.length}</h3>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <Scale className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">
                  {ativos.length - concluidos.length}
                </h3>
              </div>
              <div className="bg-amber-500/10 p-3 rounded-lg">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concluídos</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">{concluidos.length}</h3>
              </div>
              <div className="bg-emerald-500/10 p-3 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer opacity-80">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Arquivo Morto</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">{arquivados.length}</h3>
              </div>
              <div className="bg-slate-500/10 p-3 rounded-lg">
                <Archive className="h-5 w-5 text-slate-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mt-8">
          <div className="p-5 border-b border-border/50 bg-muted/20">
            <h3 className="font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Distribuição por Status
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-5">
              {Object.entries(porStatus).map(([status, count]) => {
                const percentage = ativos.length > 0 ? Math.round((count / ativos.length) * 100) : 0;
                return (
                  <div key={status} className="flex items-center gap-4">
                    <div className="w-[140px] text-sm font-medium text-muted-foreground shrink-0">{status}</div>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getStatusColor(status)} transition-all duration-500 ease-in-out`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-right text-sm font-bold text-foreground shrink-0">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
