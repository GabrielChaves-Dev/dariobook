/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Endereco {
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface Usuario {
  id: string; // código do usuário
  matricula: string;
  nome: string;
  email: string;
  telefone: string;
  funcao: 'Estudante' | 'Professor' | 'Funcionário';
  curso: string;
  serie: string;
  cpf: string;
  endereco: Endereco;
}

export interface Livro {
  id: string; // código do livro
  nomeLivro: string;
  autor: string;
  editoraId: string; // código da editora
  anoPublicacao: string;
  isbn: string;
  categoria: string;
  estoqueTotal: number;
  alugados: number; // quantidade alugada
  disponiveis: number; // quantidade disponível
}

export interface Editora {
  id: string; // código da editora
  nomeEditora: string;
  email: string;
  telefone: string;
}

export interface Emprestimo {
  id: string; // código do aluguel
  usuarioId: string; // código do usuário
  livroId: string; // código do livro
  dataEmprestimo: string;
  dataDevolucao: string; // data de devolução esperada
  dataDevolucaoReal?: string; // data que realmente devolveu
  status: 'Ativo' | 'Devolvido';
}

export interface LogEstoque {
  id: string; // código estoque
  livroId: string;
  editoraId: string;
  quantidade: number;
  tipo: 'Entrada' | 'Saída';
  motivo: string;
  data: string;
}

export interface AuthSession {
  nome: string;
  email: string;
  isAuthenticated: boolean;
}
