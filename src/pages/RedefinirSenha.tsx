import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Lock, Mail, KeyRound, ShieldAlert, ArrowRight } from 'lucide-react';

export default function RedefinirSenha() {
  const location = useLocation();
  const emailInicial = location.state?.email || '';

  const [email, setEmail] = useState(emailInicial);
  const [senhaTemporaria, setSenhaTemporaria] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRedefinir = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (novaSenha !== confirmarSenha) {
      toast.error('As senhas não coincidem. Tente novamente.');
      return;
    }

    if (novaSenha.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/redefinir-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          email, 
          senhaTemporaria, 
          novaSenha 
        }),
      });

      if (response.ok) {
        toast.success('Senha atualizada com sucesso!');
        navigate('/');
      } else {
        const data = await response.json().catch(() => null);
        toast.error(data?.mensagem || 'Erro ao redefinir a senha. Verifique a senha temporária.');
      }
    } catch (error) {
      toast.error('Erro de conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative selection:bg-primary/30">
      <div className="absolute inset-0 bg-background" />
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[70%] max-w-2xl h-[40vh] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <Card className="w-full max-w-[440px] mx-4 bg-card/80 backdrop-blur-2xl border-white/10 shadow-2xl relative z-10">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
        
        <CardHeader className="space-y-3 pt-10 pb-6 text-center">
          <div className="mx-auto w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-2 ring-1 ring-amber-500/30 shadow-inner">
            <KeyRound className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Redefinição de Senha</CardTitle>
          <CardDescription className="text-sm px-4">
            Para sua segurança, é necessário definir uma nova senha permanente antes de continuar.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleRedefinir}>
          <CardContent className="space-y-4 px-8">
            <div className="space-y-1">
              <label className="text-[13px] font-medium text-muted-foreground ml-1">E-mail</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-muted-foreground/60 group-focus-within:text-foreground transition-colors" />
                </div>
                <Input 
                  type="email"
                  className="pl-10 h-11 bg-background/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={!!emailInicial}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[13px] font-medium text-muted-foreground ml-1">Senha Temporária / Atual</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <ShieldAlert className="h-4 w-4 text-amber-500/70 group-focus-within:text-amber-500 transition-colors" />
                </div>
                <Input 
                  type="password"
                  placeholder="Aquela que recebeu ou a antiga" 
                  className="pl-10 h-11 bg-background/50 focus-visible:ring-amber-500/30 focus-visible:border-amber-500"
                  value={senhaTemporaria}
                  onChange={(e) => setSenhaTemporaria(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-1 pt-2">
              <label className="text-[13px] font-medium text-muted-foreground ml-1">Nova Senha</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-muted-foreground/60 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <Input 
                  type="password" 
                  placeholder="Mínimo de 6 caracteres" 
                  className="pl-10 h-11 bg-background/50 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[13px] font-medium text-muted-foreground ml-1">Confirmar Nova Senha</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-muted-foreground/60 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <Input 
                  type="password" 
                  placeholder="Repita a nova senha" 
                  className="pl-10 h-11 bg-background/50 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="px-8 pb-10 pt-4 flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full h-11 text-sm font-semibold transition-all hover:-translate-y-[1px] cursor-pointer" 
              disabled={isLoading || !email || !senhaTemporaria || !novaSenha || !confirmarSenha}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <span className="flex items-center gap-2">
                  Confirmar e Entrar
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
            <Button variant="ghost" className="w-full h-10 text-xs" onClick={() => navigate('/login')} type="button">
              Voltar ao Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
