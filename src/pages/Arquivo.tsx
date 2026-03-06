import { useState } from "react";
import { useProcessos } from "@/hooks/useProcesso";
import type { Processo } from "@/types/processo";
import { ProcessCard } from "@/components/ProcessCard";
import { ProcessFormDialog } from "@/components/ProcessFormDialog";
import { Input } from "@/components/ui/input";
import { Loader2, Search, ArchiveRestore } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Arquivo() {
  const { processos, isLoading, isError, update } = useProcessos();
  const [formOpen, setFormOpen] = useState(false);
  const [editingProcesso, setEditingProcesso] = useState<Processo | null>(null);
  const [restoringProcesso, setRestoringProcesso] = useState<Processo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleEdit = (p: Processo) => {
    setEditingProcesso(p);
    setFormOpen(true);
  };

  const handleRestore = (p: Processo) => {
    setRestoringProcesso(p);
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

  const processosArquivados = processos.filter((p) => {
    if (!p.arquivado) return false;
    
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
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Arquivo Morto</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {processosArquivados.length} processo{processosArquivados.length !== 1 ? "s" : ""} arquivados
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente ou N°..."
              className="pl-9 w-[280px] bg-background border-border focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 bg-muted/30 custom-scrollbar">
        {processosArquivados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <ArchiveRestore className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-foreground">Nenhum processo arquivado</h3>
            <p className="text-sm text-muted-foreground mt-1">Os processos arquivados aparecerão aqui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {processosArquivados.map((p) => (
              <ProcessCard 
                key={p.id} 
                processo={p} 
                onEdit={handleEdit} 
                onArchive={handleRestore}
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

      <AlertDialog open={!!restoringProcesso} onOpenChange={(open) => !open && setRestoringProcesso(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurar processo?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja restaurar o processo de <strong>{restoringProcesso?.nomeCliente}</strong> para o quadro Kanban?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (restoringProcesso) {
                  update({ ...restoringProcesso, arquivado: false });
                  setRestoringProcesso(null);
                }
              }} 
              className="bg-primary hover:bg-primary/90 cursor-pointer"
            >
              Restaurar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
