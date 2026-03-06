import { useState } from "react";
import { useProcessos } from "@/hooks/useProcesso";
import type { Processo, StatusProcesso } from "@/types/processo";
import { KANBAN_COLUMNS } from "@/types/processo";
import { KanbanColumn } from "./KanbanColumn";
import { ProcessFormDialog } from "./ProcessFormDialog";
import { ArchiveConfirmDialog } from "./ArchiveConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Search } from "lucide-react";
import { stringToColorClass, cn } from "@/lib/utils";

export function KanbanBoard() {
  const { processos, isLoading, isError, create, update } = useProcessos();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProcesso, setEditingProcesso] = useState<Processo | null>(null);
  const [archivingProcesso, setArchivingProcesso] = useState<Processo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleDrop = (processoId: number, newStatus: StatusProcesso) => {
    const processo = processos.find((p) => p.id === processoId);
    if (processo && processo.status !== newStatus) {
      update({ ...processo, status: newStatus });
    }
  };

  const handleEdit = (p: Processo) => {
    setEditingProcesso(p);
    setFormOpen(true);
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
        <p className="text-destructive font-medium">Erro ao carregar processos. Verifique se a API (Java) está rodando.</p>
      </div>
    );
  }

  const uniqueTags = Array.from(
    new Set(
      processos
        .filter((p) => !p.arquivado)
        .flatMap((p) => p.etiquetas || [])
    )
  ).sort();

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const processosFiltrados = processos.filter((p) => {
    if (p.arquivado) return false;
    
    if (selectedTags.length > 0) {
      const etiquetasDoProcesso = p.etiquetas || [];
      const hasAllTags = selectedTags.every((tag) => etiquetasDoProcesso.includes(tag));
      if (!hasAllTags) return false;
    }
    
    const termo = searchTerm.toLowerCase();
    return (
      p.nomeCliente.toLowerCase().includes(termo) ||
      p.numeroProcesso.toLowerCase().includes(termo)
    );
  });

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] bg-background">
      
      <div className="flex flex-col px-8 py-5 border-b border-border bg-card shadow-sm z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Quadro Kanban</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {processosFiltrados.length} processo{processosFiltrados.length !== 1 ? "s" : ""} visíveis
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Barra de Busca*/}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente ou N°..."
                className="pl-9 w-[280px] bg-background border-border focus-visible:ring-primary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button onClick={() => { setEditingProcesso(null); setFormOpen(true); }} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all flexitems-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Novo</span>
            </Button>
          </div>
        </div>
        
        {uniqueTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4 px-1">
            <span className="text-sm uppercase font-bold text-muted-foreground mr-1 tracking-wider">Filtrar por Etiquetas:</span>
            {uniqueTags.map((tag) => {
              if (!tag) return null;
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "text-xs sm:text-sm px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer shadow-sm hover:scale-105 active:scale-95",
                    isSelected 
                      ? stringToColorClass(tag) 
                      : "border-border bg-background hover:bg-accent text-foreground/80 opacity-70 hover:opacity-100"
                  )}
                >
                  {tag}
                </button>
              );
            })}
            
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="text-xs sm:text-sm px-3 py-1.5 ml-2 rounded-full border border-dashed border-destructive text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Área das colunas */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar bg-amber-500/50 min-h-0 bg-transparent">
        <div className="flex gap-6 min-w-max h-full items-start">
          {KANBAN_COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              processos={processosFiltrados.filter((p: Processo) => p.status === status)}
              onDrop={handleDrop}
              onEdit={handleEdit}
              onDelete={setArchivingProcesso}
            />
          ))}
        </div>
      </div>

      <ProcessFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        processo={editingProcesso}
        onCreate={create}
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