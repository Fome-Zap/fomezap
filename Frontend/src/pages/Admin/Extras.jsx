// src/pages/Admin/Extras.jsx - CRUD de Extras
import { useState, useEffect } from 'react';
import { useCurrencyInput } from '../../hooks/useCurrencyInput.js';
import api from '../../api/api';

const TENANT_ID = 'demo';

function Extras() {
  const [extras, setExtras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [extraEditando, setExtraEditando] = useState(null);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  
  // Hook de máscara de preço
  const preco = useCurrencyInput(0);
  
  const [formData, setFormData] = useState({
    nome: '',
    disponivel: true
  });

  useEffect(() => {
    carregarExtras();
  }, []);

  useEffect(() => {
    if (mensagem.texto) {
      const timer = setTimeout(() => {
        setMensagem({ tipo: '', texto: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensagem]);

  const mostrarMensagem = (texto, tipo = 'sucesso') => {
    setMensagem({ tipo, texto });
  };

  const carregarExtras = async () => {
    try {
      setLoading(true);
      setErro(null);
      const response = await api.get(`/api/admin/${TENANT_ID}/extras`);
      setExtras(response.data);
    } catch (error) {
      console.error('Erro ao carregar extras:', error);
      setErro('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (extra = null) => {
    if (extra) {
      setExtraEditando(extra);
      preco.setValue(extra.preco);
      setFormData({
        nome: extra.nome,
        disponivel: extra.disponivel
      });
    } else {
      setExtraEditando(null);
      preco.setValue(0);
      setFormData({
        nome: '',
        disponivel: true
      });
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setExtraEditando(null);
    preco.setValue(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      mostrarMensagem('Nome é obrigatório', 'erro');
      return;
    }

    if (!preco.realValue || preco.realValue <= 0) {
      mostrarMensagem('Preço inválido', 'erro');
      return;
    }

    try {
      const dadosExtra = {
        ...formData,
        preco: preco.realValue
      };

      if (extraEditando) {
        const response = await api.put(`/api/admin/${TENANT_ID}/extras/${extraEditando._id}`, dadosExtra);
        mostrarMensagem(response.data.message, 'sucesso');
      } else {
        const response = await api.post(`/api/admin/${TENANT_ID}/extras`, dadosExtra);
        mostrarMensagem(response.data.message, 'sucesso');
      }
      
      fecharModal();
      carregarExtras();
    } catch (error) {
      console.error('Erro:', error);
      const mensagemErro = error.response?.data?.error || error.response?.data?.mensagem || 'Erro ao salvar extra';
      mostrarMensagem(mensagemErro, 'erro');
    }
  };

  const handleDeletar = async (extra) => {
    if (!confirm(`Tem certeza que deseja deletar "${extra.nome}"?`)) {
      return;
    }

    try {
      const response = await api.delete(`/api/admin/${TENANT_ID}/extras/${extra._id}`);
      mostrarMensagem(response.data.message, 'sucesso');
      carregarExtras();
    } catch (error) {
      console.error('Erro:', error);
      const mensagemErro = error.response?.data?.error || error.response?.data?.mensagem || 'Erro ao deletar extra';
      mostrarMensagem(mensagemErro, 'erro');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-800">Erro ao carregar</h3>
          </div>
          <p className="text-red-700 mb-4">{erro}</p>
          <button
            onClick={carregarExtras}
            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Toast de mensagem */}
      {mensagem.texto && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
          mensagem.tipo === 'sucesso' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <span className="text-2xl">
            {mensagem.tipo === 'sucesso' ? '✅' : '⚠️'}
          </span>
          <div className="flex-1">
            <p className="font-semibold">{mensagem.tipo === 'sucesso' ? 'Sucesso!' : 'Atenção!'}</p>
            <p>{mensagem.texto}</p>
          </div>
          <button
            onClick={() => setMensagem({ tipo: '', texto: '' })}
            className="text-white hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Extras</h1>
          <p className="text-gray-600 mt-1">Adicionais que podem ser incluídos nos produtos</p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Novo Extra
        </button>
      </div>

      {extras.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">Nenhum extra cadastrado</p>
          <button
            onClick={() => abrirModal()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Criar Primeiro Extra
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {extras.map((extra) => (
                <tr key={extra._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{extra.nome}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      + R$ {extra.preco.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      extra.disponivel
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {extra.disponivel ? 'Disponível' : 'Indisponível'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => abrirModal(extra)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeletar(extra)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {extraEditando ? 'Editar Extra' : 'Novo Extra'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Nome do Extra *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="Ex: Bacon, Queijo Extra, Ovo"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Preço (R$) *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={preco.displayValue}
                  onChange={preco.handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="0,00"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Digite apenas números. Ex: 350 = R$ 3,50</p>
              </div>

              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="disponivel"
                  checked={formData.disponivel}
                  onChange={(e) => setFormData({ ...formData, disponivel: e.target.checked })}
                  className="mr-2 w-4 h-4"
                />
                <label htmlFor="disponivel" className="text-sm font-medium">Extra disponível</label>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  {extraEditando ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Extras;
