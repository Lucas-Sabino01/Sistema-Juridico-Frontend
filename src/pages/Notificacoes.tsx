import { useState } from "react";
import { useProcessos } from "@/hooks/useProcesso";
import type { Processo } from "@/types/processo";
import { ProcessCard } from "@/components/ProcessCard";
import { ProcessFormDialog } from "@/components/ProcessFormDialog";
import { Loader2, BellRing, CheckCircle2 } from "lucide-react";
import { isBefore, startOfDay, differenceInDays, parseISO } from "date-fns";
import { ArchiveConfirmDialog } from "@/components/ArchiveConfirmDialog";

export default function Notificacoes() {
  const { processos, isLoading, isError, update } = useProcessos();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProcesso, setEditingProcesso] = useState<Processo | null>(null);
  const [archivingProcesso, setArchivingProcesso] = useState<Processo | null>(null);

  const handleEdit = (p: Processo) => {
    setEditingProcesso(p);
    setFormOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-theme(spacing.16))]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-theme(spacing.16))]">
        <p className="text-destructive font-medium">Erro ao carregar dados.</p>
      </div>
    );
  }

  const ativos = processos.filter(p => !p.arquivado && p.status !== "Concluído");
  const hoje = startOfDay(new Date());
  
  const notificacoes = ativos.filter(p => {
    if ((p.etiquetas || []).some(tag => tag && tag.toLowerCase().includes("urgente"))) return true;
    
    if (!p.dataPrazo) return false;
    const dataPrazoObj = startOfDay(parseISO(p.dataPrazo));
    const isLate = isBefore(dataPrazoObj, hoje);
    const diffDays = differenceInDays(dataPrazoObj, hoje);
    
    return isLate || diffDays <= 3;
  }).sort((a, b) => {
    const aUrgente = (a.etiquetas || []).some(t => t && t.toLowerCase().includes("urgente"));
    const bUrgente = (b.etiquetas || []).some(t => t && t.toLowerCase().includes("urgente"));
    if (aUrgente && !bUrgente) return -1;
    if (!aUrgente && bUrgente) return 1;

    if (!a.dataPrazo) return 1;
    if (!b.dataPrazo) return -1;
    return new Date(a.dataPrazo).getTime() - new Date(b.dataPrazo).getTime();
  });

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] bg-background overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-card shadow-sm z-10 sticky top-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <BellRing className="h-6 w-6 text-destructive" />
            Central de Notificações
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Processos com prazos urgentes, vencendo nos próximos 3 dias ou atrasados.
          </p>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto w-full">
        {notificacoes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4 opacity-80" />
            <h3 className="text-xl font-bold text-foreground">Tudo em dia!</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              Você não possui processos com prazos atrasados ou urgentes no momento. Bom trabalho!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {notificacoes.map((p) => (
              <ProcessCard 
                key={p.id} 
                processo={p} 
                onEdit={handleEdit} 
                onArchive={setArchivingProcesso} 
              />
            ))}
          </div>
        )}
      </div>

      <ProcessFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        processo={editingProcesso}
        onCreate={() => {}} 
        onUpdate={update}
      />

      <ArchiveConfirmDialog
        open={!!archivingProcesso}
        onOpenChange={(open) => !open && setArchivingProcesso(null)}
        processo={archivingProcesso}
        onConfirm={() => {
          if (archivingProcesso) {
            update({ ...archivingProcesso, arquivado: true });
            setArchivingProcesso(null);
          }
        }}
      />
    </div>
  );
}
