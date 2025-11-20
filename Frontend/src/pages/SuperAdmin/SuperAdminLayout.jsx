import { Link, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Store, 
  LogOut, 
  Shield,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function SuperAdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  // Verificar se é super admin
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'super_admin') {
      alert('Acesso negado! Apenas Super Admins podem acessar esta área.');
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user || user.role !== 'super_admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - Static (não fixed) com layout responsivo moderno */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Coluna ESQUERDA: Logo + Shield + Menu Hamburger Mobile */}
            <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
              {/* Botão Menu Hamburger - Mobile */}
              <button
                onClick={() => setMenuMobileAberto(!menuMobileAberto)}
                className="md:hidden p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                aria-label="Menu"
              >
                {menuMobileAberto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <Shield className="w-6 h-6 text-purple-600 flex-shrink-0" />
              <img 
                src="/img/fomezap_logoLaranjaFundoTranspHoriz.png" 
                alt="FomeZap Manager" 
                className="h-8 w-auto hidden sm:block" 
              />
              <span className="text-sm font-semibold text-purple-600 hidden lg:block">
                Super Admin
              </span>
            </div>

            {/* Coluna CENTRO: Navegação Principal Desktop */}
            <nav className="hidden md:flex items-center gap-2 flex-shrink-0">
              <Link
                to="/super-admin"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-all duration-200"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/super-admin/tenants"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-all duration-200"
              >
                <Store className="w-4 h-4" />
                <span>Tenants</span>
              </Link>
            </nav>

            {/* Coluna DIREITA: User Info + Logout */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                  {user.nome?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                  {user.nome}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                title="Sair do sistema"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Menu Mobile Dropdown - Moderno e Bonito */}
      {menuMobileAberto && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg animate-slide-in">
          <div className="container mx-auto px-4 py-3 space-y-1">
            {/* Info do Usuário Mobile */}
            <div className="sm:hidden flex items-center gap-3 p-3 bg-purple-50 rounded-lg mb-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                {user.nome?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.nome}</p>
                <p className="text-xs text-gray-600">Super Administrador</p>
              </div>
            </div>

            {/* Links de Navegação Mobile */}
            <Link
              to="/super-admin"
              onClick={() => setMenuMobileAberto(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link
              to="/super-admin/tenants"
              onClick={() => setMenuMobileAberto(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
            >
              <Store className="w-5 h-5" />
              <span className="font-medium">Gerenciar Tenants</span>
            </Link>
            
            <div className="border-t border-gray-200 my-2"></div>
            
            <button
              onClick={() => {
                setMenuMobileAberto(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair do Sistema</span>
            </button>
          </div>
        </div>
      )}

      {/* Overlay para fechar menu mobile ao clicar fora */}
      {menuMobileAberto && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-20 z-[-1]" 
          onClick={() => setMenuMobileAberto(false)}
        ></div>
      )}

      {/* Main Content - com padding adequado e sem sobreposição */}
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
