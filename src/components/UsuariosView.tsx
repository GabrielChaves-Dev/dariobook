import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Save, 
  Briefcase, 
  GraduationCap, 
  Award,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle2,
  Check,
  FileDown
} from 'lucide-react';
import { Usuario, Emprestimo } from '../types';
import { exportRelatorioUsuarios } from '../utils/pdfGenerator';

interface UsuariosViewProps {
  users: Usuario[];
  onAddUser: (user: Usuario) => void;
  onUpdateUser: (user: Usuario) => void;
  onDeleteUser: (userId: string) => boolean | string; // returns true if deleted, string with error if blocked
  loans: Emprestimo[];
}

export default function UsuariosView({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  loans,
}: UsuariosViewProps) {
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);

  // Form states
  const [userId, setUserId] = useState('');
  const [matricula, setMatricula] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [funcao, setFuncao] = useState<'Estudante' | 'Professor' | 'Funcionário'>('Estudante');
  const [curso, setCurso] = useState('');
  const [serie, setSerie] = useState('');
  const [cpf, setCpf] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('Fortaleza');
  const [uf, setUf] = useState('CE');

  // Feedback notifications
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Filtered users list
  const filteredUsers = users.filter((user) => 
    user.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setEditingUser(null);
    setUserId(`USR${String(users.length + 1).padStart(3, '0')}`);
    setMatricula('');
    setNome('');
    setEmail('');
    setTelefone('');
    setFuncao('Estudante');
    setCurso('');
    setSerie('');
    setCpf('');
    setRua('');
    setNumero('');
    setBairro('');
    setCidade('Fortaleza');
    setUf('CE');
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: Usuario) => {
    setEditingUser(user);
    setUserId(user.id);
    setMatricula(user.matricula);
    setNome(user.nome);
    setEmail(user.email);
    setTelefone(user.telefone);
    setFuncao(user.funcao);
    setCurso(user.curso);
    setSerie(user.serie);
    setCpf(user.cpf);
    setRua(user.endereco.rua);
    setNumero(user.endereco.numero);
    setBairro(user.endereco.bairro);
    setCidade(user.endereco.cidade);
    setUf(user.endereco.uf);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !matricula || !email || !cpf || !telefone) {
      setAlertMessage({ type: 'error', text: 'Por favor, preencha todos os campos obrigatórios (*).' });
      return;
    }

    const userData: Usuario = {
      id: userId,
      matricula,
      nome,
      email,
      telefone,
      funcao,
      curso,
      serie,
      cpf,
      endereco: {
        rua,
        numero,
        bairro,
        cidade,
        uf
      }
    };

    if (editingUser) {
      onUpdateUser(userData);
      setAlertMessage({ type: 'success', text: `Usuário "${nome}" atualizado com sucesso!` });
    } else {
      // Check if code or matricula already exists
      if (users.some(u => u.id === userId)) {
        setAlertMessage({ type: 'error', text: 'Já existe um usuário com este código.' });
        return;
      }
      onAddUser(userData);
      setAlertMessage({ type: 'success', text: `Usuário "${nome}" registrado com sucesso!` });
    }

    setIsModalOpen(false);
    resetForm();
    setTimeout(() => setAlertMessage(null), 4000);
  };

  const handleDelete = (userId: string, userName: string) => {
    if (confirm(`Tem certeza de que deseja excluir o usuário "${userName}"?`)) {
      const result = onDeleteUser(userId);
      if (result === true) {
        setAlertMessage({ type: 'success', text: `Usuário "${userName}" excluído com sucesso.` });
      } else {
        setAlertMessage({ type: 'error', text: typeof result === 'string' ? result : 'Não foi possível excluir o usuário.' });
      }
      setTimeout(() => setAlertMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="font-display font-medium text-2xl text-slate-900 flex items-center space-x-2">
            <Users className="h-7 w-7 text-emerald-500" />
            <span>Cadastro & Gestão de Usuários</span>
          </h2>
          <p className="text-sm text-slate-500">Cadastre e edite as informações de estudantes, professores e funcionários.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportRelatorioUsuarios(users)}
            className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5 cursor-pointer"
            title="Exportar Diretório de Usuários em PDF"
          >
            <FileDown className="h-4.5 w-4.5 text-emerald-400" />
            <span>Relatório PDF</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Cadastrar Usuário</span>
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
            placeholder="Pesquisar usuário por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-slate-50/50"
          />
        </div>
        <div className="text-xs text-slate-400 flex items-center shrink-0">
          Exibindo {filteredUsers.length} de {users.length} usuários
        </div>
      </div>

      {/* Users Grid Card List / Responsive Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredUsers.map((user) => {
          // Check for active loans count
          const userActiveLoans = loans.filter((l) => l.usuarioId === user.id && l.status === 'Ativo');

          return (
            <div 
              key={user.id} 
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm tracking-tight border border-emerald-100">
                      {user.nome.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 leading-tight">{user.nome}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[10px] font-mono text-slate-400 block font-semibold">{user.id}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-650 px-2 py-0.5 rounded-full font-medium">Matrícula: {user.matricula}</span>
                      </div>
                    </div>
                  </div>

                  {/* Badge representing role */}
                  <span className={`text-[10px] uppercase font-bold py-1 px-2.5 rounded-full ${
                    user.funcao === 'Estudante' ? 'bg-sky-50 text-sky-700' :
                    user.funcao === 'Professor' ? 'bg-amber-50 text-amber-700' :
                    'bg-purple-50 text-purple-700'
                  }`}>
                    {user.funcao}
                  </span>
                </div>

                {/* Grid attributes */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-2 mt-4 pt-3 border-t border-slate-50 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">E-mail</span>
                    <span className="text-slate-700 font-light truncate block" title={user.email}>{user.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Celular</span>
                    <span className="text-slate-700 font-light font-mono block">{user.telefone}</span>
                  </div>
                  {user.funcao === 'Estudante' && (
                    <>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-medium">Curso</span>
                        <span className="text-slate-700 font-light">{user.curso || 'Não inf.'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-medium">Série</span>
                        <span className="text-slate-700 font-light">{user.serie || 'Não inf.'}</span>
                      </div>
                    </>
                  )}
                  {user.funcao === 'Professor' && (
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Departamento</span>
                      <span className="text-slate-700 font-light truncate block">{user.curso || 'Docência'}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">CPF</span>
                    <span className="text-slate-700 font-light font-mono block">{user.cpf}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Empréstimos Ativos</span>
                    <span className={`font-semibold font-mono ${userActiveLoans.length > 0 ? 'text-amber-600 font-bold' : 'text-slate-500'}`}>
                      {userActiveLoans.length} {userActiveLoans.length === 1 ? 'livro' : 'livros'}
                    </span>
                  </div>
                </div>

                {/* Collapsible/small address badge */}
                <div className="mt-3 p-2 bg-slate-50 rounded-xl flex items-start space-x-1.5 text-[11px] text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <span className="truncate">
                    {user.endereco.rua}, {user.endereco.numero} - {user.endereco.bairro}, {user.endereco.cidade}/{user.endereco.uf}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end space-x-2 border-t border-slate-50 mt-4 pt-3">
                <button
                  onClick={() => handleOpenEditModal(user)}
                  className="flex items-center space-x-1 text-slate-650 hover:text-emerald-600 bg-slate-100/50 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(user.id, user.nome)}
                  className="flex items-center space-x-1 text-slate-650 hover:text-rose-600 bg-slate-100/50 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="col-span-full bg-slate-50 p-10 text-center rounded-2xl border border-dashed border-slate-200">
            <Users className="h-10 w-10 text-slate-350 mx-auto mb-2" />
            <span className="text-sm text-slate-500 font-light block">Nenhum usuário coincide com sua pesquisa.</span>
          </div>
        )}
      </div>

      {/* Create / Edit Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <Users className="h-5.5 w-5.5 text-emerald-400" />
                <h3 className="font-display font-medium text-lg">
                  {editingUser ? 'Editar Dados do Usuário' : 'Novo Cadastro de Usuário'}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* ID/Code representation */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Código do Usuário</label>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    disabled={editingUser !== null}
                    placeholder="Ex: USR005"
                    className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50 disabled:text-slate-455 text-sm"
                  />
                </div>

                {/* Matricula input */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Matrícula *</label>
                  <input
                    type="text"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    placeholder="Ex: 20241029..."
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                {/* Nome input */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome e sobrenome"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                {/* Email input */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">E-mail *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: nome@escola.ce.gov.br"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                {/* Telefone input */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Telefone / Celular *</label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="Ex: (85) 98765-4321"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                {/* Função selection */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Função *</label>
                  <select
                    value={funcao}
                    onChange={(e) => setFuncao(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                  >
                    <option value="Estudante">Estudante</option>
                    <option value="Professor">Professor</option>
                    <option value="Funcionário">Funcionário</option>
                  </select>
                </div>

                {/* CPF input */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">CPF *</label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="Ex: 000.000.000-00"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                {/* Conditional course and grade inputs */}
                {funcao === 'Estudante' ? (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Curso / Técnico</label>
                      <input
                        type="text"
                        value={curso}
                        onChange={(e) => setCurso(e.target.value)}
                        placeholder="Ex: Informática"
                        className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Série / Turno</label>
                      <input
                        type="text"
                        value={serie}
                        onChange={(e) => setSerie(e.target.value)}
                        placeholder="Ex: 3º Ano - Técnico"
                        className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      />
                    </div>
                  </>
                ) : (
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      {funcao === 'Professor' ? 'Área / Departamento' : 'Setor Acadêmico'}
                    </label>
                    <input
                      type="text"
                      value={curso}
                      onChange={(e) => setCurso(e.target.value)}
                      placeholder={funcao === 'Professor' ? "Ex: Linguagens e Códigos" : "Ex: Secretaria, Direção, etc."}
                      className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Endereço Title header inside form */}
              <div className="pt-3 border-t border-slate-100 flex items-center space-x-1.5 text-slate-800">
                <MapPin className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider">Endereço do Usuário (Obrigatório)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-650 block mb-1">Rua / Logradouro *</label>
                  <input
                    type="text"
                    value={rua}
                    onChange={(e) => setRua(e.target.value)}
                    placeholder="Ex: Av. Afonso Albuquerque Lima"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-650 block mb-1">Número / Apt *</label>
                  <input
                    type="text"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    placeholder="Ex: 50, s/n"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-650 block mb-1">Bairro *</label>
                  <input
                    type="text"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    placeholder="Ex: Cambeba"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-650 block mb-1">Cidade *</label>
                  <input
                    type="text"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="Ex: Fortaleza"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-650 block mb-1">Estado / UF *</label>
                  <input
                    type="text"
                    value={uf}
                    onChange={(e) => setUf(e.target.value)}
                    maxLength={2}
                    placeholder="CE"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm uppercase"
                  />
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
                  <span>{editingUser ? 'Atualizar' : 'Registrar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
