import { useProcessos } from "@/hooks/useProcesso";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { format, parseISO, isBefore, isToday, addDays, startOfDay, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Calendario() {
  const { processos, isLoading, isError } = useProcessos();

  if (isLoading) {
    return <div className="p-8 text-muted-foreground">A carregar prazos...</div>;
  }

  if (isError) {
    return <div className="p-8 text-destructive">Erro ao carregar os dados.</div>;
  }

  const hoje = startOfDay(new Date());
  const daquiA7Dias = addDays(hoje, 7);

  const processosAtivos = processos.filter(p => p.status !== "Concluído");

  const atrasados = processosAtivos.filter(p => isBefore(parseISO(p.dataPrazo), hoje));
  const vencemHoje = processosAtivos.filter(p => isToday(parseISO(p.dataPrazo)));
  const proximos7Dias = processosAtivos.filter(p => 
    isAfter(parseISO(p.dataPrazo), hoje) && isBefore(parseISO(p.dataPrazo), daquiA7Dias)
  );
  
  const processosOrdenados = [...processosAtivos].sort((a, b) => 
    parseISO(a.dataPrazo).getTime() - parseISO(b.dataPrazo).getTime()
  );

  return (
    <div className="flex flex-col h-full bg-background p-8 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Controlo de Prazos</h1>
        <p className="text-muted-foreground mt-2">Visão geral dos teus vencimentos e pendências.</p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-l-destructive shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prazos Atrasados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{atrasados.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Requerem atenção imediata</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vencem Hoje</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{vencemHoje.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Prazos terminam hoje</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Próximos 7 Dias</CardTitle>
            <CalendarIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{proximos7Dias.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Planeamento semanal</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista detalhada de todos os prazos */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <h2 className="font-semibold text-foreground">Agenda de Processos Ativos</h2>
        </div>
        
        <div className="divide-y divide-border">
          {processosOrdenados.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mb-3" />
              <p>Não há processos ativos com prazos pendentes. Excelente!</p>
            </div>
          ) : (
            processosOrdenados.map((processo) => {
              const dataOriginal = parseISO(processo.dataPrazo);
              
              let statusStyle = "bg-secondary text-secondary-foreground border-border";
              let statusLabel = "No prazo";

              if (isBefore(dataOriginal, hoje)) {
                statusStyle = "bg-destructive/10 text-destructive border-destructive/20";
                statusLabel = "Atrasado";
              } else if (isToday(dataOriginal)) {
                statusStyle = "bg-amber-500/10 text-amber-500 border-amber-500/20";
                statusLabel = "Vence Hoje";
              } else if (isBefore(dataOriginal, daquiA7Dias)) {
                statusStyle = "bg-primary/10 text-primary border-primary/20";
                statusLabel = "Em breve";
              }

              return (
                <div key={processo.id} className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
                    
                    {/* Bloco da Data */}
                    <div className="flex flex-col items-center justify-center bg-muted rounded-lg p-3 min-w-[100px] border border-border">
                      <span className="text-xs font-bold text-muted-foreground uppercase">{format(dataOriginal, "MMM", { locale: ptBR })}</span>
                      <span className="text-2xl font-black text-foreground leading-none">{format(dataOriginal, "dd")}</span>
                    </div>

                    {/* Informações do Processo */}
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground text-lg leading-tight">{processo.nomeCliente}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm font-mono text-muted-foreground">{processo.numeroProcesso}</span>
                        <span className="text-muted-foreground/30">•</span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Badge variant="outline" className="font-normal bg-background">{processo.status}</Badge>
                        </span>
                      </div>
                    </div>

                    {/* Badge de Status do Prazo */}
                    <div className="shrink-0 mt-3 sm:mt-0">
                      <Badge variant="outline" className={`px-3 py-1 font-semibold ${statusStyle}`}>
                        {statusLabel}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}