import { Usuario, Livro, Editora, Emprestimo, LogEstoque } from './types';

export const INITIAL_PUBLISHERS: Editora[] = [
  {
    id: "PUB001",
    nomeEditora: "Editora Ática",
    email: "contato@atica.com.br",
    telefone: "(11) 3990-2100"
  },
  {
    id: "PUB002",
    nomeEditora: "Editora Rocco",
    email: "rocco@rocco.com.br",
    telefone: "(21) 3527-7450"
  },
  {
    id: "PUB003",
    nomeEditora: "Companhia das Letras",
    email: "atendimento@companhiadasletras.com.br",
    telefone: "(11) 3707-3500"
  },
  {
    id: "PUB004",
    nomeEditora: "Editora Novatec",
    email: "vendas@novatec.com.br",
    telefone: "(11) 2959-6529"
  }
];

export const INITIAL_BOOKS: Livro[] = [
  {
    id: "LIV001",
    nomeLivro: "Dom Casmurro",
    autor: "Machado de Assis",
    editoraId: "PUB001",
    anoPublicacao: "1899",
    isbn: "9788508151042",
    categoria: "Literatura Clássica",
    estoqueTotal: 10,
    alugados: 2,
    disponiveis: 8
  },
  {
    id: "LIV002",
    nomeLivro: "Harry Potter e a Pedra Filosofal",
    autor: "J.K. Rowling",
    editoraId: "PUB002",
    anoPublicacao: "1997",
    isbn: "9788532511010",
    categoria: "Fantasia / Aventura",
    estoqueTotal: 8,
    alugados: 1,
    disponiveis: 7
  },
  {
    id: "LIV003",
    nomeLivro: "O Microcontrolador Arduino: Teoria e Prática",
    autor: "Christian Torres",
    editoraId: "PUB004",
    anoPublicacao: "2018",
    isbn: "9788575226442",
    categoria: "Tecnologia / Eletrônica",
    estoqueTotal: 5,
    alugados: 0,
    disponiveis: 5
  },
  {
    id: "LIV004",
    nomeLivro: "O Pequeno Príncipe",
    autor: "Antoine de Saint-Exupéry",
    editoraId: "PUB003",
    anoPublicacao: "1943",
    isbn: "9788522031433",
    categoria: "Fábula / Literatura Juvenil",
    estoqueTotal: 15,
    alugados: 1,
    disponiveis: 14
  }
];

export const INITIAL_USERS: Usuario[] = [
  {
    id: "USR001",
    matricula: "20241029001",
    nome: "Arthur Lima de Oliveira",
    email: "arthur.lima@escola.ce.gov.br",
    telefone: "(85) 98765-4321",
    funcao: "Estudante",
    curso: "Informática",
    serie: "3º Ano - Técnico",
    cpf: "123.456.789-00",
    endereco: {
      rua: "Av. Afonso Albuquerque Lima",
      numero: "s/n",
      bairro: "Cambeba",
      cidade: "Fortaleza",
      uf: "CE"
    }
  },
  {
    id: "USR002",
    matricula: "20241029002",
    nome: "Profa. Maria Clara Souza",
    email: "maria.souza@professor.ce.gov.br",
    telefone: "(85) 99887-6655",
    funcao: "Professor",
    curso: "Administração",
    serie: "Série Docente",
    cpf: "234.567.890-11",
    endereco: {
      rua: "Rua Washington Soares",
      numero: "1321",
      bairro: "Água Fria",
      cidade: "Fortaleza",
      uf: "CE"
    }
  },
  {
    id: "USR003",
    matricula: "20241029003",
    nome: "José Carlos Pereira",
    email: "jose.carlos@escola.ce.gov.br",
    telefone: "(85) 99123-4567",
    funcao: "Funcionário",
    curso: "Secretaria Acadêmica",
    serie: "N/A",
    cpf: "345.678.901-22",
    endereco: {
      rua: "Rua Osvaldo Cruz",
      numero: "450",
      bairro: "Aldeota",
      cidade: "Fortaleza",
      uf: "CE"
    }
  },
  {
    id: "USR004",
    matricula: "20241029004",
    nome: "Beatriz Mota Vasconcelos",
    email: "beatriz.mota@escola.ce.gov.br",
    telefone: "(85) 98122-3344",
    funcao: "Estudante",
    curso: "Redes de Computadores",
    serie: "2º Ano - Técnico",
    cpf: "456.789.012-33",
    endereco: {
      rua: "Rua Joaquim Nabuco",
      numero: "100",
      bairro: "Meireles",
      cidade: "Fortaleza",
      uf: "CE"
    }
  }
];

export const INITIAL_LOANS: Emprestimo[] = [
  {
    id: "EMP001",
    usuarioId: "USR001",
    livroId: "LIV001",
    dataEmprestimo: "2026-06-01",
    dataDevolucao: "2026-06-15",
    status: "Ativo"
  },
  {
    id: "EMP002",
    usuarioId: "USR002",
    livroId: "LIV002",
    dataEmprestimo: "2026-05-10",
    dataDevolucao: "2026-05-24",
    dataDevolucaoReal: "2026-05-22",
    status: "Devolvido"
  },
  {
    id: "EMP003",
    usuarioId: "USR004",
    livroId: "LIV001",
    dataEmprestimo: "2026-06-03",
    dataDevolucao: "2026-06-17",
    status: "Ativo"
  },
  {
    id: "EMP004",
    usuarioId: "USR001",
    livroId: "LIV004",
    dataEmprestimo: "2026-06-05",
    dataDevolucao: "2026-06-19",
    status: "Ativo"
  }
];

export const INITIAL_LOGS: LogEstoque[] = [
  {
    id: "STK001",
    livroId: "LIV001",
    editoraId: "PUB001",
    quantidade: 10,
    tipo: "Entrada",
    motivo: "Abertura de Estoque Inicial",
    data: "2026-05-01T08:00:00Z"
  },
  {
    id: "STK002",
    livroId: "LIV002",
    editoraId: "PUB002",
    quantidade: 8,
    tipo: "Entrada",
    motivo: "Abertura de Estoque Inicial",
    data: "2026-05-01T08:15:00Z"
  },
  {
    id: "STK003",
    livroId: "LIV003",
    editoraId: "PUB004",
    quantidade: 5,
    tipo: "Entrada",
    motivo: "Nova Aquisição de Didáticos",
    data: "2026-05-03T10:00:00Z"
  },
  {
    id: "STK004",
    livroId: "LIV004",
    editoraId: "PUB003",
    quantidade: 15,
    tipo: "Entrada",
    motivo: "Abertura de Estoque Inicial",
    data: "2026-05-05T09:30:00Z"
  }
];
