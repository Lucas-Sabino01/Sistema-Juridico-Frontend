import { useState } from "react";
import type { Processo } from "@/types/processo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar, Pencil, Archive, ArchiveRestore, Copy, Check, Eye, EyeOff } from "lucide-react";
import { format, parseISO, differenceInDays, isBefore, startOfDay } from "date-fns";
import { toast } from "sonner";
import { stringToColorClass } from "@/lib/utils";

interface ProcessCardProps {
  processo: Processo;
  onEdit: (p: Processo) => void;
  onArchive: (p: Processo) => void;
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

function getStatusBorderColor(status: string) {
  switch (status) {
    case "A Fazer": return "border-l-blue-500";
    case "Fazendo": return "border-l-purple-500";
    case "Feito ou realizado": return "border-l-amber-500";
    case "Aguardando Prazo": return "border-l-orange-500";
    case "Concluído": return "border-l-emerald-500";
    default: return "border-l-primary";
  }
}

function getStatusBackgroundColor(status: string) {
  switch (status) {
    case "A Fazer": return "bg-blue-500/15 dark:bg-blue-500/10 hover:bg-blue-500/10 dark:hover:bg-blue-500/20";
    case "Fazendo": return "bg-purple-500/15 dark:bg-purple-500/10 hover:bg-purple-500/10 dark:hover:bg-purple-500/20";
    case "Feito ou realizado": return "bg-amber-500/15 dark:bg-amber-500/10 hover:bg-amber-500/10 dark:hover:bg-amber-500/20";
    case "Aguardando Prazo": return "bg-orange-500/15 dark:bg-orange-500/10 hover:bg-orange-500/10 dark:hover:bg-orange-500/20";
    case "Concluído": return "bg-emerald-500/15 dark:bg-emerald-500/10 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20";
    default: return "bg-card hover:bg-accent/50";
  }
}

export function ProcessCard({ processo, onEdit, onArchive }: ProcessCardProps) {
  const [copiedCpf, setCopiedCpf] = useState(false);
  const [copiedGov, setCopiedGov] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const badge = getPrazoBadge(processo.dataPrazo);
  const formattedDate = format(parseISO(processo.dataPrazo), "dd/MM/yyyy");

  const handleCopyCpf = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (processo.cpfCliente) {
      navigator.clipboard.writeText(processo.cpfCliente);
      setCopiedCpf(true);
      toast.success("CPF copiado com sucesso!");
      setTimeout(() => setCopiedCpf(false), 2000);
    }
  };

  const handleCopyGov = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (processo.senhaGov) {
      navigator.clipboard.writeText(processo.senhaGov);
      setCopiedGov(true);
      toast.success("Senha Gov.br copiada com sucesso!");
      setTimeout(() => setCopiedGov(false), 2000);
    }
  };

  const togglePassword = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPassword(!showPassword);
  };

  return (
    <Card
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("processo-id", String(processo.id));
        e.dataTransfer.effectAllowed = "move";
      }}
      className={`group cursor-custom-grab active:cursor-custom-grabbing hover:shadow-md transition-all border-border shadow-sm rounded-lg border-l-4 ${getStatusBorderColor(processo.status)} ${getStatusBackgroundColor(processo.status)}`}
    >
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-bold text-base text-foreground leading-tight mb-1 truncate">{processo.nomeCliente}</p>
            <p className="text-sm text-muted-foreground font-mono truncate">{processo.numeroProcesso}</p>
            
            {(processo.cpfCliente || processo.senhaGov) && (
              <div className="mt-2.5 space-y-2.5 bg-muted/40 p-3 rounded-lg border border-border/60">
                {processo.cpfCliente && (
                  <div className="flex items-center justify-between gap-2 overflow-hidden">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-xs sm:text-sm uppercase font-bold text-muted-foreground tracking-wider shrink-0">CPF:</span>
                      <span className="text-sm sm:text-base font-mono text-foreground font-medium tracking-wide truncate">{processo.cpfCliente}</span>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors bg-background shadow-sm border border-border/50" 
                          onClick={handleCopyCpf}
                        >
                          {copiedCpf ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copiar CPF</TooltipContent>
                    </Tooltip>
                  </div>
                )}
                {processo.senhaGov && (
                  <div className="flex items-center justify-between gap-2 overflow-hidden">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-xs sm:text-sm uppercase font-bold text-muted-foreground tracking-wider shrink-0">Senha:</span>
                      <span className="text-sm sm:text-base font-mono text-foreground font-medium tracking-wider truncate">
                        {showPassword ? processo.senhaGov : "••••••••"}
                      </span>
                    </div>
                    <div className="flex items-center shrink-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors bg-background shadow-sm border border-border/50 rounded-r-none border-r-0" 
                            onClick={togglePassword}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{showPassword ? "Ocultar senha" : "Ver senha"}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors bg-background shadow-sm border border-border/50 rounded-l-none" 
                            onClick={handleCopyGov}
                          >
                            {copiedGov ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copiar Senha</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {processo.honorarios && (
              <div className="mt-2.5">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs sm:text-sm px-2.5 py-0.5 font-semibold">
                  Honorários: {processo.honorarios}
                </Badge>
              </div>
            )}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 -mt-1 -mr-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary cursor-pointer" onClick={() => onEdit(processo)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Editar</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={processo.arquivado ? "h-7 w-7 text-muted-foreground hover:text-primary cursor-pointer" : "h-7 w-7 text-muted-foreground hover:text-amber-500 cursor-pointer"} 
                  onClick={() => onArchive(processo)} 
                >
                  {processo.arquivado ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{processo.arquivado ? "Restaurar do Arquivo Morto" : "Arquivar"}</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Renderizar as etiquetas coloridas */}
        {processo.etiquetas && processo.etiquetas.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {processo.etiquetas.map((tag) => (
              <span 
                key={tag} 
                className={`text-xs sm:text-sm px-2.5 py-1 rounded-md font-medium ${stringToColorClass(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {processo.descricao && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed bg-muted/80 p-3 rounded-md border border-border mt-1">
            {processo.descricao}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border/60 mt-2">
          <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
          <Badge variant="outline" className={`text-xs sm:text-sm px-2.5 py-0.5 font-semibold ${badge.className}`}>
            {badge.label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}