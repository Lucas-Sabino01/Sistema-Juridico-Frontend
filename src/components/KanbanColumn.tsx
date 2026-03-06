import { useState } from "react";
import type { Processo, StatusProcesso } from "@/types/processo";
import { ProcessCard } from "./ProcessCard";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  status: StatusProcesso;
  processos: Processo[];
  onDrop: (processoId: number, newStatus: StatusProcesso) => void;
  onEdit: (p: Processo) => void;
  onDelete: (p: Processo) => void;
}

export function KanbanColumn({ status, processos, onDrop, onEdit, onDelete }: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-col min-w-[320px] w-[320px] rounded-xl transition-colors border h-full max-h-full",
        isDragOver ? "bg-accent border-primary/30 ring-2 ring-primary/20" : "bg-muted/50 border-border"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const id = Number(e.dataTransfer.getData("processo-id"));
        if (id) onDrop(id, status);
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 mb-3">
        <h3 className="text-base font-bold text-foreground">{status}</h3>
        <span className="text-sm bg-secondary text-secondary-foreground font-bold rounded-full px-2.5 py-0.5">
          {processos.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-3 custom-scrollbar">
        {processos.map((p) => (
          <ProcessCard key={p.id} processo={p} onEdit={onEdit} onArchive={onDelete} />
        ))}
      </div>
    </div>
  );
}