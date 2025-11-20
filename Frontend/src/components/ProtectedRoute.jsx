import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isManagerDomain } from '../config/api';

export default function ProtectedRoute({ children, requireSuperAdmin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const ehManager = isManagerDomain();

  // DEBUG: Log completo para diagnóstico
  console.log('🔒 ProtectedRoute Debug:', {
    pathname: location.pathname,
    search: location.search,
    hostname: window.location.hostname,
    ehManager,
    userRole: user?.role,
    loading
  });

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

  // CRÍTICO: Validação de domínio e role para super-admin
  // Rotas /super-admin SOMENTE podem ser acessadas:
  // 1. Em manager.fomezap.com em produção
  // 2. Em localhost com ?mode=manager (desenvolvimento)
  // 3. E SEMPRE o user.role deve ser 'super_admin'
  const rotaSuperAdmin = location.pathname.startsWith('/super-admin');
  
  if (rotaSuperAdmin) {
    console.log('🔐 Validação Super-Admin:', {
      userRole: user.role,
      ehManager,
      pathname: location.pathname,
      hostname: window.location.hostname,
      managerModeLocalStorage: localStorage.getItem('managerMode'),
      isLocalhost: window.location.hostname.includes('localhost')
    });

    // PRIMEIRO: Verificar se o usuário tem role de super_admin
    if (user.role !== 'super_admin') {
      console.warn('🚫 Permissão insuficiente - Role:', user.role);
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-md bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="text-red-500 text-5xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Negado</h2>
            <p className="text-gray-600 mb-6">
              Você não tem permissão para acessar esta área.
            </p>
            <button 
              onClick={() => window.location.href = '/admin'}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
            >
              Voltar ao Painel
            </button>
          </div>
        </div>
      );
    }

    // SEGUNDO: Verificar domínio/modo
    // ✅ SOLUÇÃO DEFINITIVA: Em localhost, se é super_admin, SEMPRE permitir
    const isLocalhost = window.location.hostname.includes('localhost');
    
    if (!ehManager && !isLocalhost) {
      // Em PRODUÇÃO: Exigir manager.fomezap.com
      console.warn('🚫 Domínio incorreto para super-admin (produção)');
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-md bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="text-red-500 text-5xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Negado</h2>
            <p className="text-gray-600 mb-6">
              Você não tem permissão para acessar esta área.
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
            >
              Voltar
            </button>
          </div>
        </div>
      );
    }

    // Em localhost: Se é super_admin, deixa passar
    if (isLocalhost && user.role === 'super_admin') {
      console.log('✅ Acesso liberado (localhost + super_admin)');
    }
  }

  // Se autenticado e validado, renderizar children
  return children;
}
