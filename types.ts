
export interface Receita {
  id: number;
  data: string;
  categoria: string;
  descricao: string;
  valor: number;
  procedimento?: string;
  cliente?: string;
  formaPagamento: 'Pix' | 'Cartão' | 'Dinheiro';
  mes: number;
  ano: number;
}

export interface Despesa {
  id: number;
  data: string;
  categoria: string;
  descricao: string;
  valor: number;
  formaPagamento: 'Pix' | 'Cartão' | 'Dinheiro';
  mes: number;
  ano: number;
}

export interface Agendamento {
  id: number;
  cliente: string;
  servico: string;
  dataInicio: string; // ISO String
  dataFim: string;   // ISO String
  observacoes?: string;
  googleEventId?: string;
  valor?: number;
  formaPagamento?: 'Pix' | 'Cartão' | 'Dinheiro';
  status?: 'Agendado' | 'Atendido' | 'Cancelado';
  cor?: string;
  duracao?: string;
  statusPagamento?: 'Pago' | 'Pendente';
}

export interface Cliente {
  id: number;
  nome: string;
  telefone?: string;
  email?: string;
  aniversario?: string; // formato: DD/MM
  observacoes?: string;
  totalGasto?: number;
  totalAtendimentos?: number;
  // Mini Ficha de Anamnese
  anamnese?: {
    alergias?: string;
    problemasSaude?: string;
    medicamentos?: string;
    gestante?: boolean;
    observacoesClinicas?: string;
  };
  procedimentosRealizados?: {
    nome: string;
    data: string;
    valor: number;
  }[];
}

export interface Sonho {
  id: number;
  nome: string;
  valorTotal: number;
  juntado: number;
  prazoMes: number;
  prazoAno: number;
}

export interface GastoFixo {
  id: string;
  nome: string;
  valor: number;
  isPadrao: boolean;
}

export interface MetasOperacionais {
  faturamento: number;
  lucro: number;
  despesas: number;
}

export interface HistoricoMes {
  faturamento: number;
  despesas: number;
  lucro: number;
  metaFaturamento?: number;
}

export interface CalendarEvent {
  id: string;
  titulo: string;
  data: string;
  cliente: string;
  procedimento: string;
}

export interface Conquista {
  id: string;
  tipo: 'faturamento' | 'sonho' | 'crescimento';
  titulo: string;
  dataConquista: string;
  valor?: number;
}

export interface Servico {
  id: string;
  nome: string;
  valor: number;
}
