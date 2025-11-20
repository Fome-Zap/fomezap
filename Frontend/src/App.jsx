import { Routes, Route, Navigate } from "react-router-dom";
import FomeZapExact from "./pages/FomeZapExact";
import RecuperarSenha from "./pages/RecuperarSenha";
import ResetarSenha from "./pages/ResetarSenha";
import Checkout from "./pages/Checkout";
import PedidoConfirmado from "./pages/PedidoConfirmado";
import Login from "./pages/LoginModerno";
import AdminLayout from "./components/Admin/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import Categorias from "./pages/Admin/Categorias";
import Produtos from "./pages/Admin/Produtos";
import Extras from "./pages/Admin/Extras";
import Configuracoes from "./pages/Admin/Configuracoes";
import Pedidos from "./pages/Admin/Pedidos";
import SuperAdminLayout from "./pages/SuperAdmin/SuperAdminLayout";
import SuperAdminDashboard from "./pages/SuperAdmin/Dashboard";
import TenantsManager from "./pages/SuperAdmin/TenantsManager";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Rota raiz redireciona para login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Rota principal - Cardápio do cliente (com slug do tenant) */}
      <Route path="/:tenantSlug" element={<FomeZapExact />} />
      <Route path="/:tenantSlug/checkout" element={<Checkout />} />
      <Route path="/:tenantSlug/pedido-confirmado" element={<PedidoConfirmado />} />

      {/* Recuperação e redefinição de senha */}
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      <Route path="/resetar-senha/:token" element={<ResetarSenha />} />

      {/* Rota de Login */}
      <Route path="/login" element={<Login />} />

      {/* Rotas do Painel Admin (PROTEGIDAS) */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="pedidos" element={<Pedidos />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="produtos" element={<Produtos />} />
        <Route path="extras" element={<Extras />} />
        <Route path="configuracoes" element={<Configuracoes />} />
      </Route>

      {/* Rotas do Super Admin (PROTEGIDAS - SUPER_ADMIN APENAS) */}
      <Route 
        path="/super-admin" 
        element={
          <ProtectedRoute>
            <SuperAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SuperAdminDashboard />} />
        <Route path="tenants" element={<TenantsManager />} />
      </Route>
    </Routes>
  );
}

export default App;
