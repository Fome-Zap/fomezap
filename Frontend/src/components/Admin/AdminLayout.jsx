// src/components/Admin/AdminLayout.jsx - Layout do painel admin
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/api';

function AdminLayout() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [modalSair, setModalSair] = useState(false);
  const [tenantSlug, setTenantSlug] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Buscar slug do tenant
  useEffect(() => {
    const buscarTenantSlug = async () => {
      try {
        console.log('🔍 Buscando slug para tenantId:', user?.tenantId);
        const response = await api.get(`/api/admin/${user?.tenantId}/configuracoes`);
        console.log('📦 Resposta configurações:', response.data);
        const slug = response.data.tenant?.slug || user?.tenantId;
        console.log('✅ Slug definido como:', slug);
        setTenantSlug(slug);
      } catch (error) {
        console.error('❌ Erro ao buscar slug do tenant:', error);
        setTenantSlug(user?.tenantId); // Fallback para tenantId
      }
    };
    if (user?.tenantId) {
      buscarTenantSlug();
    }
  }, [user?.tenantId]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const confirmarSair = () => {
    setModalSair(true);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Botão Hambúrguer - Mobile (Apenas para ABRIR) */}
      {!menuAberto && (
        <button
          onClick={() => setMenuAberto(true)}
          className="fixed top-4 left-4 z-50 md:hidden bg-blue-600 text-white p-2 rounded-lg shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Overlay - Mobile */}
      {menuAberto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setMenuAberto(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-white shadow-lg flex flex-col
        fixed md:static h-full z-40
        transition-transform duration-300 ease-in-out
        ${menuAberto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header com botão X (Mobile) */}
        <div className="p-6 relative">
          {/* Botão X - Mobile (Dentro do sidebar) */}
          <button
            onClick={() => setMenuAberto(false)}
            className="absolute top-4 right-4 md:hidden bg-blue-600 text-white p-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <img src="/img/fomezap_logoLaranjaFundoTranspHoriz.png" alt="FomeZap Admin" className="h-10 pr-12 md:pr-0" />
          <p className="text-sm text-gray-500 mt-1">Tenant: {user?.tenantId || 'demo'}</p>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-600">👤 {user?.nome}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>

        <nav className="flex-1 flex flex-col overflow-y-auto py-4">
          <NavLink
            to="/admin"
            end
            onClick={() => setMenuAberto(false)}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
              }`
            }
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/pedidos"
            onClick={() => setMenuAberto(false)}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
              }`
            }
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Pedidos
          </NavLink>

          <NavLink
            to="/admin/categorias"
            onClick={() => setMenuAberto(false)}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
              }`
            }
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Categorias
          </NavLink>

          <NavLink
            to="/admin/produtos"
            onClick={() => setMenuAberto(false)}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
              }`
            }
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Produtos
          </NavLink>

          <NavLink
            to="/admin/extras"
            onClick={() => setMenuAberto(false)}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
              }`
            }
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Extras
          </NavLink>

          <NavLink
            to="/admin/configuracoes"
            onClick={() => setMenuAberto(false)}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
              }`
            }
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configurações
          </NavLink>

          <div className="border-t border-gray-200 mt-auto"></div>

          <a
            href={
              window.location.hostname.includes('localhost')
                ? `http://localhost:5173/?tenant=${tenantSlug || user?.tenantId || 'demo'}`
                : `https://${tenantSlug || user?.tenantId || 'demo'}.fomezap.com`
            }
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuAberto(false)}
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Ver Cardápio
          </a>

          <button
            onClick={confirmarSair}
            className="flex items-center px-6 py-3 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair
          </button>
        </nav>
      </aside>

      {/* Modal de confirmação para sair */}
      {modalSair && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Confirmar Saída</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja sair do painel administrativo?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setModalSair(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Sim, Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto md:ml-0">
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
