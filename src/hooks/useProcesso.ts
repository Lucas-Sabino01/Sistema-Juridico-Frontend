import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Processo, ProcessoCreate } from "@/types/processo";
import { toast } from "sonner";
import { BASE_URL } from "@/lib/api";

const API_URL = `${BASE_URL}/api/processos`;

async function fetchProcessos(): Promise<Processo[]> {
  const res = await fetch(API_URL, { credentials: 'include' });
  if (res.status === 401 || res.status === 403) {
    window.location.href = '/login';
    throw new Error('Não autorizado');
  }
  if (!res.ok) throw new Error("Erro ao carregar processos");
  return res.json();
}

async function createProcesso(data: ProcessoCreate): Promise<Processo> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (res.status === 401 || res.status === 403) {
    window.location.href = '/login';
    throw new Error('Não autorizado');
  }
  if (!res.ok) throw new Error("Erro ao criar processo");
  return res.json();
}

async function updateProcesso(data: Processo): Promise<Processo> {
  const res = await fetch(`${API_URL}/${data.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (res.status === 401 || res.status === 403) {
    window.location.href = '/login';
    throw new Error('Não autorizado');
  }
  if (!res.ok) throw new Error("Erro ao atualizar processo");
  return res.json();
}

async function deleteProcesso(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, { 
    method: "DELETE",
    credentials: 'include',
  });
  if (res.status === 401 || res.status === 403) {
    window.location.href = '/login';
    throw new Error('Não autorizado');
  }
  if (!res.ok) throw new Error("Erro ao excluir processo");
}

export function useProcessos() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["processos"],
    queryFn: fetchProcessos,
  });

  const createMutation = useMutation({
    mutationFn: createProcesso,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processos"] });
      toast.success("Processo criado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar processo");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateProcesso,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processos"] });
      toast.success("Processo atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar processo");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProcesso,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processos"] });
      toast.success("Processo excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir processo");
    },
  });

  return {
    processos: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    remove: deleteMutation.mutate,
  };
}