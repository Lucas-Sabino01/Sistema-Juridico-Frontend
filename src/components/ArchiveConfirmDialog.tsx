import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Processo } from "@/types/processo";
import { Archive } from "lucide-react";

interface ArchiveConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  processo: Processo | null;
  onConfirm: () => void;
}

export function ArchiveConfirmDialog({ open, onOpenChange, processo, onConfirm }: ArchiveConfirmDialogProps) {
  if (!processo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background border-border shadow-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Archive className="h-5 w-5 text-blue-500" />
            Arquivar Processo
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2 leading-relaxed">
            Tem a certeza que deseja arquivar o processo de <strong>{processo.nomeCliente}</strong>?
            <br/><br/>
            Ele sairá do quadro principal de trabalho, mas continuará disponível no histórico para futuras consultas.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border text-foreground hover:bg-muted">
            Cancelar
          </Button>
          <Button onClick={() => { onConfirm(); onOpenChange(false); }} className="bg-blue-600 hover:bg-blue-700 text-white">
            Sim, Arquivar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}