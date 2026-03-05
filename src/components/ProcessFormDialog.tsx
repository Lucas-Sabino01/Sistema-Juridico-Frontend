import { useState, useEffect } from "react";
import type { Processo, NovoProcesso, StatusProcesso } from "@/types/processo";
import { KANBAN_COLUMNS } from "@/types/processo";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface ProcessFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  processo: Processo | null;
  onCreate: (p: NovoProcesso) => void;
  onUpdate: (p: Processo) => void;
}

export function ProcessFormDialog({ open, onOpenChange, processo, onCreate, onUpdate }: ProcessFormDialogProps) {
  const isEditing = !!processo;

  const [nomeCliente, setNomeCliente] = useState("");
  const [numeroProcesso, setNumeroProcesso] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataPrazo, setDataPrazo] = useState("");
  const [status, setStatus] = useState<StatusProcesso>("Triagem");
  
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [novaEtiqueta, setNovaEtiqueta] = useState("");

  useEffect(() => {
    if (open && processo) {
      setNomeCliente(processo.nomeCliente);
      setNumeroProcesso(processo.numeroProcesso);
      setDescricao(processo.descricao || "");
      setDataPrazo(processo.dataPrazo);
      setStatus(processo.status);
      setEtiquetas(processo.etiquetas || []); 
    } else if (open) {
      setNomeCliente("");
      setNumeroProcesso("");
      setDescricao("");
      setDataPrazo(new Date().toISOString().split('T')[0]);
      setStatus("Triagem");
      setEtiquetas([]);
      setNovaEtiqueta("");
    }
  }, [open, processo]);

  const handleAdicionarEtiqueta = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && novaEtiqueta.trim() !== "") {
      e.preventDefault(); 
      const tag = novaEtiqueta.trim();
      if (!etiquetas.includes(tag)) {
        setEtiquetas([...etiquetas, tag]);
      }
      setNovaEtiqueta("");
    }
  };

  const handleRemoverEtiqueta = (tagToRemove: string) => {
    setEtiquetas(etiquetas.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dadosFormulario = {
      nomeCliente,
      numeroProcesso,
      descricao,
      dataPrazo,
      status,
      etiquetas, 
    };

    if (isEditing && processo) {
      onUpdate({ ...dadosFormulario, id: processo.id });
    } else {
      onCreate(dadosFormulario);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background border-border shadow-2xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground font-bold">
            {isEditing ? "Editar Processo" : "Novo Processo"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-foreground font-medium">Nome do Cliente</Label>
              <Input
                id="nome"
                value={nomeCliente}
                onChange={(e) => setNomeCliente(e.target.value)}
                required
                placeholder="Ex: João da Silva"
                className="bg-muted/50 border-input focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero" className="text-foreground font-medium">Nº do Processo</Label>
              <Input
                id="numero"
                value={numeroProcesso}
                onChange={(e) => setNumeroProcesso(e.target.value)}
                required
                placeholder="Ex: 0001234-56..."
                className="bg-muted/50 border-input focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao" className="text-foreground font-medium">Descrição / Anotações</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Resumo do caso..."
              className="resize-none h-20 bg-muted/50 border-input focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prazo" className="text-foreground font-medium">Data do Prazo</Label>
              <Input
                id="prazo"
                type="date"
                value={dataPrazo}
                onChange={(e) => setDataPrazo(e.target.value)}
                required
                className="bg-muted/50 border-input focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-foreground font-medium">Fase Atual (Kanban)</Label>
              <Select value={status} onValueChange={(value: StatusProcesso) => setStatus(value)}>
                <SelectTrigger id="status" className="bg-muted/50 border-input focus:ring-1 focus:ring-ring shadow-sm">
                  <SelectValue placeholder="Selecione a fase" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {KANBAN_COLUMNS.map((col) => (
                    <SelectItem key={col} value={col}>{col}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 bg-muted/30 p-4 rounded-lg border border-border shadow-sm">
            <Label htmlFor="etiquetas" className="text-foreground font-medium">
              Etiquetas <span className="text-muted-foreground font-normal">(Pressione Enter para adicionar)</span>
            </Label>
            
            {etiquetas.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {etiquetas.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-colors shadow-sm">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoverEtiqueta(tag)}
                      className="ml-1 rounded-full hover:bg-primary/30 hover:text-primary-foreground p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            
            <Input
              id="etiquetas"
              value={novaEtiqueta}
              onChange={(e) => setNovaEtiqueta(e.target.value)}
              onKeyDown={handleAdicionarEtiqueta}
              placeholder="Ex: Urgente, Trabalhista, Aguardando Cliente..."
              className="text-sm bg-background border-input focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring shadow-sm outline-none"
            />
          </div>

          <DialogFooter className="pt-4 border-t border-border mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground">
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
              {isEditing ? "Salvar Alterações" : "Criar Processo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}