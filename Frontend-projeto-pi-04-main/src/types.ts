export type CellStatus = 'pending' | 'completed' | 'upcoming';

export interface CellData {
  text: string;
  status: CellStatus;
}

export interface RowData {
  week: string;
  cells: CellData[];
}

export interface IGestante {
  id: number;
  cpf: string;
  nome: string;
  data_nascimento: string;
  idade: number;
  nome_mae: string;
  data_prevista_parto: string;
  ultima_menstruacao: string;
  endereco: string;
  cep: string;
  cidade: string;
  estado: string;
  unidade: string;
  telefone: string;
  cronograma: RowData[] | null;
}

export type FormData = Omit<IGestante, 'id' | 'cronograma' | 'idade'> & { idade: string };

// Unidades de saude atendidas pela rede.
// Lista fixa por enquanto; a evolucao prevista e virar cadastro no banco.
export const UNIDADES: string[] = [
  'UBS Jardim Suzanopolis',
  'UBS Agua Bela',
  'UBS Vila Itaqua',
  'UBS Centro Poa',
  'Hospital Municipal Alto Tiete',
];
