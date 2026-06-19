import React, { useState } from 'react';
import { 
  FileCheck, 
  Search, 
  Plus, 
  X, 
  Save, 
  AlertCircle, 
  CheckCircle2,
  Calendar,
  User,
  BookOpen,
  ArrowRightLeft,
  Filter,
  Check,
  Undo2,
  Lock,
  Building2,
  UserCheck,
  FileDown
} from 'lucide-react';
import { Emprestimo, Usuario, Livro, Editora } from '../types';
import { exportComprovanteEmprestimo, exportRelatorioEmprestimos } from '../utils/pdfGenerator';

interface EmprestimosViewProps {
  loans: Emprestimo[];
  users: Usuario[];
  books: Livro[];
  publishers: Editora[];
  onAddLoan: (loan: Emprestimo) => boolean | string;
  onFinalizeLoan: (loanId: string, returnDate: string) => boolean | string;
}

export default function EmprestimosView({
  loans,
  users,
  books,
  publishers,
  onAddLoan,
  onFinalizeLoan,
}: EmprestimosViewProps) {
  // Search parameters
  const [searchTerm, setSearchTerm] = useState('');
  
  // Status tab filter
  // Status: All, Pending (Ativo), Completed (Devolvido)
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Ativo' | 'Devolvido'>('Todos');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [loanId, setLoanId] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [livroId, setLivroId] = useState('');
  const [dataDevolucao, setDataDevolucao] = useState('');
  const [dataEmprestimo, setDataEmprestimo] = useState('');

  // Searches inside inputs (autosuggest helpers)
  const [userQuery, setUserQuery] = useState('');
  const [bookQuery, setBookQuery] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showBookDropdown, setShowBookDropdown] = useState(false);

  // Notifications
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Reset the create form state
  const resetForm = () => {
    setLoanId(`EMP${String(loans.length + 1).padStart(3, '0')}`);
    setUsuarioId('');
    setUserQuery('');
    setLivroId('');
    setBookQuery('');
    const today = new Date().toISOString().split('T')[0];
    setDataEmprestimo(today);
    
    // Default return date is 14 days from now
    const defaultReturn = new Date();
    defaultReturn.setDate(defaultReturn.getDate() + 14);
    setDataDevolucao(defaultReturn.toISOString().split('T')[0]);
  };

  const handleOpenCreateModal = () => {
    if (users.length === 0) {
      setAlertMessage({ type: 'error', text: 'Cadastre ao menos um usuário no sistema antes de efetuar empréstimos.' });
      setTimeout(() => setAlertMessage(null), 5000);
      return;
    }
    if (books.length === 0) {
      setAlertMessage({ type: 'error', text: 'Cadastre ao menos um livro para aluguel antes de efetuar empréstimos.' });
      setTimeout(() => setAlertMessage(null), 5000);
      return;
    }
    resetForm();
    setIsModalOpen(true);
  };

  // 4. Pesquisar empréstimos por nome do livro, editora, autor, status de aluguel e nome de usuário
  const filteredLoans = loans.filter((loan) => {
    const user = users.find((u) => u.id === loan.usuarioId);
    const book = books.find((b) => b.id === loan.livroId);
    const publisher = book ? publishers.find((p) => p.id === book.editoraId) : null;

    const userName = user ? user.nome.toLowerCase() : '';
    const bookTitle = book ? book.nomeLivro.toLowerCase() : '';
    const authorName = book ? book.autor.toLowerCase() : '';
    const publisherName = publisher ? publisher.nomeEditora.toLowerCase() : '';
    const statusText = loan.status.toLowerCase();

    const matchesSearch = 
      userName.includes(searchTerm.toLowerCase()) ||
      bookTitle.includes(searchTerm.toLowerCase()) ||
      authorName.includes(searchTerm.toLowerCase()) ||
      publisherName.includes(searchTerm.toLowerCase()) ||
      statusText.includes(searchTerm.toLowerCase()) ||
      loan.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'Todos' || loan.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuarioId || !livroId || !dataDevolucao || !dataEmprestimo) {
      setAlertMessage({ type: 'error', text: 'Por favor, selecione um usuário, um livro e as datas correspondentes!' });
      return;
    }

    const selectedBook = books.find(b => b.id === livroId);
    if (selectedBook && selectedBook.disponiveis <= 0) {
      setAlertMessage({ type: 'error', text: 'Operação Bloqueada: Não há exemplares físicos disponíveis desta obra em estoque para locação.' });
      return;
    }

    if (loans.some(l => l.id === loanId)) {
      setAlertMessage({ type: 'error', text: 'Já existe um registro de empréstimo com este código.' });
      return;
    }

    const newLoan: Emprestimo = {
      id: loanId,
      usuarioId,
      livroId,
      dataEmprestimo,
      dataDevolucao,
      status: 'Ativo'
    };

    const res = onAddLoan(newLoan);
    if (res === true) {
      setAlertMessage({ type: 'success', text: `Empréstimo registrado com sucesso para o código ${loanId}!` });
      setIsModalOpen(false);
    } else {
      setAlertMessage({ type: 'error', text: typeof res === 'string' ? res : 'Houve um erro ao efetuar o empréstimo.' });
    }

    setTimeout(() => setAlertMessage(null), 5500);
  };

  const handleReturnBook = (loanId: string, bookName: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (confirm(`Confirmar a devolução física do livro "${bookName}" e encerramento deste empréstimo?`)) {
      const res = onFinalizeLoan(loanId, today);
      if (res === true) {
        setAlertMessage({ type: 'success', text: `Livro "${bookName}" foi marcado como DEVOLVIDO. Estoque físico restabelecido.` });
      } else {
        setAlertMessage({ type: 'error', text: typeof res === 'string' ? res : 'Não foi possível finalizar o empréstimo.' });
      }
      setTimeout(() => setAlertMessage(null), 5000);
    }
  };

  // Helpers to select users/books by filtering the autosuggestion lists
  const filteredUserDropdown = users.filter((u) => 
    u.nome.toLowerCase().includes(userQuery.toLowerCase()) || 
    u.matricula.includes(userQuery) ||
    u.id.toLowerCase().includes(userQuery.toLowerCase())
  );

  const filteredBookDropdown = books.filter((b) => 
    b.nomeLivro.toLowerCase().includes(bookQuery.toLowerCase()) || 
    b.id.toLowerCase().includes(bookQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="font-display font-medium text-2xl text-slate-900 flex items-center space-x-2">
            <FileCheck className="h-7 w-7 text-emerald-500" />
            <span>Controle & Cadastro de Empréstimos</span>
          </h2>
          <p className="text-sm text-slate-500">Registre locações, controle prazos de devolução e atualize as saídas de estoque.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportRelatorioEmprestimos(loans, users, books)}
            className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5 cursor-pointer"
            title="Exportar Todos os Empréstimos em PDF"
          >
            <FileDown className="h-4 w-4 text-emerald-400" />
            <span>Relatório PDF</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Registrar Empréstimo</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {alertMessage && (
        <div className={`p-4 rounded-xl flex items-start space-x-3 border ${
          alertMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-850' 
            : 'bg-rose-50 border-rose-100 text-rose-850'
        }`}>
          {alertMessage.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span className="text-sm font-medium">{alertMessage.text}</span>
        </div>
      )}

      {/* Toggles, Searches & Filters Container */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
        
        {/* Toggle switches for filtering */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
          <div className="flex space-x-1">
            <button
              onClick={() => setStatusFilter("Todos")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === 'Todos' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-200/50'
              }`}
            >
              Todos os Empréstimos
            </button>
            <button
              onClick={() => setStatusFilter("Ativo")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5 ${
                statusFilter === 'Ativo' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-500 hover:bg-slate-200/50'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-amber-955 animate-ping"></span>
              <span>Pendentes de Devolução</span>
            </button>
            <button
              onClick={() => setStatusFilter("Devolvido")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === 'Devolvido' ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'text-slate-500 hover:bg-slate-200/50'
              }`}
            >
              Arquivados / Devolvidos
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            Filtro ativo: {filteredLoans.length} registros correspondentes
          </div>
        </div>

        {/* Search input field */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome do livro, autor, editora, usuário, status ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-slate-50/50"
          />
        </div>
      </div>

      {/* Grid of borrowers / Loan Logs Card List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredLoans.map((loan) => {
          const user = users.find((u) => u.id === loan.usuarioId);
          const book = books.find((b) => b.id === loan.livroId);
          const publisher = book ? publishers.find(p => p.id === book.editoraId) : null;
          
          const isOverdue = loan.status === 'Ativo' && new Date(loan.dataDevolucao) < new Date();

          return (
            <div 
              key={loan.id} 
              className={`bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                loan.status === 'Devolvido' ? 'border-emerald-100 bg-emerald-50/5' : 
                isOverdue ? 'border-rose-200 bg-rose-50/5' : 'border-amber-100 bg-amber-50/5'
              }`}
            >
              {/* Left Group Context */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono font-bold font-semibold text-slate-550 block bg-slate-100 px-2 py-0.5 rounded">
                    {loan.id}
                  </span>
                  
                  {/* Status Indicator */}
                  {loan.status === 'Devolvido' ? (
                    <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100/75 px-2.5 py-0.5 rounded-full flex items-center space-x-1 font-mono">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 block"></span>
                      <span>Devolvido</span>
                    </span>
                  ) : isOverdue ? (
                    <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-150 px-2.5 py-0.5 rounded-full flex items-center space-x-1 font-mono animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-650 block"></span>
                      <span>Atrasado</span>
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full flex items-center space-x-1 font-mono">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-600 block animate-ping"></span>
                      <span>Em Aberto</span>
                    </span>
                  )}
                </div>

                {/* Grid Info Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Book reference */}
                  <div className="flex items-start space-x-2.5">
                    <BookOpen className="h-4 w-4 text-emerald-500 mt-1 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">TÍTULO E AUTOR DO LIVRO</span>
                      <p className="text-sm font-semibold text-slate-900 leading-tight">{book ? book.nomeLivro : 'Livro Removido'}</p>
                      <p className="text-xs text-slate-500 italic block mt-0.5">{book ? book.autor : 'Desconhecido'}</p>
                      {publisher && (
                        <p className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                          <Building2 className="h-2.5 w-2.5" />
                          <span>Editora: {publisher.nomeEditora} ({publisher.id})</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* User Reference */}
                  <div className="flex items-start space-x-2.5">
                    <User className="h-4 w-4 text-emerald-500 mt-1 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">ESTUDANTE / DESTINATÁRIO</span>
                      <p className="text-sm font-semibold text-slate-900 leading-tight">{user ? user.nome : 'Usuário Removido'}</p>
                      <span className="text-xs text-slate-500 block mt-0.5">Role: {user ? user.funcao : 'N/A'}</span>
                      {user && (
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded block w-fit mt-1">Matrícula: {user.matricula}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Date info */}
              <div className="shrink-0 flex items-start md:items-end flex-col gap-1.5 md:text-right border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold tracking-wider">RETIRADA</span>
                  <span className="text-xs font-mono font-medium text-slate-700">
                    {new Date(loan.dataEmprestimo + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold tracking-wider">DEVOLUÇÃO LIMITE</span>
                  <span className={`text-xs font-mono font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-800'}`}>
                    {new Date(loan.dataDevolucao + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {loan.dataDevolucaoReal && (
                  <div>
                    <span className="text-[10px] text-emerald-600 block uppercase font-semibold tracking-wider">ENTREGUE EM</span>
                    <span className="text-xs font-mono font-bold text-emerald-600">
                      {new Date(loan.dataDevolucaoReal + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>

              {/* Right Side Actions (Return & Recibo PDF) */}
              <div className="shrink-0 flex items-center justify-end flex-wrap gap-2">
                <button
                  onClick={() => {
                    if (user && book) {
                      exportComprovanteEmprestimo(loan, user, book, publisher || undefined);
                    } else {
                      alert('Não é possível extrair o recibo para um cadastro removido ou corrompido.');
                    }
                  }}
                  className="flex items-center space-x-1 text-emerald-800 hover:text-white bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 hover:border-emerald-600 font-semibold px-3 py-2 rounded-xl text-xs transition-all cursor-pointer"
                  title="Gerar PDF do Comprovante de Empréstimo"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  <span>Recibo PDF</span>
                </button>

                {loan.status === 'Ativo' && (
                  <button
                    onClick={() => handleReturnBook(loan.id, book ? book.nomeLivro : 'Livro')}
                    className="flex items-center space-x-1 text-slate-950 hover:text-white bg-emerald-400 hover:bg-emerald-505 font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-xs cursor-pointer"
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                    <span>Registrar Devolução</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredLoans.length === 0 && (
          <div className="bg-slate-50 p-10 text-center rounded-2xl border border-dashed border-slate-200">
            <FileCheck className="h-10 w-10 text-slate-350 mx-auto mb-2" />
            <span className="text-sm text-slate-500 font-light block">Nenhum registro de empréstimo atende às condições.</span>
          </div>
        )}
      </div>

      {/* REGISTRATION POPUP LOAN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <FileCheck className="h-5.5 w-5.5 text-emerald-400" />
                <h3 className="font-display font-medium text-lg">
                  Registrar Saída (Empréstimo)
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLoan} className="p-6 overflow-y-auto space-y-4">
              
              {/* ID/Code representation */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1 font-mono">Código do Aluguel (Auto)</label>
                <input
                  type="text"
                  value={loanId}
                  onChange={(e) => setLoanId(e.target.value)}
                  placeholder="Ex: EMP005"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
                />
              </div>

              {/* User Selection with AutoSuggest Dropdown */}
              <div className="relative">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Buscar Usuário / Beneficiário *</label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Digite o nome do aluno ou professor..."
                    value={userQuery}
                    onChange={(e) => {
                      setUserQuery(e.target.value);
                      setShowUserDropdown(true);
                      // Clear actual id selection if they change text without choosing
                      if(usuarioId) setUsuarioId('');
                    }}
                    onFocus={() => setShowUserDropdown(true)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                
                {/* Autosuggest search box container */}
                {showUserDropdown && userQuery.length > 0 && (
                  <div className="absolute left-0 right-0 max-h-48 overflow-y-auto mt-1 bg-white border border-slate-150 rounded-xl shadow-lg z-50 divide-y divide-slate-50">
                    {filteredUserDropdown.slice(0, 5).map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setUsuarioId(u.id);
                          setUserQuery(u.nome);
                          setShowUserDropdown(false);
                        }}
                        className="text-left w-full px-4 py-2 text-xs hover:bg-emerald-50 transition-colors flex justify-between items-center"
                      >
                        <div>
                          <strong className="text-slate-800 block font-medium">{u.nome}</strong>
                          <span className="text-slate-400 font-sans block">{u.funcao} - Reg: {u.matricula}</span>
                        </div>
                        <span className="font-mono text-slate-400 text-[9px] font-bold">{u.id}</span>
                      </button>
                    ))}
                    {filteredUserDropdown.length === 0 && (
                      <div className="p-3 text-center text-xs text-slate-400">Nenhum usuário coincide com a busca.</div>
                    )}
                  </div>
                )}
                {/* Visual indicator of chosen user */}
                {usuarioId && (
                  <div className="mt-1 flex items-center space-x-1.5 text-xs text-emerald-600 bg-emerald-50 p-2 rounded-xl">
                    <Check className="h-3.5 w-3.5" />
                    <span>Selecionado: Código {usuarioId}</span>
                  </div>
                )}
              </div>

              {/* Book Selection with AutoSuggest Dropdown */}
              <div className="relative">
                <label className="text-xs font-semibold text-slate-700 block mb-1 font-mono">Buscar Livro / Obra *</label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Pesquise o título do livro..."
                    value={bookQuery}
                    onChange={(e) => {
                      setBookQuery(e.target.value);
                      setShowBookDropdown(true);
                      if(livroId) setLivroId('');
                    }}
                    onFocus={() => setShowBookDropdown(true)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                {/* Autosuggest list */}
                {showBookDropdown && bookQuery.length > 0 && (
                  <div className="absolute left-0 right-0 max-h-48 overflow-y-auto mt-1 bg-white border border-slate-150 rounded-xl shadow-lg z-50 divide-y divide-slate-50">
                    {filteredBookDropdown.slice(0, 5).map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setLivroId(b.id);
                          setBookQuery(b.nomeLivro);
                          setShowBookDropdown(false);
                        }}
                        className="text-left w-full px-4 py-2 text-xs hover:bg-emerald-50 transition-colors flex justify-between items-center"
                      >
                        <div>
                          <strong className="text-slate-800 block font-semibold">{b.nomeLivro}</strong>
                          <span className="text-slate-500 block">Autor: {b.autor}</span>
                          <span className="text-slate-400 block font-light">Disponíveis em estoque físico: {b.disponiveis} un</span>
                        </div>
                        <span className="font-mono text-slate-400 text-[9px] shrink-0 font-bold">{b.id}</span>
                      </button>
                    ))}
                    {filteredBookDropdown.length === 0 && (
                      <div className="p-3 text-center text-xs text-slate-400">Nenhum livro coincide com a busca.</div>
                    )}
                  </div>
                )}
                {/* Visual indicator of chosen book */}
                {livroId && (
                  <div className="mt-1 flex items-center space-x-1.5 text-xs text-emerald-600 bg-emerald-50 p-2 rounded-xl">
                    <Check className="h-3.5 w-3.5" />
                    <span>Selecionado: Código {livroId}</span>
                  </div>
                )}
              </div>

              {/* Data Retirada and Devolucao */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Data de Retirada</label>
                  <input
                    type="date"
                    value={dataEmprestimo}
                    onChange={(e) => setDataEmprestimo(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Devolução Limite *</label>
                  <input
                    type="date"
                    value={dataDevolucao}
                    onChange={(e) => setDataDevolucao(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Warning Notice if book has 0 copies select */}
              {livroId && (books.find((b) => b.id === livroId)?.disponiveis || 0) <= 0 && (
                <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-850 rounded-xl text-xs flex items-start space-x-2">
                  <AlertCircle className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Estoque Indisponível!</strong> O livro escolhido não contém unidades disponíveis em estoque físico no momento.
                  </span>
                </div>
              )}

              {/* Action buttons in footer of modal */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-550 bg-slate-50 hover:bg-slate-100 font-semibold rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={livroId !== '' && (books.find((b) => b.id === livroId)?.disponiveis || 0) <= 0}
                  className="flex items-center space-x-1.5 px-5 py-2 text-slate-950 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-45 disabled:pointer-events-none font-bold rounded-xl text-xs transition-all shadow-md"
                >
                  <Save className="h-4 w-4" />
                  <span>Fechar Empréstimo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
