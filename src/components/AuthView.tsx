import React, { useState } from 'react';
import { 
  LogIn, 
  UserCheck, 
  Lock, 
  Mail, 
  Key, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  Users,
  UserPlus
} from 'lucide-react';
import { Usuario, AuthSession } from '../types';

interface AuthViewProps {
  users: Usuario[];
  session: AuthSession;
  onLogin: (nome: string, email: string) => void;
  onLogout: () => void;
}

export default function AuthView({
  users,
  session,
  onLogin,
  onLogout,
}: AuthViewProps) {
  // Login form status representation
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Notifications
  const [alert, setAlert] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !senha) {
      setAlert({ type: 'error', text: 'Por favor, digite seu e-mail e senha de login.' });
      return;
    }

    // Authenticate: let's match any user by email on default credentials OR check secret admin
    if (email.toLowerCase() === 'admin@escola.ce.gov.br' && senha === 'admin123') {
      onLogin('Administrador Seduc', 'admin@escola.ce.gov.br');
      setAlert({ type: 'success', text: 'Autenticado com sucesso! Perfil: Administrador.' });
      setTimeout(() => setAlert(null), 3000);
      return;
    }

    const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (matchedUser) {
      onLogin(matchedUser.nome, matchedUser.email);
      setAlert({ type: 'success', text: `Autenticado com sucesso! Bem-vindo, ${matchedUser.nome} (${matchedUser.funcao}).` });
    } else {
      setAlert({ type: 'error', text: 'Credenciais inválidas. Use "admin@escola.ce.gov.br" com a senha "admin123" ou teste um dos e-mails de usuários cadastrados!' });
    }
    setTimeout(() => setAlert(null), 4500);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !senha) {
      setAlert({ type: 'error', text: 'Todos os campos de cadastro são obrigatórios.' });
      return;
    }

    setAlert({ type: 'success', text: 'Cadastro Efetuado! Agora tente realizar o login utilizando o e-mail cadastrado.' });
    setIsRegistering(false);
    setEmail(email);
    setSenha('');
    setTimeout(() => setAlert(null), 5000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Upper info section */}
      <div className="text-center space-y-2 max-w-lg mx-auto">
        <h2 className="font-display font-medium text-2xl text-slate-900">Autenticação do Usuário</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          O sistema exige autenticação simulada de credenciais para controle e segurança das movimentações bibliográficas escolares.
        </p>
      </div>

      {alert && (
        <div className={`p-4 rounded-xl flex items-start space-x-3 border ${
          alert.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-850' 
            : 'bg-rose-50 border-rose-100 text-rose-850'
        }`}>
          {alert.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span className="text-sm font-medium">{alert.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* Active state / login form widget */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
          {session.isAuthenticated ? (
            <div className="space-y-6 py-6 text-center">
              <div className="h-16 w-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <ShieldCheck className="h-9 w-9" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-mono tracking-widest text-emerald-600 font-bold uppercase block">Status: Autenticado</span>
                <h3 className="text-xl font-bold text-slate-900">{session.nome}</h3>
                <p className="text-sm text-slate-500 font-mono">{session.email}</p>
              </div>

              <div className="p-4 bg-slate-55 bg-indigo-50/20 text-slate-650 text-xs rounded-2xl max-w-sm mx-auto leading-relaxed border border-indigo-100/30">
                Você possui permissões plenas de bibliotecário para fazer cadastros, devoluções, e editar estoque de livros e de editoras no sistema.
              </div>

              <button
                onClick={onLogout}
                className="w-full max-w-xs bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-colors shadow-md"
              >
                Encerrar Sessão no Computador
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-150">
                <h3 className="font-display font-medium text-lg text-slate-900">
                  {isRegistering ? 'Cadastrar Credencial' : 'Autenticar no Caixa'}
                </h3>
                
                <button
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setAlert(null);
                  }}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
                >
                  {isRegistering ? 'Voltar para o Login' : 'Criar Nova Credencial'}
                </button>
              </div>

              {isRegistering ? (
                /* Register Form */
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Nome Completo</label>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Pedro Martins de Arruda"
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">E-mail</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ex: pedro@escola.ce.gov.br"
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Senha Secreta</label>
                    <input
                      type="password"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Crie sua senha"
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center space-x-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md transform active:translate-y-0.5"
                  >
                    <UserPlus className="h-4.5 w-4.5" />
                    <span>Realizar Cadastro</span>
                  </button>
                </form>
              ) : (
                /* Login Form */
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">E-mail Institucional</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-450" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Ex: admin@escola.ce.gov.br ou do usuário"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Senha de Acesso</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-450" />
                      <input
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        placeholder="Digite sua senha cadastrada"
                        required
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center space-x-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md mt-1"
                  >
                    <LogIn className="h-4.5 w-4.5" />
                    <span>Autenticar Usuário</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Cheat-Sheet / Simulators helper list */}
        <div className="bg-slate-900 text-slate-200 rounded-3xl p-6 flex flex-col justify-between border border-slate-800">
          <div>
            <h3 className="font-display font-medium text-base text-white mb-2 flex items-center space-x-1.5">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span>Gabarito do Simulador</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Consulte as credenciais padrão já pré-carregadas para testar o fluxo de autenticação e gerenciamento imediatamente:
            </p>

            <div className="space-y-3.5">
              {/* Opcao 1 Admin */}
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-750 text-xs">
                <span className="font-semibold text-emerald-400 block mb-1 uppercase text-[10px] tracking-wide">1. Acesso do Bibliotecário / Admin</span>
                <div className="font-mono text-[11px] text-slate-300 space-y-0.5">
                  <div>E-mail: <strong className="text-slate-100">admin@escola.ce.gov.br</strong></div>
                  <div>Senha: <strong className="text-slate-100">admin123</strong></div>
                </div>
              </div>

              {/* Opcao 2 users */}
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-750 text-xs">
                <span className="font-semibold text-sky-400 block mb-1 uppercase text-[10px] tracking-wide">2. Contas de Alunos Registrados</span>
                <p className="text-[11px] text-slate-400 mb-2">Qualquer e-mail cadastrado na aba "Usuários" é aceito no login (qualquer senha é aceita por conveniência curricular):</p>
                
                <div className="space-y-1.5 font-mono text-[10px]">
                  {users.slice(0, 3).map(u => (
                    <div key={u.id} className="text-slate-300 flex justify-between">
                      <span className="truncate pr-2">{u.nome} ({u.funcao})</span>
                      <strong className="text-slate-400 font-medium shrink-0 italic">{u.email}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4 text-[10px] text-slate-500 text-center font-mono uppercase tracking-wider">
            Conselho Escolar - Governo do Estado do Ceará
          </div>
        </div>

      </div>
    </div>
  );
}
