import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { Loader2, Users, Shield, UserPlus, Mail, User } from 'lucide-react';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  papel: string;
}

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [papel, setPapel] = useState('ADVOGADO');

  const fetchUsuarios = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/usuarios', {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      } else {
        toast.error('Erro ao buscar utilizadores. Permissão Negada?');
      }
    } catch (e) {
      toast.error('Erro de conexão ao buscar utilizadores.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleCriarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !papel) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nome, email, papel }),
      });

      if (response.ok) {
        toast.success(`Usuário ${nome} criado com sucesso! E-mail com senha temporária enviado.`);
        setNome('');
        setEmail('');
        setPapel('ADVOGADO');
        fetchUsuarios();
      } else {
        const data = await response.json().catch(() => null);
        toast.error(data?.mensagem || 'Erro ao criar o usuário. E-mail já existe?');
      }
    } catch (e) {
      toast.error('Erro de conexão com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] bg-background overflow-y-auto w-full">
      <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-card shadow-sm z-10 sticky top-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Gestão da Equipe
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Adicione advogados, secretariado ou administradores ao sistema. (Área Exclusiva)
          </p>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulário de Criação (Coluna da Esquerda em Desktop) */}
        <div className="col-span-1 lg:col-span-1">
          <Card className="shadow-sm border-border sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserPlus className="h-5 w-5 text-emerald-500" />
                Novo Integrante
              </CardTitle>
              <CardDescription>O sistema gerará uma senha automaticamente e enviará por e-mail.</CardDescription>
            </CardHeader>
            <form onSubmit={handleCriarUsuario}>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">Nome Completo</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Ex: João Silva" 
                      className="pl-9 bg-muted/50" 
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">E-mail</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="email"
                      placeholder="joao@escritorio.com" 
                      className="pl-9 bg-muted/50" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">Nível de Acesso (Papel)</label>
                  <Select value={papel} onValueChange={setPapel} required>
                    <SelectTrigger className="bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Selecione..." />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Administrador (Total Acesso)</SelectItem>
                      <SelectItem value="ADVOGADO">Advogado (Gestão de Processos)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full font-semibold shadow-sm"
                  disabled={isSubmitting || !nome || !email}
                >
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adicionando...</>
                  ) : (
                    "Convidar p/ Equipe"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Listagem de Usuários (Colunas da Direita em Desktop) */}
        <div className="col-span-1 lg:col-span-2">
          <Card className="shadow-sm border-border min-h-[500px] flex flex-col">
            <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
              <CardTitle className="text-lg">Equipe Atual ({usuarios.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-12 text-muted-foreground h-full">
                  <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                  A carregar a lista de equipe...
                </div>
              ) : usuarios.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  Nenhum utilizador encontrado no sistema.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {usuarios.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">
                          {u.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground leading-tight">{u.nome}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{u.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={u.papel === 'ADMIN' ? 'default' : 'secondary'} 
                          className="font-semibold uppercase text-[10px] tracking-wider"
                        >
                          {u.papel}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
