import React, { useState } from 'react';
import { 
  Boxes, 
  Search, 
  Plus, 
  X, 
  Save, 
  ArrowRightLeft, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Building2,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileDown
} from 'lucide-react';
import { LogEstoque, Livro, Editora } from '../types';
import { exportRelatorioEstoque } from '../utils/pdfGenerator';

interface EstoqueLogsViewProps {
  logs: LogEstoque[];
  books: Livro[];
  publishers: Editora[];
  onAddStockTransaction: (livroId: string, editoraId: string, quantidade: number, tipo: 'Entrada' | 'Saída', motivo: string) => boolean | string;
}

export default function EstoqueLogsView({
  logs,
  books,
  publishers,
  onAddStockTransaction,
}: EstoqueLogsViewProps) {
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<'Todos' | 'Entrada' | 'Saída'>('Todos');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [livroId, setLivroId] = useState('');
  const [quantidade, setQuantidade] = useState<number>(1);
  const [tipo, setTipo] = useState<'Entrada' | 'Saída'>('Entrada');
  const [motivo, setMotivo] = useState('');

  // Alerts
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const resetForm = () => {
    setLivroId(books[0]?.id || '');
    setQuantidade(1);
    setTipo('Entrada');
    setMotivo('');
  };

  const handleOpenModal = () => {
    if (books.length === 0) {
      setAlertMessage({ type: 'error', text: 'Você precisa catalogar livros no sistema antes de gerenciar movimentações de estoque!' });
      setTimeout(() => setAlertMessage(null), 5000);
      return;
    }
    resetForm();
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!livroId || quantidade <= 0 || !motivo) {
      setAlertMessage({ type: 'error', text: 'Por favor, preencha todos os campos obrigatórios (*).' });
      return;
    }

    const selectedBook = books.find(b => b.id === livroId);
    if (!selectedBook) return;

    if (tipo === 'Saída' && selectedBook.disponiveis < quantidade) {
      setAlertMessage({ 
        type: 'error', 
        text: `Erro de Estoque: A quantidade de saída de cópias (${quantidade}) não pode ser maior do que a quantidade disponível no estoque físico (${selectedBook.disponiveis} disponíveis).` 
      });
      return;
    }

    const res = onAddStockTransaction(livroId, selectedBook.editoraId, quantidade, tipo, motivo);
    if (res === true) {
      setAlertMessage({ type: 'success', text: `Movimentação de ${tipo === 'Entrada' ? 'Entrada' : 'Saída'} registrada com sucesso!` });
      setIsModalOpen(false);
    } else {
      setAlertMessage({ type: 'error', text: typeof res === 'string' ? res : 'Erro ao salvar movimentação.' });
    }

    setTimeout(() => setAlertMessage(null), 5500);
  };

  // Filtered logs
  const filteredLogs = logs.filter((log) => {
    const book = books.find((b) => b.id === log.livroId);
    const publisher = publishers.find((p) => p.id === log.editoraId);

    const bookTitle = book ? book.nomeLivro.toLowerCase() : '';
    const publisherName = publisher ? publisher.nomeEditora.toLowerCase() : '';
    const motivoText = log.motivo.toLowerCase();

    const matchesSearch = 
      bookTitle.includes(searchTerm.toLowerCase()) ||
      publisherName.includes(searchTerm.toLowerCase()) ||
      motivoText.includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.livroId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTipo = 
      tipoFilter === 'Todos' || log.tipo === tipoFilter;

    return matchesSearch && matchesTipo;
  }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="font-display font-medium text-2xl text-slate-900 flex items-center space-x-2">
            <Boxes className="h-7 w-7 text-emerald-500" />
            <span>Controle de Estoque & Movimentações</span>
          </h2>
          <p className="text-sm text-slate-500">Monitore as entradas e saídas físicas do acervo e registre manualmente ajustes de estoque.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportRelatorioEstoque(logs, books)}
            className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5 cursor-pointer"
            title="Exportar Livro de Tombo / Movimentações em PDF"
          >
            <FileDown className="h-4.5 w-4.5 text-emerald-400" />
            <span>Relatório PDF</span>
          </button>

          <button
            onClick={handleOpenModal}
            className="flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5 cursor-pointer"
          >
            <ArrowRightLeft className="h-4.5 w-4.5" />
            <span>Registrar Movimentação</span>
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

      {/* Toggles and Searches */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
        
        {/* Toggle Filter by Type */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
          <div className="flex space-x-1">
            <button
              onClick={() => setTipoFilter("Todos")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                tipoFilter === 'Todos' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-200/50'
              }`}
            >
              Todos os Lançamentos
            </button>
            <button
              onClick={() => setTipoFilter("Entrada")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1 ${
                tipoFilter === 'Entrada' ? 'bg-emerald-550 text-slate-950 shadow-xs' : 'text-slate-500 hover:bg-slate-200/50'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5 text-emerald-900" />
              <span>Entradas (Novas Cópias)</span>
            </button>
            <button
              onClick={() => setTipoFilter("Saída")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1 ${
                tipoFilter === 'Saída' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-200/50'
              }`}
            >
              <TrendingDown className="h-3.5 w-3.5 text-white" />
              <span>Saídas (Baixas / Danos)</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            Total logs: {filteredLogs.length} transações mostradas
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar logs por título do livro, editora, motivo ou ID da transação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-slate-50/50"
          />
        </div>
      </div>

      {/* Mobile-Friendly list and table view for desk logs */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-slate-700">
            <thead>
              <tr className="bg-slate-900 text-white font-display text-xs tracking-wider uppercase border-b border-slate-800">
                <th className="py-4 px-5">Cód Estoque</th>
                <th className="py-4 px-5">Livro & Editora</th>
                <th className="py-4 px-5">Tipo</th>
                <th className="py-4 px-5 text-center">Qtd Lançamento</th>
                <th className="py-4 px-5">Justificativa / Motivo</th>
                <th className="py-4 px-5 text-right font-mono">Data do Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLogs.map((log) => {
                const book = books.find((b) => b.id === log.livroId);
                const publisher = publishers.find((p) => p.id === log.editoraId);

                return (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-5 font-mono font-bold text-slate-850">
                      {log.id}
                    </td>
                    <td className="py-3 px-5">
                      <div className="font-semibold text-slate-900 flex items-center space-x-1">
                        <BookOpen className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{book ? book.nomeLivro : 'Livro Removido'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center space-x-1">
                        <Building2 className="h-3 w-3" />
                        <span>Editora: {publisher ? publisher.nomeEditora : 'N/A'} (ID: {log.editoraId})</span>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      {log.tipo === 'Entrada' ? (
                        <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold">
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Entrada</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full font-bold">
                          <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
                          <span>Saída</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-5 text-center font-bold font-mono">
                      {log.quantidade}
                    </td>
                    <td className="py-3 px-5 font-light text-slate-650 max-w-xs truncate" title={log.motivo}>
                      {log.motivo}
                    </td>
                    <td className="py-3 px-5 text-right font-mono text-slate-400 shrink-0">
                      {new Date(log.data).toLocaleDateString('pt-BR')} {new Date(log.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 bg-slate-50/50 text-slate-400">
                    Nenhuma transação de estoque catalogada para as condições.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Stock Adjust Entry Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <Boxes className="h-5.5 w-5.5 text-emerald-400" />
                <h3 className="font-display font-medium text-lg">
                  Registrar Ajuste de Estoque
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              
              {/* SELECT LIVRO */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Selecionar Livro correspondente *</label>
                <select
                  value={livroId}
                  onChange={(e) => setLivroId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                >
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nomeLivro} ({b.id}) - {b.disponiveis} un disponíveis
                    </option>
                  ))}
                </select>
              </div>

              {/* TIPO: ENTRADA OU SAÍDA */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Tipo de Lançamento *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTipo('Entrada')}
                    className={`flex items-center justify-center space-x-1.5 p-2.5 rounded-xl border font-semibold text-xs transition-colors ${
                      tipo === 'Entrada' 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
                        : 'border-slate-200 text-slate-500'
                    }`}
                  >
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <span>Entrada (Acrescentar)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipo('Saída')}
                    className={`flex items-center justify-center space-x-1.5 p-2.5 rounded-xl border font-semibold text-xs transition-colors ${
                      tipo === 'Saída' 
                        ? 'bg-rose-50 border-rose-500 text-rose-800' 
                        : 'border-slate-200 text-slate-500'
                    }`}
                  >
                    <TrendingDown className="h-4 w-4 text-rose-600" />
                    <span>Saída (Subtrair)</span>
                  </button>
                </div>
              </div>

              {/* QUANTIDADE */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Quantidade de Cópias *</label>
                <input
                  type="number"
                  min={1}
                  value={quantidade}
                  onChange={(e) => setQuantidade(parseInt(e.target.value) || 0)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
                />
              </div>

              {/* MOTIVO */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Justificativa / Motivo da Operação *</label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ex: Doação parlamentar de exemplares ou perda física de cópia danificada."
                  required
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              {/* Action buttons inside footer */}
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
                  <span>Gravar e Atualizar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
