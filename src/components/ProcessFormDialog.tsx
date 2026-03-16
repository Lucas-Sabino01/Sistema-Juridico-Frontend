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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { X, Eye, EyeOff, Plus, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { stringToColorClass, cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
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
  const [status, setStatus] = useState<StatusProcesso>("A Fazer");
  
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [novaEtiqueta, setNovaEtiqueta] = useState("");

  const [honorarios, setHonorarios] = useState("");
  const [cpfCliente, setCpfCliente] = useState("");
  const [senhaGov, setSenhaGov] = useState("");
  
  const [showFormPassword, setShowFormPassword] = useState(false);

  useEffect(() => {
    if (open && processo) {
      setNomeCliente(processo.nomeCliente);
      setNumeroProcesso(processo.numeroProcesso);
      setDescricao(processo.descricao || "");
      setDataPrazo(processo.dataPrazo);
      setStatus(processo.status);
      setEtiquetas(processo.etiquetas || []); 
      setHonorarios(processo.honorarios || "");
      setCpfCliente(processo.cpfCliente || "");
      setSenhaGov(processo.senhaGov || "");
    } else if (open) {
      setNomeCliente("");
      setNumeroProcesso("");
      setDescricao("");
      setDataPrazo(new Date().toISOString().split('T')[0]);
      setStatus("A Fazer");
      setEtiquetas([]);
      setNovaEtiqueta("");
      setHonorarios("");
      setCpfCliente("");
      setSenhaGov("");
      setShowFormPassword(false);
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

  const addSugestaoEtiqueta = (tag: string) => {
    if (!etiquetas.includes(tag)) {
      setEtiquetas([...etiquetas, tag]);
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 9) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
    } else if (value.length > 6) {
      value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    } else if (value.length > 3) {
      value = value.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    }
    setCpfCliente(value);
  };

  const handleProcessoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumeroProcesso(e.target.value.replace(/\D/g, ""));
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
      honorarios,
      cpfCliente,
      senhaGov,
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
                onChange={handleProcessoChange}
                required
                placeholder="Ex: 000123456... (Somente números)"
                className="bg-muted/50 border-input focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpfCliente" className="text-foreground font-medium">CPF</Label>
              <Input
                id="cpfCliente"
                value={cpfCliente}
                onChange={handleCpfChange}
                placeholder="000.000.000-00"
                maxLength={14}
                className="bg-muted/50 border-input focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senhaGov" className="text-foreground font-medium">Senha Gov.br</Label>
              <div className="relative">
                <Input
                  id="senhaGov"
                  type={showFormPassword ? "text" : "password"}
                  value={senhaGov}
                  onChange={(e) => setSenhaGov(e.target.value)}
                  placeholder="Senha"
                  className="bg-muted/50 border-input pr-10 focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring shadow-sm"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                      onClick={() => setShowFormPassword(!showFormPassword)}
                    >
                      {showFormPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{showFormPassword ? "Ocultar senha" : "Ver senha"}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="honorarios" className="text-foreground font-medium">Honorários</Label>
            <Input
              id="honorarios"
              value={honorarios}
              onChange={(e) => setHonorarios(e.target.value)}
              placeholder="Ex: R$ 5.000,00 ou 30% no êxito"
              className="bg-muted/50 border-input focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring shadow-sm"
            />
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
              <Label className="text-foreground font-medium flex items-center gap-1">Data do Prazo<span className="text-destructive">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal bg-muted/50 border-input shadow-sm focus:ring-1 focus:ring-ring h-10 px-3 cursor-pointer",
                      !dataPrazo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-3 h-4 w-4 opacity-70" />
                    {dataPrazo ? format(parseISO(dataPrazo), "dd 'de' MMM, yyyy", { locale: ptBR }) : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50 pointer-events-auto shadow-xl border-border rounded-xl cursor-pointer" align="start">
                  <Calendar
                    mode="single"
                    selected={dataPrazo ? parseISO(dataPrazo) : undefined}
                    onSelect={(date) => setDataPrazo(date ? format(date, 'yyyy-MM-dd') : '')}
                    initialFocus
                    locale={ptBR} 
                    className="p-3 pointer-events-auto cursor-pointer"
                  />
                </PopoverContent>
              </Popover>
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

          <div className="space-y-3 bg-muted/40 p-4 rounded-lg border border-border shadow-sm">
            <div className="space-y-1">
              <Label htmlFor="etiquetas" className="text-foreground font-medium">
                Etiquetas <span className="text-muted-foreground font-normal text-xs ml-1">(Pressione Enter para adicionar)</span>
              </Label>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground mr-1 self-center">Sugestões:</span>
                {["Urgente", "Trabalhista", "Cível", "Pendente Docs", "Revisar"].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addSugestaoEtiqueta(tag)}
                    className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" /> {tag}
                  </button>
                ))}
              </div>
            </div>
            
            {etiquetas.length > 0 && (
              <div className="flex flex-wrap gap-1.5 bg-background p-2 rounded-md border border-border/50">
                {etiquetas.map((tag) => (
                  <Badge key={tag} variant="secondary" className={`flex items-center gap-1 font-medium px-2 py-0.5 shadow-sm ${stringToColorClass(tag)}`}>
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoverEtiqueta(tag)}
                      className="ml-1 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 p-0.5 transition-colors cursor-pointer"
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
              placeholder="Digite uma nova etiqueta e pressione Enter..."
              className="text-sm bg-background border-input focus-visible:ring-1 focus-visible:ring-ring shadow-sm"
            />
          </div>

          <DialogFooter className="pt-4 border-t border-border mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer">
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer">
              {isEditing ? "Salvar Alterações" : "Criar Processo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}