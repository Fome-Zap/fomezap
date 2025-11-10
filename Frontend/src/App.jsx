import { Routes, Route } from "react-router-dom";
import FomeZapExact from "./pages/FomeZapExact";
import Checkout from "./pages/Checkout";
import PedidoConfirmado from "./pages/PedidoConfirmado";
import Login from "./pages/Login";
import AdminLayout from "./components/Admin/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import Categorias from "./pages/Admin/Categorias";
import Produtos from "./pages/Admin/Produtos";
import Extras from "./pages/Admin/Extras";
import Configuracoes from "./pages/Admin/Configuracoes";
import Pedidos from "./pages/Admin/Pedidos";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Rota principal - Cardápio do cliente */}
      <Route path="/" element={<FomeZapExact />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/pedido-confirmado" element={<PedidoConfirmado />} />
      
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
    </Routes>
  );
}

export default App;
