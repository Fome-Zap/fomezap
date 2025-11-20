import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isManagerDomain } from '../config/api';

export default function ProtectedRoute({ children, requireSuperAdmin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const ehManager = isManagerDomain();

  // Enquanto está carregando, mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, redirecionar para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // CRÍTICO: Validação de domínio para super-admin
  // Rotas /super-admin SOMENTE podem ser acessadas em manager.fomezap.com
  const rotaSuperAdmin = location.pathname.startsWith('/super-admin');
  
  if (rotaSuperAdmin) {
    // Verificar se está no domínio manager
    if (!ehManager) {
      console.warn('🚫 ACESSO NEGADO: Tentativa de acessar /super-admin fora do domínio manager.fomezap.com');
      console.warn('   Domínio atual:', window.location.hostname);
      console.warn('   Usuário:', user.email, '| Role:', user.role);
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-md bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="text-red-500 text-5xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Negado</h2>
            <p className="text-gray-600 mb-6">
              O painel de Super Admin só pode ser acessado através do domínio:
              <br />
              <strong className="text-orange-600">manager.fomezap.com</strong>
            </p>
            <a 
              href="https://manager.fomezap.com/super-admin"
              className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
            >
              Ir para Manager
            </a>
          </div>
        </div>
      );
    }

    // Verificar se o usuário é super_admin
    if (user.role !== 'super_admin') {
      console.warn('🚫 ACESSO NEGADO: Usuário não é super_admin');
      console.warn('   Usuário:', user.email, '| Role:', user.role);
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-md bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="text-red-500 text-5xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Negado</h2>
            <p className="text-gray-600 mb-6">
              Você não tem permissão para acessar o painel de Super Admin.
            </p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
            >
              Voltar para Login
            </button>
          </div>
        </div>
      );
    }
  }

  // Se autenticado e validado, renderizar children
  return children;
}
