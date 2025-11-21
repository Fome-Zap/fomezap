// src/pages/Admin/Categorias.jsx - CRUD de Categorias
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/api';
import ModalSelecionarEmoji from '../../components/ModalSelecionarEmoji';
import ModalConfirmacao from '../../components/ModalConfirmacao';
import ListaDraggable from '../../components/ListaDraggable';

function Categorias() {
  const { user } = useAuth();
  const tenantId = user?.tenantId;
  
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalEmojiAberto, setModalEmojiAberto] = useState(false);
  const [modalDeletarAberto, setModalDeletarAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [categoriaDeletar, setCategoriaDeletar] = useState(null);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [modoOrdenacao, setModoOrdenacao] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    icone: '📦',
    imagemPadrao: '',
    ativa: true
  });

  useEffect(() => {
    carregarCategorias();
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

  const carregarCategorias = async () => {
    try {
      setLoading(true);
      setErro(null);
      
      if (!tenantId) {
        setErro('Erro: TenantId não encontrado. Faça login novamente.');
        setLoading(false);
        return;
      }
      
      const response = await api.get(`/api/admin/${tenantId}/categorias`);
      setCategorias(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setErro('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (categoria = null) => {
    if (categoria) {
      setCategoriaEditando(categoria);
      setFormData({
        nome: categoria.nome,
        icone: categoria.icone,
        imagemPadrao: categoria.imagemPadrao || '',
        ativa: categoria.ativa
      });
    } else {
      setCategoriaEditando(null);
      setFormData({
        nome: '',
        icone: '📦',
        imagemPadrao: '',
        ativa: true
      });
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setCategoriaEditando(null);
    setFormData({ nome: '', icone: '📦', imagemPadrao: '', ativa: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      mostrarMensagem('Nome é obrigatório', 'erro');
      return;
    }

    try {
      if (categoriaEditando) {
        const response = await api.put(`/api/admin/${tenantId}/categorias/${categoriaEditando._id}`, formData);
        mostrarMensagem(response.data.message, 'sucesso');
      } else {
        const response = await api.post(`/api/admin/${tenantId}/categorias`, formData);
        mostrarMensagem(response.data.message, 'sucesso');
      }
      
      fecharModal();
      carregarCategorias();
    } catch (error) {
      console.error('Erro:', error);
      const mensagemErro = error.response?.data?.error || error.response?.data?.mensagem || 'Erro ao salvar categoria';
      mostrarMensagem(mensagemErro, 'erro');
    }
  };

  const handleDeletar = async (categoria) => {
    if (categoria.totalProdutos > 0) {
      mostrarMensagem(`Não é possível deletar. Existem ${categoria.totalProdutos} produto(s) vinculado(s).`, 'erro');
      return;
    }

    setCategoriaDeletar(categoria);
    setModalDeletarAberto(true);
  };

  const confirmarDeletar = async () => {
    if (!categoriaDeletar) return;

    try {
      const response = await api.delete(`/api/admin/${tenantId}/categorias/${categoriaDeletar._id}`);
      mostrarMensagem(response.data.message, 'sucesso');
      carregarCategorias();
    } catch (error) {
      console.error('Erro:', error);
      const mensagemErro = error.response?.data?.error || error.response?.data?.mensagem || 'Erro ao deletar categoria';
      mostrarMensagem(mensagemErro, 'erro');
    } finally {
      setCategoriaDeletar(null);
    }
  };

  const handleReordenar = async (itemsComOrdem, novosItems) => {
    try {
      const response = await api.put(`/api/admin/${tenantId}/categorias/reordenar`, {
        categorias: itemsComOrdem
      });
      
      console.log('✅ Categorias reordenadas:', response.data);
      setCategorias(novosItems);
      mostrarMensagem('Ordem atualizada com sucesso!', 'sucesso');
    } catch (error) {
      console.error('❌ Erro ao reordenar:', error);
      const mensagemErro = error.response?.data?.error || 'Erro ao atualizar ordem';
      mostrarMensagem(mensagemErro, 'erro');
      carregarCategorias();
    }
  };

  const renderCategoriaCard = (categoria) => (
    <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
      {modoOrdenacao && (
        <div className="flex items-center text-gray-400 cursor-move mr-3">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
          </svg>
        </div>
      )}
      
      <div className="flex items-center gap-3 flex-1">
        <span className="text-3xl">{categoria.icone}</span>
        <div>
          <h3 className="font-semibold text-gray-800">{categoria.nome}</h3>
          <p className="text-sm text-gray-500">
            {categoria.totalProdutos || 0} produto(s)
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          categoria.ativa 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-700'
        }`}>
          {categoria.ativa ? 'Ativa' : 'Inativa'}
        </span>
        
        {!modoOrdenacao && (
          <>
            <button
              onClick={() => abrirModal(categoria)}
              className="bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100 text-sm font-medium"
            >
              Editar
            </button>
            <button
              onClick={() => handleDeletar(categoria)}
              className="bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100 text-sm font-medium"
            >
              Deletar
            </button>
          </>
        )}
      </div>
    </div>
  );

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
            onClick={carregarCategorias}
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

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Gerenciar Categorias</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setModoOrdenacao(!modoOrdenacao)}
            className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base font-medium whitespace-nowrap flex-shrink-0 ${
              modoOrdenacao
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
            </svg>
            {modoOrdenacao ? 'Concluir Ordenação' : 'Reordenar'}
          </button>
          {!modoOrdenacao && (
            <button
              onClick={() => abrirModal()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm sm:text-base font-medium whitespace-nowrap flex-shrink-0"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nova Categoria
            </button>
          )}
        </div>
      </div>

      {categorias.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">Nenhuma categoria cadastrada</p>
          <button
            onClick={() => abrirModal()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Criar Primeira Categoria
          </button>
        </div>
      ) : modoOrdenacao ? (
        <div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              <strong>Modo de ordenação ativado:</strong> Arraste as categorias para reordená-las.
            </p>
          </div>
          <div className="space-y-3">
            <ListaDraggable
              items={categorias}
              onReorder={handleReordenar}
              renderItem={renderCategoriaCard}
              idKey="_id"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categorias.map((categoria) => (
            <div key={categoria._id}>
              {renderCategoriaCard(categoria)}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Nome da Categoria *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="Ex: Hambúrgueres"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Ícone/Emoji</label>
                
                {/* Preview do emoji selecionado */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-20 h-20 border-2 border-gray-200 rounded-lg flex items-center justify-center bg-gray-50">
                    <span className="text-4xl">{formData.icone}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalEmojiAberto(true)}
                    className="flex-1 bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition font-medium"
                  >
                    Escolher Emoji
                  </button>
                </div>
                
                <input
                  type="text"
                  value={formData.icone}
                  onChange={(e) => setFormData({ ...formData, icone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-center text-2xl"
                  placeholder="Ou digite um emoji"
                />
              </div>

              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="ativa"
                  checked={formData.ativa}
                  onChange={(e) => setFormData({ ...formData, ativa: e.target.checked })}
                  className="mr-2 w-4 h-4"
                />
                <label htmlFor="ativa" className="text-sm font-medium">Categoria ativa</label>
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
                  {categoriaEditando ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Seleção de Emoji */}
      <ModalSelecionarEmoji
        isOpen={modalEmojiAberto}
        onClose={() => setModalEmojiAberto(false)}
        onSelect={(emoji) => {
          setFormData({ ...formData, icone: emoji });
          setModalEmojiAberto(false);
        }}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ModalConfirmacao
        aberto={modalDeletarAberto}
        onFechar={() => {
          setModalDeletarAberto(false);
          setCategoriaDeletar(null);
        }}
        onConfirmar={confirmarDeletar}
        titulo="Deletar Categoria"
        mensagem={`Tem certeza que deseja deletar a categoria "${categoriaDeletar?.nome}"?`}
        textoBotaoConfirmar="Deletar"
        textoBotaoCancelar="Cancelar"
        tipo="danger"
      />
    </div>
  );
}

export default Categorias;
