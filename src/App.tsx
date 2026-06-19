import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Library, 
  HelpCircle, 
  Sparkles, 
  Heart,
  ChevronRight,
  BookOpen,
  Users,
  Building2,
  FileCheck
} from 'lucide-react';

import { Usuario, Livro, Editora, Emprestimo, LogEstoque, AuthSession } from './types';
import { 
  INITIAL_PUBLISHERS, 
  INITIAL_BOOKS, 
  INITIAL_USERS, 
  INITIAL_LOANS, 
  INITIAL_LOGS 
} from './data';

import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import UsuariosView from './components/UsuariosView';
import LivrosView from './components/LivrosView';
import EditorasView from './components/EditorasView';
import EmprestimosView from './components/EmprestimosView';
import EstoqueLogsView from './components/EstoqueLogsView';
import AuthView from './components/AuthView';

export default function App() {
  // Navigation tabs
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // App core persistent states
  const [users, setUsers] = useState<Usuario[]>([]);
  const [books, setBooks] = useState<Livro[]>([]);
  const [publishers, setPublishers] = useState<Editora[]>([]);
  const [loans, setLoans] = useState<Emprestimo[]>([]);
  const [logs, setLogs] = useState<LogEstoque[]>([]);
  const [session, setSession] = useState<AuthSession>({
    nome: '',
    email: '',
    isAuthenticated: false
  });

  // Load state on mount
  useEffect(() => {
    const storedUsers = localStorage.getItem('lib_users');
    const storedBooks = localStorage.getItem('lib_books');
    const storedPublishers = localStorage.getItem('lib_publishers');
    const storedLoans = localStorage.getItem('lib_loans');
    const storedLogs = localStorage.getItem('lib_logs');
    const storedSession = localStorage.getItem('lib_session');

    if (storedUsers) setUsers(JSON.parse(storedUsers));
    else {
      setUsers(INITIAL_USERS);
      localStorage.setItem('lib_users', JSON.stringify(INITIAL_USERS));
    }

    if (storedBooks) setBooks(JSON.parse(storedBooks));
    else {
      setBooks(INITIAL_BOOKS);
      localStorage.setItem('lib_books', JSON.stringify(INITIAL_BOOKS));
    }

    if (storedPublishers) setPublishers(JSON.parse(storedPublishers));
    else {
      setPublishers(INITIAL_PUBLISHERS);
      localStorage.setItem('lib_publishers', JSON.stringify(INITIAL_PUBLISHERS));
    }

    if (storedLoans) setLoans(JSON.parse(storedLoans));
    else {
      setLoans(INITIAL_LOANS);
      localStorage.setItem('lib_loans', JSON.stringify(INITIAL_LOANS));
    }

    if (storedLogs) setLogs(JSON.parse(storedLogs));
    else {
      setLogs(INITIAL_LOGS);
      localStorage.setItem('lib_logs', JSON.stringify(INITIAL_LOGS));
    }

    if (storedSession) {
      setSession(JSON.parse(storedSession));
    } else {
      // Pre-authenticate admin by default for convenience if they want to enjoy straight away
      const defaultSession = { nome: 'Administrador Seduc', email: 'admin@escola.ce.gov.br', isAuthenticated: true };
      setSession(defaultSession);
      localStorage.setItem('lib_session', JSON.stringify(defaultSession));
    }
  }, []);

  // Save changes helper
  const saveState = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Helper to generate next auto ID
  const generateLogId = (currentLogs: LogEstoque[]): string => {
    return `STK${String(currentLogs.length + 1).padStart(3, '0')}`;
  };

  // Auth Operations
  const handleLogin = (nome: string, email: string) => {
    const newSession = { nome, email, isAuthenticated: true };
    setSession(newSession);
    saveState('lib_session', newSession);
  };

  const handleLogout = () => {
    const newSession = { nome: '', email: '', isAuthenticated: false };
    setSession(newSession);
    saveState('lib_session', newSession);
  };

  // User database sync operations
  const handleAddUser = (user: Usuario) => {
    const updated = [...users, user];
    setUsers(updated);
    saveState('lib_users', updated);
  };

  const handleUpdateUser = (user: Usuario) => {
    const updated = users.map((u) => u.id === user.id ? user : u);
    setUsers(updated);
    saveState('lib_users', updated);
  };

  const handleDeleteUser = (userId: string): boolean | string => {
    // Constraint safeguard check:
    // "Excluir usuário (se ele possuir empréstimo ativo/sem devolução, não poderá ser excluído)"
    const hasActiveLoan = loans.some((l) => l.usuarioId === userId && l.status === 'Ativo');
    if (hasActiveLoan) {
      return 'Não é permitido excluir usuários que possuem empréstimos ativos pendentes de devolução.';
    }
    const updated = users.filter((u) => u.id !== userId);
    setUsers(updated);
    saveState('lib_users', updated);
    return true;
  };

  // Publisher integration sync operations
  const handleAddPublisher = (pub: Editora) => {
    const updated = [...publishers, pub];
    setPublishers(updated);
    saveState('lib_publishers', updated);
  };

  const handleUpdatePublisher = (pub: Editora) => {
    const updated = publishers.map((p) => p.id === pub.id ? pub : p);
    setPublishers(updated);
    saveState('lib_publishers', updated);
  };

  const handleDeletePublisher = (pubId: string): boolean | string => {
    // Constraint check: do not orphan existing books
    const hasBooks = books.some((b) => b.editoraId === pubId);
    if (hasBooks) {
      return 'Não é possível remover esta editora, pois ela possui livros associados em nosso acervo escolar.';
    }
    const updated = publishers.filter((p) => p.id !== pubId);
    setPublishers(updated);
    saveState('lib_publishers', updated);
    return true;
  };

  // Book database operations
  const handleAddBook = (book: Livro, reason: string) => {
    const updatedBooks = [...books, book];
    setBooks(updatedBooks);
    saveState('lib_books', updatedBooks);

    // Register stock control entry log:
    // "Atributos obrigatórios: código estoque, código editora, quantidade do livro no estoque, código do livro"
    const newLogId = generateLogId(logs);
    const newLog: LogEstoque = {
      id: newLogId,
      livroId: book.id,
      editoraId: book.editoraId,
      quantidade: book.estoqueTotal,
      tipo: 'Entrada',
      motivo: reason || 'Abertura de estoque inicial',
      data: new Date().toISOString()
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    saveState('lib_logs', updatedLogs);
  };

  const handleUpdateBook = (book: Livro, reason: string): boolean | string => {
    // Read previous value to compare stock changes and make automatic logs
    const previous = books.find((b) => b.id === book.id);
    if (!previous) return 'Livro insubstituidor.';

    // Constraint: "estoque só poderá ser editado para uma quantidade maior ou igual a quantidade alugada"
    if (book.estoqueTotal < previous.alugados) {
      return `O estoque total não pode ser reduzido abaixo do número de empréstimos em uso (${previous.alugados}).`;
    }

    const updated = books.map((b) => b.id === book.id ? book : b);
    setBooks(updated);
    saveState('lib_books', updated);

    // If stock total changed, let's create a corresponding log automatic track!
    const stockChange = book.estoqueTotal - previous.estoqueTotal;
    if (stockChange !== 0) {
      const isIncrease = stockChange > 0;
      const newLogId = generateLogId(logs);
      const newLog: LogEstoque = {
        id: newLogId,
        livroId: book.id,
        editoraId: book.editoraId,
        quantidade: Math.abs(stockChange),
        tipo: isIncrease ? 'Entrada' : 'Saída',
        motivo: reason || (isIncrease ? 'Aumento manual do estoque físico' : 'Redução manual do estoque físico'),
        data: new Date().toISOString()
      };
      const updatedLogs = [newLog, ...logs];
      setLogs(updatedLogs);
      saveState('lib_logs', updatedLogs);
    }
    return true;
  };

  const handleDeleteBook = (bookId: string): boolean | string => {
    // Constraint check: "Livro só poderá ser deletado se não houver nenhum exemplar alugado"
    const target = books.find((b) => b.id === bookId);
    if (target && target.alugados > 0) {
      return 'Não é permitido excluir um livro do acervo enquanto houver exemplares físicos alugados.';
    }

    const updated = books.filter((b) => b.id !== bookId);
    setBooks(updated);
    saveState('lib_books', updated);
    return true;
  };

  // Loans application flow logic
  const handleAddLoan = (loan: Emprestimo): boolean | string => {
    // 1. Decrement available quantity and increment rented copies
    const targetBook = books.find((b) => b.id === loan.livroId);
    if (!targetBook) return 'Livro inválido ou removido.';
    if (targetBook.disponiveis < 1) {
      return 'Este livro não possui exemplares físicos livres para empréstimo no estoque.';
    }

    const updatedBooks = books.map((b) => {
      if (b.id === loan.livroId) {
        return {
          ...b,
          alugados: b.alugados + 1,
          disponiveis: b.disponiveis - 1
        };
      }
      return b;
    });

    // Save state
    setBooks(updatedBooks);
    saveState('lib_books', updatedBooks);

    const updatedLoans = [loan, ...loans];
    setLoans(updatedLoans);
    saveState('lib_loans', updatedLoans);

    // Register stock exit log representing outflow
    const newLogId = generateLogId(logs);
    const newLog: LogEstoque = {
      id: newLogId,
      livroId: loan.livroId,
      editoraId: targetBook.editoraId,
      quantidade: 1,
      tipo: 'Saída',
      motivo: `Empréstimo Registrado - Cód: ${loan.id}`,
      data: new Date().toISOString()
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    saveState('lib_logs', updatedLogs);

    return true;
  };

  // Finalize Loan (Return book)
  const handleFinalizeLoan = (loanId: string, returnDate: string): boolean | string => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return 'Ficha de empréstimo não localizada.';

    const targetBook = books.find((b) => b.id === loan.livroId);
    if (!targetBook) return 'O livro original foi removido do catálogo.';

    // Balance books copy statistics back
    const updatedBooks = books.map((b) => {
      if (b.id === loan.livroId) {
        return {
          ...b,
          alugados: Math.max(0, b.alugados - 1),
          disponiveis: Math.min(b.estoqueTotal, b.disponiveis + 1)
        };
      }
      return b;
    });

    setBooks(updatedBooks);
    saveState('lib_books', updatedBooks);

    // Change status of loan
    const updatedLoans = loans.map((l) => {
      if (l.id === loanId) {
        return {
          ...l,
          status: 'Devolvido' as const,
          dataDevolucaoReal: returnDate
        };
      }
      return l;
    });

    setLoans(updatedLoans);
    saveState('lib_loans', updatedLoans);

    // Log stock re-entry
    const newLogId = generateLogId(logs);
    const newLog: LogEstoque = {
      id: newLogId,
      livroId: loan.livroId,
      editoraId: targetBook.editoraId,
      quantidade: 1,
      tipo: 'Entrada',
      motivo: `Devolução Recebida - Empréstimo Referência: ${loan.id}`,
      data: new Date().toISOString()
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    saveState('lib_logs', updatedLogs);

    return true;
  };

  // Manual stock movement entries or exits adjustment
  const handleAddStockTransaction = (
    livroId: string, 
    editoraId: string, 
    quantidade: number, 
    tipo: 'Entrada' | 'Saída', 
    motivo: string
  ): boolean | string => {
    const targetBook = books.find((b) => b.id === livroId);
    if (!targetBook) return 'Livro inválido.';

    let newTotal = targetBook.estoqueTotal;
    let newDisponiveis = targetBook.disponiveis;

    if (tipo === 'Entrada') {
      newTotal += quantidade;
      newDisponiveis += quantidade;
    } else {
      if (targetBook.disponiveis < quantidade) {
        return 'Quantidade de saída de estoque excede as cópias disponíveis no depósito.';
      }
      newTotal -= quantidade;
      newDisponiveis -= quantidade;
    }

    const updatedBooks = books.map((b) => {
      if (b.id === livroId) {
        return {
          ...b,
          estoqueTotal: newTotal,
          disponiveis: newDisponiveis
        };
      }
      return b;
    });

    setBooks(updatedBooks);
    saveState('lib_books', updatedBooks);

    const newLogId = generateLogId(logs);
    const newLog: LogEstoque = {
      id: newLogId,
      livroId,
      editoraId,
      quantidade,
      tipo,
      motivo,
      data: new Date().toISOString()
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    saveState('lib_logs', updatedLogs);

    return true;
  };

  // Shortcuts to automatically swap tabs and open modals
  const triggerQuickLoan = () => {
    setCurrentTab('loans');
    // We delay slightly to let the view render before focusing the trigger or just simulate button click
    setTimeout(() => {
      const btn = document.querySelector('button[id^="btn-add-loan"]');
      if (btn) (btn as HTMLButtonElement).click();
    }, 150);
  };

  const triggerQuickBook = () => {
    setCurrentTab('books');
    // We delay and open modal
    setTimeout(() => {
      const btn = document.querySelector('button[id^="btn-add-book"]');
      if (btn) (btn as HTMLButtonElement).click();
    }, 150);
  };

  const triggerQuickUser = () => {
    setCurrentTab('users');
    setTimeout(() => {
      const btn = document.querySelector('button[id^="btn-add-user"]');
      if (btn) (btn as HTMLButtonElement).click();
    }, 150);
  };

  // Main navigation tab render routers
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView
            users={users}
            books={books}
            publishers={publishers}
            loans={loans}
            logs={logs}
            setCurrentTab={setCurrentTab}
            onQuickLoan={triggerQuickLoan}
            onQuickBook={triggerQuickBook}
            onQuickUser={triggerQuickUser}
          />
        );
      case 'loans':
        return (
          <EmprestimosView
            loans={loans}
            users={users}
            books={books}
            publishers={publishers}
            onAddLoan={handleAddLoan}
            onFinalizeLoan={handleFinalizeLoan}
          />
        );
      case 'books':
        return (
          <LivrosView
            books={books}
            publishers={publishers}
            onAddBook={handleAddBook}
            onUpdateBook={handleUpdateBook}
            onDeleteBook={handleDeleteBook}
            logs={logs}
          />
        );
      case 'publishers':
        return (
          <EditorasView
            publishers={publishers}
            books={books}
            onAddPublisher={handleAddPublisher}
            onUpdatePublisher={handleUpdatePublisher}
            onDeletePublisher={handleDeletePublisher}
          />
        );
      case 'users':
        return (
          <UsuariosView
            users={users}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            loans={loans}
          />
        );
      case 'stock':
        return (
          <EstoqueLogsView
            logs={logs}
            books={books}
            publishers={publishers}
            onAddStockTransaction={handleAddStockTransaction}
          />
        );
      case 'auth':
        return (
          <AuthView
            users={users}
            session={session}
            onLogin={handleLogin}
            onLogout={handleLogout}
          />
        );
      default:
        return <div>Seção não localizada</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none">
      
      {/* Ceará State Banner Accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-green-600 shrink-0"></div>

      {/* Styled Navigation Bar */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        session={session}
        onLogout={handleLogout}
      />

      {/* Main Application Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modern Responsive Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-10 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Government Ceará Badge */}
            <div className="space-y-1.5 text-center md:text-left">
              <span className="font-display font-semibold text-white tracking-wide text-sm block">SISTEMA INTEGRADO DE BIBLIOTECAS</span>
              <p className="text-xs text-slate-450 font-light max-w-sm">
                Projeto estrutural de acompanhamento letivo desenvolvido em consonância com a disciplina de Planejamento e Técnicas de Secretaria de Educação Integral.
              </p>
            </div>

            {/* Links and technical indicators */}
            <div className="flex flex-col items-center md:items-end gap-1.5 text-xs text-slate-400">
              <span className="font-mono text-[10px] tracking-wider uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/10">
                ● Ceará Digital - Seduc 2026
              </span>
              <span className="font-light block">Governo do Estado do Ceará</span>
              <span className="text-[10px] text-slate-550 block font-light">Versão do sistema: 4.8.2 (Estável)</span>
            </div>

          </div>
        </div>
      </footer>
    </div>
  );
}
