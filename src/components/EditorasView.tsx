import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Save, 
  AlertCircle, 
  CheckCircle2,
  Mail,
  Phone,
  BookOpen,
  FileDown
} from 'lucide-react';
import { Editora, Livro } from '../types';
import { exportRelatorioEditoras } from '../utils/pdfGenerator';

interface EditorasViewProps {
  publishers: Editora[];
  books: Livro[];
  onAddPublisher: (pub: Editora) => void;
  onUpdatePublisher: (pub: Editora) => void;
  onDeletePublisher: (pubId: string) => boolean | string; // returns true if ok, or string with error message if contains books
}

export default function EditorasView({
  publishers,
  books,
  onAddPublisher,
  onUpdatePublisher,
  onDeletePublisher,
}: EditorasViewProps) {
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState<Editora | null>(null);

  // Form states
  const [codigoEditora, setCodigoEditora] = useState('');
  const [nomeEditora, setNomeEditora] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

  // Feedback notifications
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Filtered list
  const filteredPublishers = publishers.filter((pub) => 
    pub.nomeEditora.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setEditingPublisher(null);
    setCodigoEditora(`PUB${String(publishers.length + 1).padStart(3, '0')}`);
    setNomeEditora('');
    setEmail('');
    setTelefone('');
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pub: Editora) => {
    setEditingPublisher(pub);
    setCodigoEditora(pub.id);
    setNomeEditora(pub.nomeEditora);
    setEmail(pub.email);
    setTelefone(pub.telefone);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeEditora || !email || !telefone) {
      setAlertMessage({ type: 'error', text: 'Por favor, preencha todos os campos obrigatórios (*).' });
      return;
    }

    const publisherData: Editora = {
      id: codigoEditora,
      nomeEditora,
      email,
      telefone
    };

    if (editingPublisher) {
      onUpdatePublisher(publisherData);
      setAlertMessage({ type: 'success', text: `Editora "${nomeEditora}" atualizada com sucesso!` });
    } else {
      if (publishers.some(p => p.id === codigoEditora)) {
        setAlertMessage({ type: 'error', text: 'Já existe uma editora com este código.' });
        return;
      }
      onAddPublisher(publisherData);
      setAlertMessage({ type: 'success', text: `Editora "${nomeEditora}" cadastrada com sucesso!` });
    }

    setIsModalOpen(false);
    resetForm();
    setTimeout(() => setAlertMessage(null), 4000);
  };

  const handleDelete = (pubId: string, pubName: string) => {
    if (confirm(`Tem certeza de que deseja remover a editora "${pubName}"?`)) {
      const result = onDeletePublisher(pubId);
      if (result === true) {
        setAlertMessage({ type: 'success', text: `Editora "${pubName}" removida com sucesso.` });
      } else {
        setAlertMessage({ type: 'error', text: typeof result === 'string' ? result : 'Não foi possível excluir a editora.' });
      }
      setTimeout(() => setAlertMessage(null), 5500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="font-display font-medium text-2xl text-slate-900 flex items-center space-x-2">
            <Building2 className="h-7 w-7 text-emerald-500" />
            <span>Cadastro & Controle de Editoras</span>
          </h2>
          <p className="text-sm text-slate-500">Cadastre as editoras parceiras para vincular às fofas fichas bibliográficas dos livros.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportRelatorioEditoras(publishers, books)}
            className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5 cursor-pointer"
            title="Exportar Relatório de Editoras em PDF"
          >
            <FileDown className="h-4.5 w-4.5 text-emerald-400" />
            <span>Relatório PDF</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Nova Editora</span>
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
            placeholder="Pesquisar editora por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-slate-50/50"
          />
        </div>
        <div className="text-xs text-slate-400 flex items-center shrink-0">
          Exibindo {filteredPublishers.length} de {publishers.length} editoras registradas
        </div>
      </div>

      {/* Publishers Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPublishers.map((pub) => {
          // Find count of books by this publisher
          const associatedBooksCount = books.filter(b => b.editoraId === pub.id).length;

          return (
            <div 
              key={pub.id} 
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-slate-50 text-slate-800 flex items-center justify-center border border-slate-100">
                      <Building2 className="h-5 w-5 text-emerald-500 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 leading-tight">{pub.nomeEditora}</h4>
                      <span className="text-[10px] font-mono text-slate-400 block font-semibold mt-0.5">{pub.id}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-50 pt-3 text-xs text-slate-650">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{pub.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{pub.telefone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>
                      Possui <strong className="text-slate-850 font-bold">{associatedBooksCount}</strong> {associatedBooksCount === 1 ? 'livro catalogado' : 'livros catalogados'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action layout */}
              <div className="flex items-center justify-end space-x-2 border-t border-slate-50 mt-4 pt-3">
                <button
                  onClick={() => handleOpenEditModal(pub)}
                  className="flex items-center space-x-1 text-slate-650 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(pub.id, pub.nomeEditora)}
                  className="flex items-center space-x-1 text-slate-650 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredPublishers.length === 0 && (
          <div className="col-span-full bg-slate-50 p-10 text-center rounded-2xl border border-dashed border-slate-200">
            <Building2 className="h-10 w-10 text-slate-350 mx-auto mb-2" />
            <span className="text-sm text-slate-500 font-light block">Nenhuma editora cadastrada coincide com os critérios de busca.</span>
          </div>
        )}
      </div>

      {/* Editora Creation/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5.5 w-5.5 text-emerald-400" />
                <h3 className="font-display font-medium text-lg">
                  {editingPublisher ? 'Editar Informações da Editora' : 'Cadastrar Nova Editora'}
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
                
                {/* ID/Code representation */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Código da Editora *</label>
                  <input
                    type="text"
                    value={codigoEditora}
                    onChange={(e) => setCodigoEditora(e.target.value)}
                    disabled={editingPublisher !== null}
                    placeholder="Ex: PUB005"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50 text-sm font-mono"
                  />
                </div>

                {/* Nome da Editora */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Nome da Editora *</label>
                  <input
                    type="text"
                    value={nomeEditora}
                    onChange={(e) => setNomeEditora(e.target.value)}
                    placeholder="Ex: Companhia das Letras, etc."
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                {/* E-mail */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">E-mail de Contato *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: contato@editora.com.br"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                {/* Telefone */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Telefone Comercial *</label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="Ex: (11) 3211-5050"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono"
                  />
                </div>

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
                  <span>{editingPublisher ? 'Salvar Alterações' : 'Cadastrar Editora'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
