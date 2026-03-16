export interface Processo {
  id: number;
  numeroProcesso: string;
  nomeCliente: string;
  status: StatusProcesso;
  descricao: string;
  dataPrazo: string;
  etiquetas?: string[];
  honorarios?: string;
  cpfCliente?: string;
  senhaGov?: string;
  arquivado?: boolean;
  telefoneCliente?: string;
}


export type StatusProcesso =
  | "A Fazer"
  | "Fazendo"
  | "Feito ou realizado"
  | "Aguardando Prazo"
  | "Concluído";

export type ProcessoCreate = Omit<Processo, "id">;

export const KANBAN_COLUMNS: StatusProcesso[] = [
  "A Fazer",
  "Fazendo",
  "Feito ou realizado",
  "Aguardando Prazo",
  "Concluído",
];

export type NovoProcesso = Omit<Processo, 'id'>;