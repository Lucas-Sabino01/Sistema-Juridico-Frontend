import { useState, useMemo } from "react";
import { useProcessos } from "@/hooks/useProcesso";
import { KANBAN_COLUMNS } from "@/types/processo";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { Loader2, Search, Download, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { cn, stringToColorClass } from "@/lib/utils";

const STATUS_STYLES: Record<string, { badge: string; row: string }> = {
  "A Fazer":           { badge: "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700",               row: "bg-rose-50 dark:bg-rose-950/30" },
  "Fazendo":           { badge: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700",               row: "bg-blue-50 dark:bg-blue-950/30" },
  "Feito ou realizado":{ badge: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700", row: "bg-emerald-50 dark:bg-emerald-950/30" },
  "Aguardando Prazo":  { badge: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700",         row: "bg-amber-50 dark:bg-amber-950/30" },
  "Concluído":         { badge: "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700",   row: "bg-purple-50 dark:bg-purple-950/30" },
};

export default function RelatorioProcessos() {
  const { processos, isLoading, isError } = useProcessos();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [mostrarArquivados, setMostrarArquivados] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const toggleStatus = (s: string) => {
    setStatusFilter(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const processosFiltrados = useMemo(() => {
    return processos
      .filter(p => {
        if (!mostrarArquivados && p.arquivado) return false;
        if (statusFilter.length > 0 && !statusFilter.includes(p.status)) return false;
        const termo = searchTerm.toLowerCase();
        return (
          p.nomeCliente.toLowerCase().includes(termo) ||
          p.numeroProcesso.toLowerCase().includes(termo) ||
          p.status.toLowerCase().includes(termo)
        );
      })
      .sort((a, b) => new Date(a.dataPrazo).getTime() - new Date(b.dataPrazo).getTime());
  }, [processos, searchTerm, statusFilter, mostrarArquivados]);

  const handleExportarExcel = async () => {
    try {
      setIsExporting(true);
      const response = await fetch("/api/processos/exportar", { credentials: "include" });
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Relatório_Geral_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Excel gerado com sucesso!");
    } catch {
      toast.error("Falha ao exportar planilha.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <p className="text-destructive font-medium">Erro ao carregar processos.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background p-8 overflow-y-auto gap-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Relatório Geral
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral em lista de todos os processos cadastrados.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente, nº ou status..."
              className="pl-9 w-full bg-card"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={handleExportarExcel}
            disabled={isExporting}
            className="hidden sm:flex shrink-0"
          >
            {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Exportar XLS
          </Button>
        </div>
      </div>

      {/* Filtros de Status */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider shrink-0">Status:</span>
        {KANBAN_COLUMNS.map(status => {
          const style = STATUS_STYLES[status];
          const active = statusFilter.includes(status);
          return (
            <button
              key={status}
              onClick={() => toggleStatus(status)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full border font-medium transition-all duration-200 cursor-pointer",
                active
                  ? cn(style?.badge, "ring-2 ring-offset-1 ring-current shadow-md scale-105")
                  : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {status}
            </button>
          );
        })}
        <button
          onClick={() => setMostrarArquivados(v => !v)}
          className={cn(
            "text-xs px-3 py-1.5 rounded-full border font-medium transition-all duration-200 cursor-pointer",
            mostrarArquivados
              ? "bg-secondary text-secondary-foreground border-secondary ring-2 ring-offset-1 ring-secondary shadow-md scale-105"
              : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          📁 Incluir Arquivados
        </button>
        {(statusFilter.length > 0 || mostrarArquivados) && (
          <button
            onClick={() => { setStatusFilter([]); setMostrarArquivados(false); }}
            className="text-xs px-3 py-1.5 rounded-full border border-dashed border-destructive text-destructive hover:bg-destructive/10 transition-colors cursor-pointer flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Limpar filtros
          </button>
        )}
      </div>

      {/* Tabela */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
          <CardTitle className="text-lg">Lista de Processos</CardTitle>
          <CardDescription>
            Mostrando {processosFiltrados.length} processo{processosFiltrados.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[120px]">Data do Prazo</TableHead>
                  <TableHead className="min-w-[200px]">Nome do Cliente</TableHead>
                  <TableHead>Nº do Processo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Etiquetas / Honorários</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum processo encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  processosFiltrados.map((processo) => {
                    const style = STATUS_STYLES[processo.status];
                    return (
                      <TableRow
                        key={processo.id}
                        className={cn(
                          "cursor-pointer transition-colors hover:brightness-95",
                          processo.arquivado ? "opacity-60" : style?.row
                        )}
                      >
                        <TableCell className="font-medium">
                          {format(parseISO(processo.dataPrazo), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">{processo.nomeCliente}</div>
                          {processo.telefoneCliente && (
                            <div className="text-xs text-muted-foreground mt-0.5">{processo.telefoneCliente}</div>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {processo.numeroProcesso}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("font-semibold shadow-sm text-xs border", style?.badge)}
                          >
                            {processo.status}
                          </Badge>
                          {processo.arquivado && (
                            <Badge variant="secondary" className="ml-2 text-[10px]">Arquivado</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 items-start">
                            {processo.honorarios && (
                              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                {processo.honorarios}
                              </span>
                            )}
                            {processo.etiquetas && processo.etiquetas.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {processo.etiquetas.slice(0, 3).map(tag => (
                                  <Badge key={tag} className={`text-[9px] px-1 py-0 h-4 ${stringToColorClass(tag)}`} variant="secondary">
                                    {tag}
                                  </Badge>
                                ))}
                                {processo.etiquetas.length > 3 && (
                                  <span className="text-[10px] text-muted-foreground">+{processo.etiquetas.length - 3}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
