import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Upload, FileSpreadsheet, Trash2, AlertTriangle } from "lucide-react";
import type { NovoProcesso, StatusProcesso } from "@/types/processo";

export default function ImportadorExcel() {
  const [rawData, setRawData] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewData, setPreviewData] = useState<NovoProcesso[]>([]);

  const handlePreview = () => {
    if (!rawData.trim()) {
      toast.error("Cole os dados do Excel primeiro!");
      return;
    }

    const linhas = rawData.split('\n');
    const processosExtraidos: NovoProcesso[] = [];

    linhas.forEach((linha) => {
      if (!linha.trim()) return;

      const colunas = linha.split('\t');

      let nameIndex = -1;
      let nome = "";
      
      for (let i = 0; i <= 3; i++) {
        if (colunas[i] && colunas[i].trim().length > 0) {
          nome = colunas[i].trim();
          nameIndex = i;
          break;
        }
      }

      if (!nome || nameIndex === -1 || nome.toUpperCase().includes("IDENTIFICAÇÃO") || nome.toUpperCase().includes("INICIO")) return;

      const govData = colunas[nameIndex + 1]?.trim() || "";
      const servico = colunas[nameIndex + 2]?.trim() || "";
      const honorarios = colunas[nameIndex + 3]?.trim() || "";
      
      let anotacaoFinal = "";
      for (let i = colunas.length - 1; i > nameIndex + 3; i--) {
        if (colunas[i] && colunas[i].trim().length > 0) {
          anotacaoFinal = colunas[i].trim().toLowerCase();
          break;
        }
      }

      let cpf = "";
      let senha = "";
      
      if (govData) {
        const cpfRegex = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/;
        const match = govData.match(cpfRegex);

        if (match) {
          cpf = match[0];
          senha = govData.replace(cpf, '').replace(/^[-/\s:]+/, '').trim();
        } else {
          cpf = govData;
        }
      }

      let status: StatusProcesso = "A Fazer";
      const etiquetas: string[] = ["Importado"];

      if (anotacaoFinal.includes("audiencia") || servico.toLowerCase().includes("audiencia")) {
        etiquetas.push("Audiência");
        status = "Fazendo";
      }
      if (anotacaoFinal.includes("prazo") || anotacaoFinal.includes("urgente")) {
        etiquetas.push("Urgente");
        status = "Aguardando Prazo";
      }
      if (anotacaoFinal.includes("ação") || anotacaoFinal.includes("digitar") || servico.toLowerCase().includes("petição")) {
        status = "Feito ou realizado";
      }

      const isArquivado = anotacaoFinal.includes("encerrado") || anotacaoFinal.includes("transitou");

      processosExtraidos.push({
        nomeCliente: nome,
        numeroProcesso: "Aguardando Nº",
        descricao: servico,
        honorarios: honorarios,
        cpfCliente: cpf,
        senhaGov: senha,
        status: isArquivado ? "Concluído" : status,
        dataPrazo: new Date().toISOString().split('T')[0],
        arquivado: isArquivado,
        etiquetas: etiquetas
      });
    });

    setPreviewData(processosExtraidos);
    toast.success(`${processosExtraidos.length} processos alinhados e reconhecidos!`);
  };

  const handleImportarParaJava = async () => {
    if (previewData.length === 0) return;
    setIsImporting(true);
    let sucesso = 0;
    let erro = 0;

    for (const processo of previewData) {
      try {
        const response = await fetch("/api/processos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(processo),
        });
        if (response.ok) sucesso++;
        else erro++;
      } catch (e) {
        erro++;
      }
    }

    setIsImporting(false);
    toast.success(`Importação Concluída: ${sucesso} inseridos, ${erro} falhas.`);
    if (erro === 0) {
      setRawData("");
      setPreviewData([]);
    }
  };

  const handleApagarTudo = async () => {
    if (!confirm("TEM A CERTEZA ABSOLUTA?\n\nIsto vai apagar TODOS os processos que já estão no banco de dados para você começar do zero.")) {
      return;
    }
    
    setIsDeleting(true);
    try {
      const res = await fetch("/api/processos", { credentials: "include" });
      const data = await res.json();
      
      let deletados = 0;
      for (const p of data) {
        await fetch(`/api/processos/${p.id}`, { method: "DELETE", credentials: "include" });
        deletados++;
      }
      
      toast.success(`${deletados} processos excluídos. O banco de dados está limpo!`);
    } catch (e) {
      toast.error("Erro ao limpar o banco de dados. Verifique se a API está rodando.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileSpreadsheet className="h-8 w-8 text-emerald-600" /> 
          Importador de Planilha Antiga
        </h1>
        <p className="text-muted-foreground mt-2">
          Cole os dados do Excel. A inteligência do sistema separa CPFs de Senhas e alinha as colunas de Honorários automaticamente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-card shadow-sm border-border">
          <CardHeader>
            <CardTitle>1. Colar Dados</CardTitle>
            <CardDescription>Cole os dados (Ctrl+V) exatamente como vêm do Excel.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={rawData}
              onChange={(e) => setRawData(e.target.value)}
              placeholder="Cole aqui (Ctrl+V)..."
              className="min-h-[300px] font-mono text-xs bg-muted/50 focus-visible:ring-emerald-500"
            />
            <Button onClick={handlePreview} className="w-full bg-slate-800 hover:bg-slate-700 text-white">
              Analisar Dados e Alinhar Colunas
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-border">
          <CardHeader>
            <CardTitle>2. Pré-visualização</CardTitle>
            <CardDescription>
              {previewData.length} processos prontos para entrar no sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/30 border border-border rounded-md p-4 min-h-[300px] max-h-[300px] overflow-y-auto">
              {previewData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center mt-20">Nenhum dado analisado ainda.</p>
              ) : (
                <ul className="space-y-3">
                  {previewData.map((p, i) => (
                    <li key={i} className="text-sm border-b border-border/50 pb-3 last:border-0">
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-foreground">{p.nomeCliente}</strong>
                        {p.etiquetas?.includes("Urgente") && <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded">URGENTE</span>}
                        {p.etiquetas?.includes("Audiência") && <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded">AUDIÊNCIA</span>}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <span className="text-[11px] text-muted-foreground truncate">
                          <strong>CPF:</strong> {p.cpfCliente || "-"}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate">
                          <strong>Senha:</strong> {p.senhaGov || "-"}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate">
                          <strong>Honorários:</strong> {p.honorarios || "-"}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate">
                          <strong>Fase:</strong> {p.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <Button 
              onClick={handleImportarParaJava} 
              disabled={previewData.length === 0 || isImporting} 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-bold"
            >
              {isImporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              {isImporting ? "A importar para o Java..." : "Salvar no Banco de Dados (Criptografar)"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* NOVA SECÇÃO: Limpeza do Banco de Dados */}
      <Card className="border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10">
        <CardHeader>
          <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Área de Limpeza (Cuidado!)
          </CardTitle>
          <CardDescription className="text-red-600/80 dark:text-red-300/80">
            Usou dados errados durante os testes? Limpe o banco de dados inteiro aqui antes de fazer a importação final.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={handleApagarTudo}
            disabled={isDeleting}
            className="w-full sm:w-auto font-bold"
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
            {isDeleting ? "A apagar tudo..." : "Apagar Todos os Processos Atuais"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}