import { useState } from "react";
import { useProcessos } from "@/hooks/useProcesso";
import type { Processo, StatusProcesso } from "@/types/processo";
import { KANBAN_COLUMNS } from "@/types/processo";
import { KanbanColumn } from "./KanbanColumn";
import { ProcessFormDialog } from "./ProcessFormDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Search } from "lucide-react";

export function KanbanBoard() {
  const { processos, isLoading, isError, create, update, remove } = useProcessos();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProcesso, setEditingProcesso] = useState<Processo | null>(null);
  const [deletingProcesso, setDeletingProcesso] = useState<Processo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleNew = () => {
    setEditingProcesso(null);
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

  const processosFiltrados = processos.filter((p) => {
    const termo = searchTerm.toLowerCase();
    return (
      p.nomeCliente.toLowerCase().includes(termo) ||
      p.numeroProcesso.toLowerCase().includes(termo)
    );
  });

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] bg-background">
      
      <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-card shadow-sm z-10">
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

          <Button onClick={handleNew} className="gap-2 shadow-sm font-semibold">
            <Plus className="h-4 w-4" />
            Novo Processo
          </Button>
        </div>
      </div>

      {/* Área das colunas */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-8 py-6 bg-muted/30 custom-scrollbar">
        <div className="flex gap-6 min-w-max h-full items-start">
          {KANBAN_COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              processos={processosFiltrados.filter((p: Processo) => p.status === status)}
              onDrop={handleDrop}
              onEdit={handleEdit}
              onDelete={setDeletingProcesso}
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

      <DeleteConfirmDialog
        open={!!deletingProcesso}
        onOpenChange={(open) => !open && setDeletingProcesso(null)}
        processo={deletingProcesso}
        onConfirm={() => {
          if (deletingProcesso) {
            remove(deletingProcesso.id);
            setDeletingProcesso(null);
          }
        }}
      />
    </div>
  );
}