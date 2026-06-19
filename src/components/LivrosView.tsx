import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Save, 
  AlertCircle, 
  CheckCircle2,
  Calendar,
  Layers,
  Building2,
  Hash,
  Boxes,
  Lock,
  ArrowRightLeft,
  FileDown
} from 'lucide-react';
import { Livro, Editora, LogEstoque } from '../types';
import { exportRelatorioLivros } from '../utils/pdfGenerator';

interface LivrosViewProps {
  books: Livro[];
  publishers: Editora[];
  onAddBook: (book: Livro, reason: string) => void;
  onUpdateBook: (book: Livro, reason: string) => boolean | string;
  onDeleteBook: (bookId: string) => boolean | string;
  logs: LogEstoque[];
}

export default function LivrosView({
  books,
  publishers,
  onAddBook,
  onUpdateBook,
  onDeleteBook,
  logs,
}: LivrosViewProps) {
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Livro | null>(null);

  // Form states
  const [bookId, setBookId] = useState('');
  const [nomeLivro, setNomeLivro] = useState('');
  const [autor, setAutor] = useState('');
  const [editoraId, setEditoraId] = useState('');
  const [anoPublicacao, setAnoPublicacao] = useState('');
  const [isbn, setIsbn] = useState('');
  const [categoria, setCategoria] = useState('');
  const [estoqueTotal, setEstoqueTotal] = useState<number>(1);
  const [motivoMovimentacao, setMotivoMovimentacao] = useState('Atualização cadastral');

  // Feedback notifications
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Filtered books list based on search params:
  // "Pesquisar livro por nome, autor, editora e data de lançamento (ano de publicacao)"
  const filteredBooks = books.filter((book) => {
    const publisher = publishers.find(p => p.id === book.editoraId);
    const publisherName = publisher ? publisher.nomeEditora.toLowerCase() : '';
    
    const searchLower = searchTerm.toLowerCase();
    
    return (
      book.nomeLivro.toLowerCase().includes(searchLower) ||
      book.autor.toLowerCase().includes(searchLower) ||
      book.anoPublicacao.includes(searchLower) ||
      publisherName.includes(searchLower)
    );
  });

  const resetForm = () => {
    setEditingBook(null);
    setBookId(`LIV${String(books.length + 1).padStart(3, '0')}`);
    setNomeLivro('');
    setAutor('');
    setEditoraId(publishers[0]?.id || '');
    setAnoPublicacao('');
    setIsbn('');
    setCategoria('Literatura Clássica');
    setEstoqueTotal(5);
    setMotivoMovimentacao('Ajuste de estoque inicial');
  };

  const handleOpenCreateModal = () => {
    if (publishers.length === 0) {
      setAlertMessage({ type: 'error', text: 'Por favor, cadastre ao menos uma editora antes de adicionar livros!' });
      setTimeout(() => setAlertMessage(null), 6000);
      return;
    }
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book: Livro) => {
    setEditingBook(book);
    setBookId(book.id);
    setNomeLivro(book.nomeLivro);
    setAutor(book.autor);
    setEditoraId(book.editoraId);
    setAnoPublicacao(book.anoPublicacao);
    setIsbn(book.isbn);
    setCategoria(book.categoria);
    setEstoqueTotal(book.estoqueTotal);
    setMotivoMovimentacao('Atualização do acervo disponível');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeLivro || !autor || !editoraId || !anoPublicacao || !isbn) {
      setAlertMessage({ type: 'error', text: 'Por favor, preencha todos os campos obrigatórios (*).' });
      return;
    }

    if (estoqueTotal < 1) {
      setAlertMessage({ type: 'error', text: 'O estoque total deve ser positivo.' });
      return;
    }

    // Checking validation helper:
    // "Editar livro (estoque só poderá ser editado para uma quantidade maior ou igual a quantidade alugada)"
    const rentedCount = editingBook ? editingBook.alugados : 0;
    if (estoqueTotal < rentedCount) {
      setAlertMessage({ 
        type: 'error', 
        text: `Erro de Estoque: O estoque total não pode ser menor que a quantidade atualmente alugada (${rentedCount} exemplares alugados no momento).` 
      });
      return;
    }

    const bookData: Livro = {
      id: bookId,
      nomeLivro,
      autor,
      editoraId,
      anoPublicacao,
      isbn,
      categoria,
      estoqueTotal,
      alugados: rentedCount,
      disponiveis: estoqueTotal - rentedCount
    };

    if (editingBook) {
      const result = onUpdateBook(bookData, motivoMovimentacao);
      if (result === true) {
        setAlertMessage({ type: 'success', text: `Livro "${nomeLivro}" atualizado com sucesso!` });
        setIsModalOpen(false);
      } else {
        setAlertMessage({ type: 'error', text: typeof result === 'string' ? result : 'Não foi possível atualizar o livro.' });
      }
    } else {
      if (books.some(b => b.id === bookId)) {
        setAlertMessage({ type: 'error', text: 'Já existe um livro cadastrado com este código.' });
        return;
      }
      onAddBook(bookData, motivoMovimentacao || 'Cadastro primário');
      setAlertMessage({ type: 'success', text: `Livro "${nomeLivro}" catalogado com sucesso!` });
      setIsModalOpen(false);
    }

    setTimeout(() => setAlertMessage(null), 5500);
  };

  const handleDelete = (bookId: string, bookName: string) => {
    if (confirm(`Tem certeza de que deseja excluir o livro "${bookName}"?`)) {
      const result = onDeleteBook(bookId);
      if (result === true) {
        setAlertMessage({ type: 'success', text: `Livro "${bookName}" removido do catálogo com sucesso.` });
      } else {
        setAlertMessage({ type: 'error', text: typeof result === 'string' ? result : 'Não foi possível excluir o livro.' });
      }
      setTimeout(() => setAlertMessage(null), 6000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="font-display font-medium text-2xl text-slate-900 flex items-center space-x-2">
            <BookOpen className="h-7 w-7 text-emerald-500" />
            <span>Cadastro & Acervo de Livros</span>
          </h2>
          <p className="text-sm text-slate-500">Gerencie o acervo da biblioteca, organize categorias, ISBN e ajuste o estoque fisico.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportRelatorioLivros(books, publishers)}
            className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5 cursor-pointer"
            title="Exportar Catálogo de Livros em PDF"
          >
            <FileDown className="h-4.5 w-4.5 text-emerald-400" />
            <span>Relatório PDF</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Cadastrar Novo Livro</span>
          </button>
        </div>
      </div>

      {/* Notifications Alert */}
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

      {/* Filter and Search Section */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar por título, autor, editora ou ano de publicação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-slate-50/50"
          />
        </div>
        <div className="text-xs text-slate-400 flex items-center shrink-0">
          Exibindo {filteredBooks.length} de {books.length} livros catalogados
        </div>
      </div>

      {/* Books Display List (Bento Grid Style Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredBooks.map((book) => {
          const publisher = publishers.find(p => p.id === book.editoraId);
          const isLentOut = book.alugados > 0;

          return (
            <div 
              key={book.id} 
              className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              {/* Upper Header section of the book cover widget */}
              <div className="p-5 flex-1 space-y-4">
                
                <div className="flex start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{book.categoria}</span>
                    <h3 className="font-semibold text-base text-slate-900 mt-1">{book.nomeLivro}</h3>
                    <p className="text-xs text-slate-500 italic">Por: <span className="text-slate-700 font-medium not-italic">{book.autor}</span></p>
                  </div>
                  
                  {/* Visual mini-indicator */}
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-1 h-fit shrink-0 rounded font-bold">
                    {book.id}
                  </span>
                </div>

                {/* Attributes specs container */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <div className="truncate">
                      <span className="text-[9px] text-slate-400 block uppercase font-medium">Editora</span>
                      <span className="text-slate-700 font-medium truncate block">{publisher ? publisher.nomeEditora : 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-medium">Ano Publ.</span>
                      <span className="text-slate-700 font-medium font-mono">{book.anoPublicacao}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Hash className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-medium">ISBN</span>
                      <span className="text-slate-700 font-mono text-[11px] font-medium">{book.isbn}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Boxes className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-medium">Editora cód</span>
                      <span className="text-slate-700 font-mono truncate block">{book.editoraId}</span>
                    </div>
                  </div>
                </div>

                {/* Stock Controls Monitor values */}
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-slate-100/50 p-2 rounded-xl border border-slate-200/50">
                    <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wide block">Estoque</span>
                    <span className="text-base font-bold text-slate-800 font-mono block">{book.estoqueTotal}</span>
                  </div>
                  <div className="bg-emerald-50/50 p-2 rounded-xl border border-emerald-100/50">
                    <span className="text-[9px] font-medium text-emerald-600 uppercase tracking-wide block">Disponíveis</span>
                    <span className="text-base font-bold text-emerald-700 font-mono block">{book.disponiveis}</span>
                  </div>
                  <div className={`${isLentOut ? 'bg-amber-50/70 border-amber-100/70' : 'bg-slate-50 p-2'} p-2 rounded-xl border border-slate-100`}>
                    <span className={`text-[9px] font-medium uppercase tracking-wide block ${isLentOut ? 'text-amber-600' : 'text-slate-400'}`}>Alugados</span>
                    <span className={`text-base font-bold font-mono block ${isLentOut ? 'text-amber-700 font-bold' : 'text-slate-500'}`}>{book.alugados}</span>
                  </div>
                </div>

              </div>

              {/* Action layout footer */}
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                {/* Dynamic alert text if rented */}
                {isLentOut ? (
                  <span className="text-[10px] text-amber-600 flex items-center space-x-1 font-medium bg-amber-50 border border-amber-100/50 px-2 py-0.5 rounded-md">
                    <Lock className="h-3 w-3 shrink-0" />
                    <span>{book.alugados} alugados (bloqueio de exclusão)</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-600 flex items-center space-x-1 font-medium bg-emerald-50 border border-emerald-100/30 px-2 py-0.5 rounded-md">
                    <span>Livre para exclusão</span>
                  </span>
                )}

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEditModal(book)}
                    className="flex items-center space-x-1 text-slate-650 hover:text-emerald-600 bg-white border border-slate-200/60 hover:bg-emerald-50 hover:border-emerald-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(book.id, book.nomeLivro)}
                    className="flex items-center space-x-1 text-slate-650 hover:text-rose-600 bg-white border border-slate-200/60 hover:bg-rose-50 hover:border-rose-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}

        {filteredBooks.length === 0 && (
          <div className="col-span-full bg-slate-50 p-10 text-center rounded-2xl border border-dashed border-slate-200">
            <BookOpen className="h-10 w-10 text-slate-350 mx-auto mb-2" />
            <span className="text-sm text-slate-500 font-light block">Nenhum livro catalogado coincide com os termos buscados.</span>
          </div>
        )}
      </div>

      {/* Book Registration / Edit Modal component */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5.5 w-5.5 text-emerald-400" />
                <h3 className="font-display font-medium text-lg">
                  {editingBook ? 'Editar Ficha do Livro' : 'Catalogar Novo Livro'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-4">
                
                {/* Book Code representation */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Código do Livro *</label>
                    <input
                      type="text"
                      value={bookId}
                      onChange={(e) => setBookId(e.target.value)}
                      disabled={editingBook !== null}
                      placeholder="Ex: LIV005"
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Ano de Publicação *</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={anoPublicacao}
                      onChange={(e) => setAnoPublicacao(e.target.value)}
                      placeholder="Ex: 2018, 1997"
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Título do Livro *</label>
                  <input
                    type="text"
                    value={nomeLivro}
                    onChange={(e) => setNomeLivro(e.target.value)}
                    placeholder="Ex: Dom Casmurro"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                {/* Author Selection */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Autor / Escritor *</label>
                  <input
                    type="text"
                    value={autor}
                    onChange={(e) => setAutor(e.target.value)}
                    placeholder="Ex: Machado de Assis"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                {/* ISBN & Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">ISBN *</label>
                    <input
                      type="text"
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
                      placeholder="Ex: 97885012..."
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Categoria *</label>
                    <select
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                    >
                      <option value="Literatura Clássica">Literatura Clássica</option>
                      <option value="Fantasia / Aventura">Fantasia / Aventura</option>
                      <option value="Tecnologia / Eletrônica">Tecnologia / Eletrônica</option>
                      <option value="Ciências / Didáticos">Ciências / Didáticos</option>
                      <option value="Fábula / Literatura Juvenil">Fábula / Literatura Juvenil</option>
                      <option value="Biografia / História">Biografia / História</option>
                    </select>
                  </div>
                </div>

                {/* Publisher Integrity Bind selection */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Editora Responsável *</label>
                  <select
                    value={editoraId}
                    onChange={(e) => setEditoraId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                  >
                    {publishers.map((pub) => (
                      <option key={pub.id} value={pub.id}>{pub.nomeEditora} ({pub.id})</option>
                    ))}
                  </select>
                </div>

                {/* Stock Controls with constraints notice */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-1.5">
                    <Boxes className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Controle Físico de Estoque</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-650 block mb-1">Estoque Total Físico *</label>
                      <input
                        type="number"
                        min={editingBook ? editingBook.alugados : 1}
                        value={estoqueTotal}
                        onChange={(e) => setEstoqueTotal(parseInt(e.target.value) || 0)}
                        required
                        className="w-full p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
                      />
                    </div>
                    
                    {/* Exibe indicativo de alugados em edição */}
                    {editingBook && (
                      <div className="text-xs text-slate-500">
                        <span className="block font-medium">Situação Atual:</span>
                        <span className="block font-semibold">Alugados: {editingBook.alugados} exemplares</span>
                        <span className="block text-[10px] text-slate-400">Novo mínimo de estoque total do livro.</span>
                      </div>
                    )}
                  </div>

                  {editingBook && (
                    <div className="text-[11px] bg-amber-50 text-amber-850 p-2 rounded-lg border border-amber-100/30">
                      <strong>Regra do Estoque:</strong> O estoque físico total não pode ser reduzido para valores inferiores a {editingBook.alugados} devido a empréstimos pendentes.
                    </div>
                  )}

                  {/* Motivo de Alteração / entrada saida log track */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-650 block mb-1">Motivo da Nova Entrada/Ajuste *</label>
                    <input
                      type="text"
                      value={motivoMovimentacao}
                      onChange={(e) => setMotivoMovimentacao(e.target.value)}
                      placeholder="Ex: Aquisição de novas cópias pela diretoria"
                      required
                      className="w-full p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                    />
                  </div>
                </div>

              </div>

              {/* Action operations in footer of modal */}
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
                  className="flex items-center space-x-1.5 px-5 py-2 text-slate-950 bg-emerald-500 hover:bg-emerald-600 font-bold rounded-xl text-xs transition-all shadow-md"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingBook ? 'Salvar Ficha' : 'Catalogar Livro'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
