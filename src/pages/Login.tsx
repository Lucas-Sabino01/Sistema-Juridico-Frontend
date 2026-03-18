import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Scale, Loader2, Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { BASE_URL } from '@/lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, senha: password }),
      });

      if (response.ok) {
        login();
        toast.success('Bem-vindo de volta!', { icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />});
        navigate('/');
        return;
      }

      if (response.status === 403) {
        try {
          const data = await response.json();
          if (data.acaoNecessaria === 'REDEFINIR_SENHA') {
            toast.warning('É necessário redefinir a sua senha.');
            navigate('/redefinir-senha', { state: { email } });
            return;
          }
        } catch (e) {
        }
      }

      toast.error('Credenciais inválidas ou erro na autenticação.');
      
    } catch (error) {
      toast.error('Erro de conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative selection:bg-primary/30">
      {/* Elementos Decorativos Modernos e Elegantes */}
      <div className="absolute top-0 w-full h-full overflow-hidden pointer-events-none flex justify-center">
        {/* Luz Superior */}
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[80%] max-w-4xl h-[50vh] bg-primary/10 rounded-[100%] blur-[120px] opacity-70" />
        {/* Ponto de Luz Lateral */}
        <div className="absolute bottom-[10%] -left-[10%] w-[40%] h-[40vh] bg-blue-500/10 rounded-full blur-[100px] opacity-60" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50vh] bg-emerald-500/10 rounded-full blur-[120px] opacity-40" />
        
        {/* Padrão de Grid (Opcional, dá um ar mais "tech") */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>
      
      <div className="absolute top-6 right-6 z-50">
        <ThemeSwitcher />
      </div>
      
      <Card className="w-full max-w-[420px] mx-4 bg-card/60 backdrop-blur-2xl border-white/10 dark:border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative z-10 overflow-hidden">
        {/* Detalhe Superior do Card */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        
        <CardHeader className="space-y-4 pt-10 pb-6 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mb-2 shadow-inner border border-primary/20 ring-4 ring-primary/5">
            <Scale className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
              Sistema Jurídico
            </CardTitle>
            <CardDescription className="text-sm font-medium text-muted-foreground/80">
              Acesso restrito à plataforma de gestão
            </CardDescription>
          </div>
        </CardHeader>
        
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-5 px-8">
            <div className="space-y-2">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground/60 group-focus-within:text-primary transition-colors duration-300" />
                </div>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="Seu E-mail" 
                  className="pl-11 h-12 text-[15px] bg-background/50 border-input hover:border-border focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-300 shadow-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground/60 group-focus-within:text-primary transition-colors duration-300" />
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Sua Senha" 
                  className="pl-11 h-12 text-[15px] bg-background/50 border-input hover:border-border focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-300 shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="px-8 pb-10 pt-2 flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-[2px] active:translate-y-0 cursor-pointer group relative overflow-hidden" 
              disabled={isLoading || !email || !password}
            >
              {/* Efeito de brilho no botão */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] animate-[shimmer_2s_infinite] group-hover:translate-x-[150%] transition-transform duration-1000" />
              
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Conectando...
                </>
              ) : (
                <span className="flex items-center gap-2">
                  Acessar Sistema
                  <ArrowRight className="h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
            
            <p className="text-xs text-center font-medium text-muted-foreground/60 mt-2">
              Ambiente Seguro e Monitorizado <ShieldCheck className="h-3 w-3 inline-block ml-0.5" />
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
