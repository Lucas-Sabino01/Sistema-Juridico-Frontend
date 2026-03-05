import type { Processo } from "@/types/processo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import { format, parseISO, differenceInDays, isBefore, startOfDay } from "date-fns";

interface ProcessCardProps {
  processo: Processo;
  onEdit: (p: Processo) => void;
  onDelete: (p: Processo) => void;
}

function getPrazoBadge(dataPrazo: string) {
  const today = startOfDay(new Date());
  const prazo = startOfDay(parseISO(dataPrazo));
  const diff = differenceInDays(prazo, today);

  if (isBefore(prazo, today)) {
    return { label: "Atrasado", className: "bg-destructive/10 text-destructive border-destructive/20" };
  }
  if (diff <= 3) {
    return { label: `${diff}d restante${diff !== 1 ? "s" : ""}`, className: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
  }
  return { label: `${diff}d restantes`, className: "bg-secondary text-secondary-foreground border-border" };
}

function stringToColorClass(str: string) {
  const colors = [
    "bg-indigo-100 text-indigo-700",
    "bg-emerald-100 text-emerald-700",
    "bg-fuchsia-100 text-fuchsia-700",
    "bg-cyan-100 text-cyan-700",
    "bg-rose-100 text-rose-700",
    "bg-orange-100 text-orange-700"
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  
  // Se for urgente, fica sempre vermelho escuro
  if (str.toLowerCase().includes("urgente")) {
    return "bg-red-500 text-white font-bold";
  }
  
  return colors[index];
}

export function ProcessCard({ processo, onEdit, onDelete }: ProcessCardProps) {
  const badge = getPrazoBadge(processo.dataPrazo);
  const formattedDate = format(parseISO(processo.dataPrazo), "dd/MM/yyyy");

  return (
    <Card
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("processo-id", String(processo.id));
        e.dataTransfer.effectAllowed = "move";
      }}
      className="group cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary/40 transition-all bg-card border-border shadow-sm rounded-lg border-l-4 border-l-primary"
    >
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sm text-foreground leading-tight mb-1 truncate">{processo.nomeCliente}</p>
            <p className="text-xs text-muted-foreground font-mono truncate">{processo.numeroProcesso}</p>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 -mt-1 -mr-2">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => onEdit(processo)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onDelete(processo)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Renderizar as etiquetas coloridas */}
        {processo.etiquetas && processo.etiquetas.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {processo.etiquetas.map((tag) => (
              <span 
                key={tag} 
                className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${stringToColorClass(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {processo.descricao && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed bg-muted p-2 rounded-md border border-border mt-1">
            {processo.descricao}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border mt-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formattedDate}</span>
          </div>
          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-semibold ${badge.className}`}>
            {badge.label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}