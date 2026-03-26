import { useState, useRef, useEffect } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { UploadCloud, Clipboard, Check, FileText, Loader2, AlertTriangle, ShieldCheck, Info, Trash2, Play } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DadosAudiencia {
  data: string;
  horario: string;
  termino: string;
  duracao: string;
  autos: string;
  area: string;
  resultado: string;
  encaminhamento: string;
  confianca: number;
}

interface FicheiroProcessamento {
  id: string;
  file: File;
  status: 'pendente' | 'processando' | 'sucesso' | 'erro';
  dados?: DadosAudiencia;
}

export default function ExtratorAudiencia() {
  const [ficheiros, setFicheiros] = useState<FicheiroProcessamento[]>([]);
  const [isProcessandoLote, setIsProcessandoLote] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const temProcessadosOuNaLista = ficheiros.some(f => f.status === 'sucesso' || f.status === 'pendente');
      if (temProcessadosOuNaLista) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [ficheiros]);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const adicionarFicheiros = (novosFicheiros: FileList | File[]) => {
    const ficheirosValidos = Array.from(novosFicheiros).filter(f => f.type === "application/pdf");
    
    if (ficheirosValidos.length !== novosFicheiros.length) {
      toast.warning("Alguns ficheiros foram ignorados. Apenas PDFs são aceitos.");
    }

    setFicheiros(prev => {
      const ficheirosUnicos = ficheirosValidos.filter(novoFicheiro => 
        !prev.some(f => f.file.name === novoFicheiro.name && f.file.size === novoFicheiro.size)
      );
      
      if (ficheirosUnicos.length !== ficheirosValidos.length && ficheirosValidos.length > 0) {
        toast.info("Atenção: Alguns ficheiros foram ignorados porque já estavam na lista.");
      }

      if (ficheirosUnicos.length === 0) return prev;

      const novosItens: FicheiroProcessamento[] = ficheirosUnicos.map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        status: 'pendente'
      }));
      
      return [...prev, ...novosItens];
    });
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      adicionarFicheiros(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      adicionarFicheiros(e.target.files);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removerFicheiro = (id: string) => {
    setFicheiros(prev => prev.filter(f => f.id !== id));
  };

  const limparTudo = () => {
    setFicheiros([]);
  };

  const processarLote = async () => {
    const ficheirosPendentes = ficheiros.filter(f => f.status === 'pendente' || f.status === 'erro');
    
    if (ficheirosPendentes.length === 0) {
      toast.info("Não há novos ficheiros para processar.");
      return;
    }

    setIsProcessandoLote(true);
    let sucessoCount = 0;

    for (let i = 0; i < ficheirosPendentes.length; i++) {
      const item = ficheirosPendentes[i];
      setFicheiros(prev => prev.map(f => f.id === item.id ? { ...f, status: 'processando' } : f));

      try {
        const formData = new FormData();
        formData.append("file", item.file);

        const response = await fetch("/api/audiencias/extrair", {
          method: "POST",
          body: formData,
        });

        if (response.status === 429) {
          throw new Error("QUOTA_EXCEEDED");
        }

        if (!response.ok) throw new Error("Erro no servidor");

        const result = await response.json();
        
        let areaNormalizada = result.area || "Não informado";
        if (areaNormalizada !== "Não informado") {
          const areaUpper = areaNormalizada.toUpperCase();
          if (areaUpper.includes("FAMÍLIA") || areaUpper.includes("FAMILIA")) {
            areaNormalizada = "Família";
          } else if (areaUpper.includes("CÍVEL") || areaUpper.includes("CIVEL")) {
            areaNormalizada = "Cível";
          } else if (areaUpper.includes("FAZENDA") || areaUpper.includes("PUB")) {
            areaNormalizada = "Fazenda Pública";
          } else {
            areaNormalizada = areaNormalizada.charAt(0).toUpperCase() + areaNormalizada.slice(1).toLowerCase();
          }
        }
        
        const dadosExtraidos: DadosAudiencia = {
          data: result.data || "Não informado",
          horario: result.horario || "Não informado",
          termino: result.termino || "Não informado",
          duracao: result.duracao || "Não calculável",
          autos: result.autos || "Não informado",
          area: areaNormalizada,
          resultado: result.resultado || "Não informado",
          encaminhamento: result.encaminhamento || "Não informado",
          confianca: result.confianca ? parseInt(result.confianca) : 0
        };

        setFicheiros(prev => prev.map(f => f.id === item.id ? { ...f, status: 'sucesso', dados: dadosExtraidos } : f));
        sucessoCount++;
      } catch (error: any) {
        console.error("Erro no ficheiro", item.file.name, error);
        setFicheiros(prev => prev.map(f => f.id === item.id ? { ...f, status: 'erro' } : f));
        
        if (error.message === "QUOTA_EXCEEDED") {
          toast.error("Erro 429: Limite de Quota atingido! O Google acha que você está indo rápido demais. Aguarde alguns minutos antes de tentar o resto da lista.");
          break;
        }
      }

      if (i < ficheirosPendentes.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 4000));
      }
    }

    setIsProcessandoLote(false);
    
    if (sucessoCount > 0 || ficheirosPendentes.length === 1) {
      toast.success(`Processamento concluído! ${sucessoCount} de ${ficheirosPendentes.length} ficheiros extraídos.`);
    }
  };

  const copiarTexto = async (texto: string, campo: string, idArquivo: string) => {
    if (!texto || texto === "Não informado" || texto === "Não calculável") return;
    
    try {
      let bgColor = "transparent";
      let textoFormatado = texto;
      
      if (campo === "Área") {
        if (texto.includes("Família")) {
          bgColor = "#fcd5b8"; 
        } else if (texto.includes("Cível") || texto.includes("Civel")) {
          bgColor = "#e2efda"; 
        } else if (texto.includes("Fazenda") || texto.includes("FAZ")) {
          bgColor = "#fff2cc"; 
          textoFormatado = "FAZ . PUB";
        }
      }

      const html = `
        <meta charset="utf-8">
        <table style="border-collapse: collapse;">
          <tr>
            <td align="center" valign="middle" style="background-color: ${bgColor}; color: #000000; font-family: Calibri, sans-serif; font-size: 11pt; text-align: center; vertical-align: middle; border: none; mso-horizontal-align: center; mso-vertical-align: middle;">${textoFormatado}</td>
          </tr>
        </table>
      `;

      const blobHtml = new Blob([html], { type: "text/html" });
      const blobText = new Blob([textoFormatado], { type: "text/plain" });
      
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": blobHtml,
          "text/plain": blobText,
        })
      ]);
      
      const chaveUnica = `${idArquivo}-${campo}`;
      setCopiedField(chaveUnica);
      toast.success(`${campo} copiado com formatação!`);
      
      setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    } catch (error) {
      console.error("Erro no clipboard avançado, usando fallback:", error);
      navigator.clipboard.writeText(texto);
      setCopiedField(`${idArquivo}-${campo}`);
      toast.success(`${campo} copiado!`);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const getConfiancaEstilo = (valor: number) => {
    if (valor >= 90) return { color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-200", icon: <ShieldCheck className="h-4 w-4 text-emerald-600" /> };
    if (valor >= 70) return { color: "text-amber-600", bg: "bg-amber-100", border: "border-amber-200", icon: <Info className="h-4 w-4 text-amber-600" /> };
    return { color: "text-rose-600", bg: "bg-rose-100", border: "border-rose-200", icon: <AlertTriangle className="h-4 w-4 text-rose-600" /> };
  };

  const renderField = (label: string, value: string, idArquivo: string, alertIfMissing = false) => {
    const isMissing = alertIfMissing && (value === "Não informado" || value === "Não calculável");
    const isCopied = copiedField === `${idArquivo}-${label}`;
    
    let areaClasses = "";
    let displayValue = value;
    
    if (label === "Área" && !isMissing) {
      if (value.includes("Família")) {
        areaClasses = "bg-[#fcd5b8] border-[#f8cbad] text-[#000000]";
      } else if (value.includes("Cível") || value.includes("Civel")) {
        areaClasses = "bg-[#e2efda] border-[#c6e0b4] text-[#000000]";
      } else if (value.includes("Fazenda") || value.includes("FAZ")) {
        areaClasses = "bg-[#fff2cc] border-[#ffe699] text-[#000000]";
        displayValue = "FAZ . PUB";
      }
    }

    const baseClasses = isMissing 
      ? 'bg-amber-50/50 border-amber-200' 
      : areaClasses !== "" 
        ? areaClasses 
        : 'bg-card border-border hover:bg-muted/50';
    
    return (
      <div className={`flex items-center justify-between p-2 rounded-md border transition-colors text-sm ${baseClasses}`}>
        <div className="flex flex-col overflow-hidden">
          <span className={`text-xs font-medium ${areaClasses ? 'opacity-80' : 'text-muted-foreground'}`}>{label}</span>
          <span className={`font-semibold break-words ${isMissing ? 'text-amber-600 text-xs' : ''}`} title={displayValue}>
            {displayValue}
          </span>
        </div>
        <Button 
          variant="ghost" size="icon" 
          onClick={() => copiarTexto(value, label, idArquivo)}
          disabled={isMissing}
          className={`h-6 w-6 ml-1 shrink-0 cursor-pointer disabled:cursor-not-allowed transition-colors ${areaClasses ? 'text-black hover:bg-black/10' : 'text-muted-foreground hover:text-primary'}`}
          title={`Copiar ${label}`}
        >
          {isCopied ? <Check className="h-3 w-3 text-green-600" /> : <Clipboard className="h-3 w-3" />}
        </Button>
      </div>
    );
  };

  const pendentesCount = ficheiros.filter(f => f.status === 'pendente' || f.status === 'erro').length;
  const sucessoCount = ficheiros.filter(f => f.status === 'sucesso').length;

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Extrator em Lote (IA)</h1>
          <p className="text-muted-foreground">Arraste múltiplos PDFs para extrair os dados em sequência.</p>
        </div>
        
        {ficheiros.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={limparTudo} disabled={isProcessandoLote} className="cursor-pointer disabled:cursor-not-allowed">
              Limpar Lista
            </Button>
            <Button onClick={processarLote} disabled={isProcessandoLote || pendentesCount === 0} className="font-semibold cursor-pointer disabled:cursor-not-allowed">
              {isProcessandoLote ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A Processar Fila...</>
              ) : (
                <><Play className="mr-2 h-4 w-4" /> Iniciar Extração ({pendentesCount})</>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Área de Upload */}
      <Card 
        className={`relative overflow-hidden border-2 border-dashed shadow-sm transition-all duration-200 ${isDragging ? "border-primary" : "border-border hover:border-primary/50"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 z-10 bg-primary/95 flex flex-col items-center justify-center pointer-events-none text-primary-foreground animate-in fade-in duration-200">
            <div className="bg-background/20 p-4 rounded-full mb-3 shadow-lg">
              <UploadCloud className="h-12 w-12" />
            </div>
            <p className="text-2xl font-bold">Solte os ficheiros aqui!</p>
            <p className="text-primary-foreground/80 mt-1">Para adicionar à fila de extração</p>
          </div>
        )}
        <CardContent className="p-0">
          <div
            className={`flex flex-col items-center justify-center p-8 min-h-[150px] cursor-pointer transition-colors ${isDragging ? "opacity-0" : "opacity-100"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" multiple className="hidden" />
            <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-base font-medium">Arraste vários PDFs de audiência para aqui</p>
            <p className="text-sm text-muted-foreground mt-1">ou clique para selecionar do computador</p>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Resultados */}
      {ficheiros.length > 0 && (
        <div className="space-y-4">
          {/* Status e Progresso */}
          <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>Total: {ficheiros.length}</span>
                <span className="text-emerald-600 flex items-center gap-1"><Check className="h-4 w-4"/> {sucessoCount} Concluídos</span>
                {pendentesCount > 0 && <span>A aguardar: {pendentesCount}</span>}
              </div>
              <span className="text-xs font-bold">{Math.round(((ficheiros.length - pendentesCount) / ficheiros.length) * 100)}% Processado</span>
            </div>
            {/* Barra de Progresso Simples */}
            <div className="w-full h-2.5 rounded-full bg-secondary overflow-hidden border border-border/10">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out" 
                style={{width: `${((ficheiros.length - pendentesCount) / ficheiros.length) * 100}%`}}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {ficheiros.map((item, index) => (
              <Card key={item.id} className={`overflow-hidden transition-all ${item.status === 'processando' ? 'border-primary ring-1 ring-primary/20' : ''}`}>
                <div className="flex flex-col md:flex-row">
                  
                  {/* Cabeçalho Lateral do Ficheiro */}
                  <div className="bg-muted/30 p-4 border-b md:border-b-0 md:border-r border-border md:w-64 flex flex-col justify-between shrink-0">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs text-muted-foreground">PDF #{index + 1}</Badge>
                        <Button variant="ghost" size="icon" onClick={() => removerFicheiro(item.id)} disabled={isProcessandoLote} className="h-6 w-6 cursor-pointer disabled:cursor-not-allowed text-muted-foreground hover:text-rose-500" title="Remover ficheiro">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="font-medium text-sm truncate" title={item.file.name}>{item.file.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{(item.file.size / 1024).toFixed(1)} KB</p>
                    </div>

                    <div className="mt-4">
                      {item.status === 'pendente' && <Badge variant="secondary" className="w-full justify-center bg-secondary/50">Na Fila</Badge>}
                      {item.status === 'processando' && <Badge className="w-full justify-center bg-primary/20 text-primary hover:bg-primary/30"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> A extrair...</Badge>}
                      {item.status === 'erro' && <Badge variant="destructive" className="w-full justify-center">Falha</Badge>}
                      
                      {item.status === 'sucesso' && item.dados && (
                        <div className={`flex items-center justify-center gap-1 p-1.5 rounded-md border text-xs font-semibold mt-2 ${getConfiancaEstilo(item.dados.confianca).bg} ${getConfiancaEstilo(item.dados.confianca).color} ${getConfiancaEstilo(item.dados.confianca).border}`}>
                          {getConfiancaEstilo(item.dados.confianca).icon} Confiança: {item.dados.confianca}%
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Conteúdo Extraído */}
                  <div className="p-4 flex-1 bg-card">
                    {item.status === 'sucesso' && item.dados ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {renderField("Data", item.dados.data, item.id)}
                        {renderField("Início", item.dados.horario, item.id, true)}
                        {renderField("Fim", item.dados.termino, item.id, true)}
                        {renderField("Duração", item.dados.duracao, item.id, true)}
                        
                        <div className="md:col-span-2 lg:col-span-2">
                          {renderField("Autos", item.dados.autos, item.id)}
                        </div>
                        
                        {renderField("Área", item.dados.area, item.id)}
                        
                        <div className="md:col-span-2 lg:col-span-2">
                          {renderField("Resultado", item.dados.resultado, item.id)}
                        </div>
                        
                        <div className="md:col-span-2 lg:col-span-3">
                          {renderField("Encaminhamento", item.dados.encaminhamento, item.id)}
                        </div>
                      </div>
                    ) : item.status === 'processando' ? (
                      <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground min-h-[120px]">
                        <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary/50" />
                        <p className="text-sm">A analisar documento com IA...</p>
                      </div>
                    ) : item.status === 'erro' ? (
                      <div className="h-full w-full flex flex-col items-center justify-center text-rose-500 min-h-[120px]">
                        <AlertTriangle className="h-8 w-8 mb-2" />
                        <p className="text-sm">Ocorreu um erro ao processar este ficheiro.</p>
                      </div>
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground/50 min-h-[120px]">
                        <FileText className="h-8 w-8 mb-2" />
                        <p className="text-sm">A aguardar início do processamento...</p>
                      </div>
                    )}
                  </div>

                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}