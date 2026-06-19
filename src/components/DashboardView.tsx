import React from 'react';
import { 
  FileCheck, 
  BookOpen, 
  Users, 
  AlertTriangle, 
  ArrowUpRight, 
  Sparkles, 
  PlusCircle, 
  Building2,
  BookmarkCheck,
  TrendingUp,
  Clock,
  FileDown,
  Printer,
  ScrollText,
  Boxes
} from 'lucide-react';
import { Usuario, Livro, Editora, Emprestimo, LogEstoque } from '../types';
import { 
  exportRelatorioEmprestimos, 
  exportRelatorioLivros, 
  exportRelatorioUsuarios, 
  exportRelatorioEditoras, 
  exportRelatorioEstoque 
} from '../utils/pdfGenerator';

interface DashboardViewProps {
  users: Usuario[];
  books: Livro[];
  publishers: Editora[];
  loans: Emprestimo[];
  setCurrentTab: (tab: string) => void;
  onQuickLoan: () => void;
  onQuickBook: () => void;
  onQuickUser: () => void;
  logs?: LogEstoque[];
}

export default function DashboardView({
  users,
  books,
  publishers,
  loans,
  setCurrentTab,
  onQuickLoan,
  onQuickBook,
  onQuickUser,
  logs = [],
}: DashboardViewProps) {
  // Compute Stats
  const totalBooks = books.length;
  const totalUsers = users.length;
  const activeLoans = loans.filter((l) => l.status === 'Ativo').length;
  const returnedLoans = loans.filter((l) => l.status === 'Devolvido').length;

  const totalCopies = books.reduce((acc, curr) => acc + curr.estoqueTotal, 0);
  const totalRentedCopies = books.reduce((acc, curr) => acc + curr.alugados, 0);
  const availableCopies = totalCopies - totalRentedCopies;

  // Percentage calculations
  const rentPercentage = totalCopies > 0 ? Math.round((totalRentedCopies / totalCopies) * 100) : 0;
  
  // Stock alert (items having 0 or less than 1 copy available)
  const outOfStockBooks = books.filter((b) => b.disponiveis === 0);

  // Categories distribution
  const categoriesMap: { [key: string]: number } = {};
  books.forEach((book) => {
    categoriesMap[book.categoria] = (categoriesMap[book.categoria] || 0) + 1;
  });
  const categoriesList = Object.keys(categoriesMap).map(key => ({
    name: key,
    count: categoriesMap[key],
    percentage: Math.round((categoriesMap[key] / totalBooks) * 100)
  })).sort((a,b) => b.count - a.count).slice(0, 4);

  // Active Loans with User and Book details for the highlight list
  const activeLoansDetails = loans
    .filter(l => l.status === 'Ativo')
    .slice(0, 3)
    .map(l => {
      const u = users.find(user => user.id === l.usuarioId);
      const b = books.find(book => book.id === l.livroId);
      return {
        ...l,
        userName: u ? u.nome : 'Usuário Desconhecido',
        userRole: u ? u.funcao : 'N/A',
        bookTitle: b ? b.nomeLivro : 'Livro Desconhecido'
      };
    });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-300 font-mono text-xs font-semibold px-2.5 py-1 rounded-full mb-3 border border-emerald-500/20">
            <Sparkles className="h-3 w-3" />
            <span>SISTEMA ATUALIZADO EM TEMPO REAL</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-display font-medium tracking-tight mb-2">
            Gestão Modernizada de Acervo & Empréstimos
          </h1>
          <p className="text-slate-200 text-sm md:text-base mb-6 leading-relaxed">
            Painel escolar integrado da Secretaria de Educação do Ceará. Aqui você pode realizar cadastros, acompanhar empréstimos em andamento, ajustar o controle de estoque de livros e gerenciar editoras facilmente.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onQuickLoan}
              className="flex items-center space-x-2 bg-white text-slate-900 font-medium text-sm px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-all shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlusCircle className="h-4.5 w-4.5 text-emerald-600" />
              <span>Novo Empréstimo</span>
            </button>
            <button
              onClick={() => setCurrentTab('books')}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/15 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-all border border-white/10"
            >
              <span>Ver Catálogo</span>
              <ArrowUpRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
        {/* Decorative backdrop shapes */}
        <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none hidden md:block">
          <svg className="h-full w-auto text-white" viewBox="0 0 100 100" fill="currentColor">
            <polygon points="0,100 100,0 100,100" />
          </svg>
        </div>
      </div>

      {/* Numerical Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Empréstimos Ativos</span>
            <span className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight font-display">{activeLoans}</span>
            <span className="text-xs text-slate-400 block font-light">Em uso atualmente</span>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-xl">
            <FileCheck className="h-6 w-6" />
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Livros no Catálogo</span>
            <span className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight font-display">{totalBooks}</span>
            <span className="text-xs text-slate-400 block font-light">{totalCopies} exemplares totais</span>
          </div>
          <div className="bg-sky-50 text-sky-600 p-3.5 rounded-xl">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Estoque de Cópias</span>
            <span className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight font-display">{availableCopies}</span>
            <span className="text-xs text-slate-400 block font-light">Disponíveis p/ aluguel</span>
          </div>
          <div className="bg-teal-50 text-teal-600 p-3.5 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Usuários Ativos</span>
            <span className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight font-display">{totalUsers}</span>
            <span className="text-xs text-slate-400 block font-light">Estudantes e Funcionários</span>
          </div>
          <div className="bg-slate-50 text-slate-700 p-3.5 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (2/3 width on wide screens): Active Loans & Stock alert */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active borrowing snapshot */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-medium text-base text-slate-900 flex items-center space-x-1.5">
                  <BookmarkCheck className="h-5 w-5 text-emerald-500" />
                  <span>Empréstimos Recentes Ativos</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Livros de posse temporária sem devolução registrada</p>
              </div>
              <button 
                onClick={() => setCurrentTab('loans')}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
              >
                Gerenciar Todos
              </button>
            </div>

            {activeLoansDetails.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                Nenhum empréstimo ativo no momento! Use "Novo Empréstimo" para registrar um aluguel.
              </div>
            ) : (
              <div className="space-y-3">
                {activeLoansDetails.map((loan) => (
                  <div key={loan.id} className="flex items-start justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100/80 hover:border-slate-200 transition-colors">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold text-slate-800 flex items-center space-x-1">
                        <span className="bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded text-[10px] mr-1">ATIVO</span>
                        <span>{loan.id}</span>
                      </span>
                      <h4 className="text-sm font-semibold text-slate-900">{loan.bookTitle}</h4>
                      <p className="text-xs text-slate-500">
                        Por: <span className="text-slate-700 font-medium">{loan.userName}</span> ({loan.userRole})
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end space-y-1">
                      <span className="text-[10px] text-slate-400 flex items-center space-x-1 font-mono">
                        <Clock className="h-3 w-3 text-amber-500" />
                        <span>Devolução até:</span>
                      </span>
                      <span className="text-xs font-semibold text-slate-700 font-mono">
                        {new Date(loan.dataDevolucao + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock Watch */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <h3 className="font-display font-medium text-base text-slate-900 flex items-center space-x-1.5 mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span>Balanço de Disponibilidade</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">Detalhamento dos exemplares disponíveis e esgotados para locação imediata</p>

            <div className="space-y-4">
              {/* Ratio summary progress bar */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                  <span>Exemplares Alugados ({totalRentedCopies})</span>
                  <span>Exemplares Disponíveis ({availableCopies})</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full transition-all" style={{ width: `${100 - rentPercentage}%` }}></div>
                  <div className="bg-amber-400 h-full transition-all" style={{ width: `${rentPercentage}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>Livres p/ Aluguel: {100 - rentPercentage}%</span>
                  <span>Ocupados/Alugados: {rentPercentage}%</span>
                </div>
              </div>

              {/* List of out of stock books */}
              <div className="border-t border-slate-100 pt-3">
                <span className="text-xs font-medium text-slate-600 block mb-2">Livros sem Estoque Disponível ({outOfStockBooks.length})</span>
                {outOfStockBooks.length === 0 ? (
                  <p className="text-xs text-emerald-600 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 font-light">
                    Excelente! Todos os livros do acervo possuem ao menos uma unidade disponível para locação imediata.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {outOfStockBooks.map(book => (
                      <div key={book.id} className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-xs flex justify-between items-center">
                        <div className="truncate pr-2">
                          <span className="font-semibold text-slate-900 block truncate">{book.nomeLivro}</span>
                          <span className="text-slate-500 block text-[10px] truncate">Código: {book.id} - {book.autor}</span>
                        </div>
                        <span className="bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px] shrink-0">ESGOTADO</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right column (1/3 width): Quick actions & category visual distribution */}
        <div className="space-y-6">
          {/* Quick Admin Actions */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <h3 className="font-display font-medium text-base text-slate-900 mb-3 block mr-1 leading-snug">Ações Rápidas</h3>
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={onQuickLoan}
                className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 hover:border-slate-200 text-left transition-colors text-slate-700 hover:text-slate-900 group"
              >
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                  <FileCheck className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="font-medium text-xs block">Novo Empréstimo</span>
                  <span className="text-[10px] text-slate-400 block">Registrar saída de livro</span>
                </div>
              </button>

              <button 
                onClick={onQuickBook}
                className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 hover:border-slate-200 text-left transition-colors text-slate-700 hover:text-slate-900 group"
              >
                <div className="p-2 bg-sky-100 text-sky-700 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                  <BookOpen className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="font-medium text-xs block">Cadastrar Livro</span>
                  <span className="text-[10px] text-slate-400 block">Expandir acervo escolar</span>
                </div>
              </button>

              <button 
                onClick={onQuickUser}
                className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 hover:border-slate-200 text-left transition-colors text-slate-700 hover:text-slate-900 group"
              >
                <div className="p-2 bg-teal-100 text-teal-700 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                  <Users className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="font-medium text-xs block">Registrar Usuário</span>
                  <span className="text-[10px] text-slate-400 block">Estudantes, professores e staff</span>
                </div>
              </button>

              <button 
                onClick={() => setCurrentTab('publishers')}
                className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 hover:border-slate-200 text-left transition-colors text-slate-700 hover:text-slate-900 group"
              >
                <div className="p-2 bg-slate-200 text-slate-755 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                  <Building2 className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="font-medium text-xs block">Nova Editora</span>
                  <span className="text-[10px] text-slate-400 block">Cadastrar editora parceira</span>
                </div>
              </button>
            </div>
          </div>

          {/* Central de Relatórios Oficiais (PDF) */}
          <div className="bg-white rounded-2xl border border-emerald-100/70 p-5 shadow-xs bg-gradient-to-b from-white to-emerald-500/2">
            <h3 className="font-display font-medium text-base text-slate-900 flex items-center space-x-2 mb-1">
              <ScrollText className="h-5 w-5 text-emerald-600" />
              <span>Relatórios Oficiais (PDF)</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-normal">Gere e faça download de relatórios em formato PDF com diagramação e cabeçalho oficial Seduc.</p>
            
            <div className="space-y-2">
              <button
                onClick={() => exportRelatorioEmprestimos(loans, users, books)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-emerald-100/60 text-emerald-800 rounded-lg group-hover:bg-emerald-555 group-hover:text-white transition-all">
                    <FileDown className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-slate-800 block">Empréstimos Ativos</span>
                    <span className="text-[9px] text-slate-400 font-mono">Listagem com metas e prazos</span>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-350 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                onClick={() => exportRelatorioLivros(books, publishers)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-emerald-100/60 text-emerald-800 rounded-lg group-hover:bg-emerald-555 group-hover:text-white transition-all">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-slate-800 block">Inventário do Acervo</span>
                    <span className="text-[9px] text-slate-400 font-mono">Catalogação de exemplares e ISBN</span>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-350 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                onClick={() => exportRelatorioUsuarios(users)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-emerald-100/60 text-emerald-800 rounded-lg group-hover:bg-emerald-555 group-hover:text-white transition-all">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-slate-800 block">Diretório de Usuários</span>
                    <span className="text-[9px] text-slate-400 font-mono">Listagem de leitores e contato</span>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-350 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                onClick={() => exportRelatorioEditoras(publishers, books)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-emerald-100/60 text-emerald-800 rounded-lg group-hover:bg-emerald-555 group-hover:text-white transition-all">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-slate-800 block">Lista de Editoras</span>
                    <span className="text-[9px] text-slate-400 font-mono">Parcerias e volumes agregados</span>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-350 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                onClick={() => exportRelatorioEstoque(logs, books)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-emerald-100/60 text-emerald-800 rounded-lg group-hover:bg-emerald-555 group-hover:text-white transition-all">
                     <Boxes className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-slate-800 block">Movimentação de Estoque</span>
                    <span className="text-[9px] text-slate-400 font-mono">Livro de Tombo e Auditoria</span>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-350 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Distribution chart by Category (Dynamic CSS layout) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <h3 className="font-display font-medium text-base text-slate-900 mb-1">Principais Categorias</h3>
            <p className="text-xs text-slate-400 mb-4">Participação percentual por categoria no acervo total</p>

            <div className="space-y-3.5">
              {categoriesList.map((cat, idx) => {
                const colors = [
                  { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-100', fill: 'bg-emerald-50' },
                  { bg: 'bg-sky-500', text: 'text-sky-700', border: 'border-sky-100', fill: 'bg-sky-50' },
                  { bg: 'bg-yellow-500', text: 'text-yellow-700', border: 'border-yellow-100', fill: 'bg-yellow-50' },
                  { bg: 'bg-slate-400', text: 'text-slate-700', border: 'border-slate-100', fill: 'bg-slate-50' }
                ];
                const activeColor = colors[idx % colors.length];

                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700 truncate max-w-[150px]">{cat.name}</span>
                      <span className="text-slate-500 shrink-0 font-mono">{cat.count} {cat.count === 1 ? 'livro' : 'livros'} ({cat.percentage}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${activeColor.bg} rounded-full transition-all duration-500`} style={{ width: `${cat.percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
