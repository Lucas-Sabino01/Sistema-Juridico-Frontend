import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Palette, Type, Moon, Bell, Monitor, CheckCircle2, LayoutDashboard } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

function CustomSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        checked ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function Configuracoes() {
  const { tema, setTema, fonte, setFonte, altoContraste, setAltoContraste } = useTheme();
  
  const [notificacaoPrazo, setNotificacaoPrazo] = useState("3");
  const [ocultarConcluidos, setOcultarConcluidos] = useState(true);
  
  const [salvoComSucesso, setSalvoComSucesso] = useState(false);

  const getTextSize = (baseSize: "xl" | "base" | "sm") => {
    if (baseSize === "xl") return fonte === "pequena" ? "text-lg" : fonte === "grande" ? "text-2xl" : "text-xl";
    if (baseSize === "base") return fonte === "pequena" ? "text-sm" : fonte === "grande" ? "text-lg" : "text-base";
    if (baseSize === "sm") return fonte === "pequena" ? "text-xs" : fonte === "grande" ? "text-base" : "text-sm";
    return "";
  };

  const handleSalvar = () => {
    setSalvoComSucesso(true);
    setTimeout(() => setSalvoComSucesso(false), 3000);
  };

  return (
    <div className="flex flex-col h-full bg-background p-8 overflow-y-auto custom-scrollbar">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-2">Personalize a aparência e o comportamento do sistema.</p>
      </div>

      <div className="grid gap-8 max-w-4xl">
        
        {/* Aparência */}
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 text-foreground ${getTextSize("xl")}`}>
              <Palette className="h-5 w-5 text-primary" />
              Aparência e Acessibilidade
            </CardTitle>
            <CardDescription>Ajuste o visual para não cansar a vista durante o dia.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className={`font-semibold text-foreground ${getTextSize("base")}`}>Tema do Sistema</Label>
                <p className={`text-muted-foreground ${getTextSize("sm")}`}>Escolha entre o modo claro e o modo noturno.</p>
              </div>
              <Select value={tema} onValueChange={(v: any) => setTema(v)}>
                <SelectTrigger className="w-[180px] bg-card text-foreground">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claro"><div className="flex items-center gap-2"><Monitor size={16}/> Claro</div></SelectItem>
                  <SelectItem value="escuro"><div className="flex items-center gap-2"><Moon size={16}/> Escuro</div></SelectItem>
                </SelectContent>
              </Select>
            </div>

            <hr className="border-border" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className={`font-semibold text-foreground ${getTextSize("base")}`}>Tamanho da Fonte</Label>
                <p className={`text-muted-foreground ${getTextSize("sm")}`}>Aumente as letras se preferir uma leitura mais confortável.</p>
              </div>
              <Select value={fonte} onValueChange={(v: any) => setFonte(v)}>
                <SelectTrigger className="w-[180px] bg-card text-foreground">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pequena"><div className="flex items-center gap-2"><Type size={14}/> Pequena</div></SelectItem>
                  <SelectItem value="normal"><div className="flex items-center gap-2"><Type size={16}/> Normal</div></SelectItem>
                  <SelectItem value="grande"><div className="flex items-center gap-2"><Type size={18}/> Grande</div></SelectItem>
                </SelectContent>
              </Select>
            </div>

            <hr className="border-border" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className={`font-semibold text-foreground ${getTextSize("base")}`}>Modo de Alto Contraste</Label>
                <p className={`text-muted-foreground ${getTextSize("sm")}`}>Aumenta a diferença de cores entre os fundos e os textos.</p>
              </div>
              <CustomSwitch checked={altoContraste} onChange={setAltoContraste} />
            </div>

          </CardContent>
        </Card>

        {/* Preferências do Kanban */}
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 text-foreground ${getTextSize("xl")}`}>
              <LayoutDashboard className="h-5 w-5 text-primary" />
              Preferências do Quadro (Kanban)
            </CardTitle>
            <CardDescription>Configure como os processos são exibidos para você.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className={`font-semibold text-foreground ${getTextSize("base")}`}>Ocultar Processos Concluídos</Label>
                <p className={`text-muted-foreground ${getTextSize("sm")}`}>Não mostra os processos finalizados no calendário e no quadro.</p>
              </div>
              <CustomSwitch checked={ocultarConcluidos} onChange={setOcultarConcluidos} />
            </div>

            <hr className="border-border" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className={`font-semibold text-foreground ${getTextSize("base")}`}>Alerta de Prazos</Label>
                <p className={`text-muted-foreground ${getTextSize("sm")}`}>Com quantos dias de antecedência o cartão deve ficar amarelo?</p>
              </div>
              <Select value={notificacaoPrazo} onValueChange={setNotificacaoPrazo}>
                <SelectTrigger className="w-[180px] bg-card text-foreground">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1"><div className="flex items-center gap-2"><Bell size={16} className="text-amber-500"/> 1 Dia antes</div></SelectItem>
                  <SelectItem value="3"><div className="flex items-center gap-2"><Bell size={16} className="text-amber-500"/> 3 Dias antes</div></SelectItem>
                  <SelectItem value="7"><div className="flex items-center gap-2"><Bell size={16} className="text-amber-500"/> 1 Semana antes</div></SelectItem>
                </SelectContent>
              </Select>
            </div>

          </CardContent>
        </Card>

        {/* Botão de Salvar */}
        <div className="flex justify-end pt-4 pb-8">
          <div className="flex items-center gap-4">
            {salvoComSucesso && (
              <span className="text-emerald-500 flex items-center gap-1 font-medium animate-in fade-in slide-in-from-right-4">
                <CheckCircle2 size={18} />
                Preferências salvas!
              </span>
            )}
            <Button onClick={handleSalvar} className="bg-primary hover:bg-primary/90 px-8 text-primary-foreground shadow-sm font-semibold rounded-full">
              Salvar Configurações
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}