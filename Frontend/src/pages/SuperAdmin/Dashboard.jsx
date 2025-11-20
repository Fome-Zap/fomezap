import { useEffect, useState } from 'react';
import { Store, Users, TrendingUp, DollarSign } from 'lucide-react';
import api from '../../api/api';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalTenants: 0,
    tenantsAtivos: 0,
    tenantsInativos: 0,
    totalUsuarios: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    try {
      const response = await api.get('/api/super-admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-2">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Visão geral da plataforma FomeZap</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Tenants"
          value={stats.totalTenants}
          icon={Store}
          color="bg-blue-500"
        />
        <StatCard
          title="Tenants Ativos"
          value={stats.tenantsAtivos}
          icon={TrendingUp}
          color="bg-green-500"
        />
        <StatCard
          title="Tenants Inativos"
          value={stats.tenantsInativos}
          icon={Store}
          color="bg-red-500"
        />
        <StatCard
          title="Total de Usuários"
          value={stats.totalUsuarios}
          icon={Users}
          color="bg-purple-500"
        />
      </div>

      {/* Informações Adicionais */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Ambiente Atual</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Banco de Dados</p>
            <p className="font-medium">
              {import.meta.env.VITE_API_URL?.includes('localhost') 
                ? '🟢 MongoDB Local' 
                : '🌐 MongoDB Atlas (Produção)'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">API Backend</p>
            <p className="font-medium">{import.meta.env.VITE_API_URL || 'http://localhost:5000'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-full`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
