import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff,
  Save,
  X,
  AlertCircle,
  LogIn,
  ExternalLink
} from 'lucide-react';
import api from '../../api/api';
import ConfirmModal from '../../components/ConfirmModal';
import AlertModal from '../../components/AlertModal';

export default function TenantsManager() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  
  // Estados para modais de confirmação e alerta
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', data: null });
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: 'info', title: '', message: '' });
  const [actionLoading, setActionLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    slug: '',
    telefone: '',
    email: '',
    endereco: '',
    status: 'ativo',
    novaSenha: ''
  });

  useEffect(() => {
    carregarTenants();
  }, []);

  const carregarTenants = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/super-admin/tenants');
      setTenants(response.data);
    } catch (error) {
      console.error('Erro ao carregar tenants:', error);
      setAlertModal({
        isOpen: true,
        type: 'error',
        title: 'Erro ao Carregar',
        message: 'Não foi possível carregar a lista de tenants. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setActionLoading(true);
    try {
      if (editingTenant) {
        // Preparar dados para atualização
        const updateData = { ...formData };
        
        // Se tiver nova senha, enviar em requisição separada
        if (formData.novaSenha && formData.novaSenha.trim() !== '') {
          try {
            await api.patch(`/api/super-admin/tenants/${editingTenant.tenantId}/alterar-senha`, {
              novaSenha: formData.novaSenha
            });
          } catch (senhaError) {
            console.error('Erro ao alterar senha:', senhaError);
            setAlertModal({
              isOpen: true,
              type: 'warning',
              title: 'Aviso',
              message: 'Tenant atualizado, mas houve erro ao alterar senha: ' + (senhaError.response?.data?.error || 'Erro desconhecido')
            });
          }
        }
        
        // Remover novaSenha antes de enviar atualização do tenant
        delete updateData.novaSenha;
        
        await api.put(`/api/super-admin/tenants/${editingTenant.tenantId}`, updateData);
        setAlertModal({
          isOpen: true,
          type: 'success',
          title: 'Sucesso!',
          message: formData.novaSenha ? 'Tenant e senha atualizados com sucesso!' : 'Tenant atualizado com sucesso!'
        });
      } else {
        console.log('📦 Criando novo tenant...');
        console.log('   Dados enviados:', formData);
        console.log('   Email:', formData.email);
        
        const response = await api.post('/api/super-admin/tenants', formData);
        console.log('✅ Resposta do servidor:', response.data);
        
        setAlertModal({
          isOpen: true,
          type: 'success',
          title: 'Sucesso!',
          message: `Tenant criado com sucesso!\n\nEmail de login: ${formData.email}\nSenha padrão: Fomezap@2024`
        });
      }
      
      setShowModal(false);
      setEditingTenant(null);
      resetForm();
      carregarTenants();
    } catch (error) {
      console.error('Erro ao salvar tenant:', error);
      setAlertModal({
        isOpen: true,
        type: 'error',
        title: 'Erro ao Salvar',
        message: error.response?.data?.error || 'Não foi possível salvar o tenant.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (tenant) => {
    setEditingTenant(tenant);
    setFormData({
      nome: tenant.nome,
      slug: tenant.slug,
      telefone: tenant.telefone || '',
      email: tenant.email || '',
      endereco: tenant.endereco || '',
      status: tenant.status,
      novaSenha: ''
    });
    setShowModal(true);
  };

  const handleDelete = async (tenant) => {
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      data: tenant
    });
  };

  const confirmDelete = async () => {
    const tenant = confirmModal.data;
    setActionLoading(true);
    
    try {
      await api.delete(`/api/super-admin/tenants/${tenant.tenantId}`);
      setConfirmModal({ isOpen: false, type: '', data: null });
      setAlertModal({
        isOpen: true,
        type: 'success',
        title: 'Tenant Excluído',
        message: `O tenant "${tenant.nome}" e todos os seus dados foram excluídos com sucesso.`
      });
      carregarTenants();
    } catch (error) {
      console.error('Erro ao excluir tenant:', error);
      setAlertModal({
        isOpen: true,
        type: 'error',
        title: 'Erro ao Excluir',
        message: error.response?.data?.error || 'Não foi possível excluir o tenant.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const toggleStatus = async (tenant) => {
    setConfirmModal({
      isOpen: true,
      type: 'toggleStatus',
      data: tenant
    });
  };

  const confirmToggleStatus = async () => {
    const tenant = confirmModal.data;
    const novoStatus = tenant.status === 'ativo' ? 'inativo' : 'ativo';
    setActionLoading(true);
    
    try {
      await api.patch(`/api/super-admin/tenants/${tenant.tenantId}/status`, { status: novoStatus });
      setConfirmModal({ isOpen: false, type: '', data: null });
      setAlertModal({
        isOpen: true,
        type: 'success',
        title: 'Status Alterado',
        message: `Tenant ${novoStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso!`
      });
      carregarTenants();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      setAlertModal({
        isOpen: true,
        type: 'error',
        title: 'Erro',
        message: 'Não foi possível alterar o status do tenant.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      slug: '',
      telefone: '',
      email: '',
      endereco: '',
      status: 'ativo',
      novaSenha: ''
    });
  };

  // Função para fazer login direto como admin do tenant
  const handleAcessarPainel = async (tenant) => {
    try {
      setActionLoading(true);
      
      // Buscar credenciais do admin desse tenant
      const response = await api.post(`/api/super-admin/tenants/${tenant.tenantId}/gerar-acesso`);
      
      // Salvar token no localStorage
      localStorage.setItem('token', response.data.token);
      
      // Redirecionar para o painel admin
      window.location.href = '/admin';
      
    } catch (error) {
      console.error('Erro ao acessar painel:', error);
      setAlertModal({
        isOpen: true,
        type: 'error',
        title: 'Erro',
        message: error.response?.data?.error || 'Não foi possível acessar o painel deste tenant.'
      });
      setActionLoading(false);
    }
  };

  const filteredTenants = tenants.filter(tenant =>
    tenant.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando tenants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-2">
      {/* Header Compacto */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gerenciar Tenants</h2>
          <p className="text-sm text-gray-500 mt-0.5">Gerencie restaurantes da plataforma</p>
        </div>
        <button
          onClick={() => {
            setEditingTenant(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Novo Tenant</span>
        </button>
      </div>

      {/* Busca Integrada */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar por nome, slug ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
        />
      </div>

      {/* Lista de Tenants - Tabela Otimizada */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Restaurante
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Slug / URL
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Contato
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <AlertCircle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-500">Nenhum tenant encontrado</p>
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => (
                  <tr key={tenant.tenantId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{tenant.nome}</p>
                        <p className="text-xs text-gray-500 font-mono">{tenant.tenantId}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded font-medium">{tenant.slug}</code>
                      <p className="text-xs text-gray-400 mt-0.5">{tenant.slug}.fomezap.com</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs">
                        <p className="text-gray-700 font-mono">{tenant.emailAdmin || '-'}</p>
                        
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        tenant.status === 'ativo' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {tenant.status === 'ativo' ? (
                          <>
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>
                            Ativo
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5"></span>
                            Inativo
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => window.open(`/?tenant=${tenant.slug}`, '_blank')}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Ver Cardápio"
                          disabled={actionLoading}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAcessarPainel(tenant)}
                          className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Acessar Painel Admin"
                          disabled={actionLoading}
                        >
                          <LogIn className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStatus(tenant)}
                          className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          title={tenant.status === 'ativo' ? 'Desativar' : 'Ativar'}
                        >
                          {tenant.status === 'ativo' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(tenant)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tenant)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingTenant ? 'Editar Tenant' : 'Novo Tenant'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingTenant(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Restaurante *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: Lanchonete do João"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug (URL) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: lanchonete-do-joao"
                    disabled={!!editingTenant}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.slug ? `${formData.slug}.fomezap.com` : 'Use apenas letras minúsculas, números e hífens'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email (Login do Admin) *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="admin@restaurante.com"
                      disabled={!!editingTenant}
                    />
                    {!editingTenant && (
                      <p className="text-xs text-purple-600 mt-1">
                        🔑 Este email será usado para login (senha padrão: Fomezap@2024)
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Rua, Número - Bairro - Cidade"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>

                {/* Campo de alterar senha - só aparece ao editar */}
                {editingTenant && (
                  <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nova Senha do Admin (opcional)
                    </label>
                    <input
                      type="password"
                      value={formData.novaSenha}
                      onChange={(e) => setFormData({ ...formData, novaSenha: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Deixe em branco para não alterar"
                      minLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Altere a senha do administrador deste tenant. Mínimo 6 caracteres.
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingTenant(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{actionLoading ? 'Salvando...' : (editingTenant ? 'Atualizar' : 'Criar Tenant')}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: '', data: null })}
        onConfirm={confirmModal.type === 'delete' ? confirmDelete : confirmToggleStatus}
        title={confirmModal.type === 'delete' ? 'Confirmar Exclusão' : 'Confirmar Alteração'}
        message={
          confirmModal.type === 'delete'
            ? `Tem certeza que deseja excluir o tenant "${confirmModal.data?.nome}"?\n\nISTO VAI APAGAR TODOS OS DADOS:\n• Categorias\n• Produtos\n• Pedidos\n• Usuários\n\nEsta ação não pode ser desfeita!`
            : `Deseja ${confirmModal.data?.status === 'ativo' ? 'desativar' : 'ativar'} o tenant "${confirmModal.data?.nome}"?`
        }
        type={confirmModal.type === 'delete' ? 'danger' : 'warning'}
        confirmText={confirmModal.type === 'delete' ? 'Sim, Excluir' : 'Sim, Alterar'}
        cancelText="Cancelar"
        loading={actionLoading}
      />

      {/* Modal de Alerta */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ isOpen: false, type: 'info', title: '', message: '' })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
}
