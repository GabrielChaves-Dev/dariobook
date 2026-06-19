import React from 'react';
import { 
  BookOpen, 
  Users, 
  Building2, 
  FileCheck, 
  Boxes, 
  LayoutDashboard, 
  LogIn, 
  UserCheck, 
  Library,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { AuthSession } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  session: AuthSession;
  onLogout: () => void;
}

export default function Navbar({ currentTab, setCurrentTab, session, onLogout }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'loans', label: 'Empréstimos', icon: FileCheck },
    { id: 'books', label: 'Livros', icon: BookOpen },
    { id: 'publishers', label: 'Editoras', icon: Building2 },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'stock', label: 'Estoque & Logs', icon: Boxes },
    { id: 'auth', label: 'Autenticação', icon: LogIn }
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
            <div className="bg-emerald-500 p-2 rounded-lg text-slate-950 flex items-center justify-center shadow-md">
              <Library className="h-6 w-6" />
            </div>
            <div>
              <span className="font-display font-bold text-lg md:text-xl tracking-tight block">BIBLIOTECA escolar</span>
              <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase -mt-1 block">CEARÁ - GOVERNO DO ESTADO</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* User Info / Profile Link */}
          <div className="hidden md:flex items-center space-x-3 border-l border-slate-800 pl-4">
            {session.isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-medium text-slate-200 flex items-center justify-end space-x-1">
                    <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{session.nome}</span>
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{session.email}</span>
                </div>
                <button
                  id="btn-logout"
                  onClick={onLogout}
                  title="Sair"
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-md transition-colors"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            ) : (
              <button
                id="btn-nav-auth"
                onClick={() => setCurrentTab('auth')}
                className="flex items-center space-x-1 border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs px-3 py-1.5 rounded-md transition-all font-medium"
              >
                <LogIn className="h-3.5 w-3.5 text-emerald-400" />
                <span>Entrar no Sistema</span>
              </button>
            )}
          </div>

          {/* Hamburger Menu (Mobile) */}
          <div className="lg:hidden flex items-center space-x-2">
            {session.isAuthenticated && (
              <button
                onClick={onLogout}
                className="p-1 px-2 border border-slate-800 text-slate-400 hover:text-rose-400 text-xs rounded transition-colors"
              >
                Sair
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-t border-slate-850 px-2 pt-2 pb-3 space-y-1 sm:px-3 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-tab-${item.id}`}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-2 w-full px-3 py-2.5 rounded-md text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
          
          {/* Mobile Profile session indicator */}
          <div className="pt-4 pb-1 border-t border-slate-800 mt-3 px-3">
            {session.isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="bg-emerald-500 text-slate-950 rounded-full h-8 w-8 flex items-center justify-center font-bold text-sm">
                  {session.nome.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{session.nome}</div>
                  <div className="text-xs text-slate-400 font-mono">{session.email}</div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setCurrentTab('auth');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 bg-emerald-500 text-slate-950 font-medium py-2 px-4 rounded-md text-sm hover:bg-emerald-450 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>Fazer Login</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
