// src/pages/Admin/Produtos.jsx - CRUD de Produtos
import { useState, useEffect } from 'react';
import { useCurrencyInput } from '../../hooks/useCurrencyInput.js';
import api from '../../api/api';
import SeletorImagemProduto from '../../components/SeletorImagemProduto';

const TENANT_ID = 'demo';

function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [extras, setExtras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  
  // Hook de máscara de preço
  const preco = useCurrencyInput(0);
  
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    categoria: '',
    emoji: '',
    imagem: '',
    tipoImagem: null,
    disponivel: true,
    destaque: false,
    extras: [],
    tags: []
  });

  useEffect(() => {
    carregarDados();
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

  const carregarDados = async () => {
    try {
      setLoading(true);
      setErro(null);
      const [produtosRes, categoriasRes, extrasRes] = await Promise.all([
        api.get(`/api/admin/${TENANT_ID}/produtos`),
        api.get(`/api/admin/${TENANT_ID}/categorias`),
        api.get(`/api/admin/${TENANT_ID}/extras`)
      ]);

      setProdutos(produtosRes.data);
      setCategorias(categoriasRes.data);
      setExtras(extrasRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const produtosFiltrados = filtroCategoria
    ? produtos.filter(p => p.categoria._id === filtroCategoria)
    : produtos;

  const abrirModal = (produto = null) => {
    if (produto) {
      setProdutoEditando(produto);
      preco.setValue(produto.preco); // Atualiza o hook de preço
      setFormData({
        codigo: produto.codigo || '',
        nome: produto.nome,
        descricao: produto.descricao || '',
        categoria: produto.categoria._id,
        emoji: produto.emoji || '',
        imagem: produto.imagem || '',
        tipoImagem: produto.emoji ? 'emoji' : produto.imagem ? 'imagem' : null,
        disponivel: produto.disponivel,
        destaque: produto.destaque,
        extras: produto.extras || [],
        tags: produto.tags || []
      });
    } else {
      setProdutoEditando(null);
      preco.setValue(0); // Reseta o preço
      setFormData({
        codigo: '',
        nome: '',
        descricao: '',
        categoria: categorias[0]?._id || '',
        emoji: '',
        imagem: '',
        tipoImagem: null,
        disponivel: true,
        destaque: false,
        extras: [],
        tags: []
      });
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setProdutoEditando(null);
  };

  const handleImagemChange = ({ tipo, valor }) => {
    setFormData(prev => ({
      ...prev,
      tipoImagem: tipo,
      emoji: tipo === 'emoji' ? valor : '',
      imagem: tipo === 'imagem' ? valor : ''
    }));
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

    if (!formData.categoria) {
      mostrarMensagem('Categoria é obrigatória', 'erro');
      return;
    }

    try {
      const dadosProduto = {
        ...formData,
        preco: preco.realValue // Usa o valor numérico do hook
      };

      if (produtoEditando) {
        const response = await api.put(`/api/admin/${TENANT_ID}/produtos/${produtoEditando._id}`, dadosProduto);
        mostrarMensagem(response.data.message, 'sucesso');
      } else {
        const response = await api.post(`/api/admin/${TENANT_ID}/produtos`, dadosProduto);
        mostrarMensagem(response.data.message, 'sucesso');
      }
      
      fecharModal();
      carregarDados();
    } catch (error) {
      console.error('Erro:', error);
      const mensagemErro = error.response?.data?.error || error.response?.data?.mensagem || 'Erro ao salvar produto';
      mostrarMensagem(mensagemErro, 'erro');
    }
  };

  const handleDeletar = async (produto) => {
    if (!confirm(`Tem certeza que deseja deletar "${produto.nome}"?`)) {
      return;
    }

    try {
      const response = await api.delete(`/api/admin/${TENANT_ID}/produtos/${produto._id}`);
      mostrarMensagem(response.data.message, 'sucesso');
      carregarDados();
    } catch (error) {
      console.error('Erro:', error);
      const mensagemErro = error.response?.data?.error || error.response?.data?.mensagem || 'Erro ao deletar produto';
      mostrarMensagem(mensagemErro, 'erro');
    }
  };

  const toggleDisponibilidade = async (produto) => {
    try {
      const response = await api.patch(`/api/admin/${TENANT_ID}/produtos/${produto._id}/toggle`);
      carregarDados();
    } catch (error) {
      console.error('Erro:', error);
      const mensagemErro = error.response?.data?.error || error.response?.data?.mensagem || 'Erro ao alterar disponibilidade';
      mostrarMensagem(mensagemErro, 'erro');
    }
  };

  const toggleExtra = (extraId) => {
    setFormData(prev => ({
      ...prev,
      extras: prev.extras.includes(extraId)
        ? prev.extras.filter(id => id !== extraId)
        : [...prev.extras, extraId]
    }));
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
            onClick={carregarDados}
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
        <h1 className="text-3xl font-bold">Gerenciar Produtos</h1>
        <button
          onClick={() => abrirModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Novo Produto
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <label className="block text-sm font-medium mb-2">Filtrar por Categoria:</label>
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-64"
        >
          <option value="">Todas as Categorias</option>
          {categorias.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.icone} {cat.nome}
            </option>
          ))}
        </select>
      </div>

      {produtosFiltrados.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">Nenhum produto cadastrado</p>
          <button
            onClick={() => abrirModal()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Criar Primeiro Produto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {produtosFiltrados.map((produto) => (
            <div key={produto._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
              {/* Mostrar imagem ou emoji */}
              {produto.imagem || produto.emoji ? (
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {produto.imagem ? (
                    <img
                      src={produto.imagem.startsWith('http') ? produto.imagem : `http://localhost:5000${produto.imagem}`}
                      alt={produto.nome}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span className="text-6xl">{produto.emoji}</span>
                  )}
                </div>
              ) : null}
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{produto.nome}</h3>
                    <p className="text-sm text-gray-500">{produto.categoria.nome}</p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-lg font-bold text-green-600">
                      R$ {produto.preco.toFixed(2)}
                    </span>
                    {produto.destaque && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                        Destaque
                      </span>
                    )}
                  </div>
                </div>
                
                {produto.descricao && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{produto.descricao}</p>
                )}
                
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => toggleDisponibilidade(produto)}
                    className={`px-3 py-1 rounded text-sm ${
                      produto.disponivel
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {produto.disponivel ? '✓ Disponível' : '✕ Indisponível'}
                  </button>
                  {produto.extras?.length > 0 && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      {produto.extras.length} extra(s)
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => abrirModal(produto)}
                    className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded hover:bg-blue-100"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeletar(produto)}
                    className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded hover:bg-red-100"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
            <h2 className="text-2xl font-bold mb-4">
              {produtoEditando ? 'Editar Produto' : 'Novo Produto'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Código (opcional)</label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    placeholder="Ex: 01, A1, etc"
                  />
                </div>

                <div>
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
                  <p className="text-xs text-gray-500 mt-1">Digite apenas números. Ex: 1500 = R$ 15,00</p>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Nome do Produto *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="Ex: X-Burger"
                  required
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  placeholder="Descrição do produto"
                  rows="3"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Categoria *</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.icone} {cat.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Imagem do Produto</label>
                <SeletorImagemProduto
                  valor={formData.emoji || formData.imagem || null}
                  onChange={handleImagemChange}
                />
              </div>

              {extras.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Extras Disponíveis</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                    {extras.map((extra) => (
                      <label key={extra._id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.extras.includes(extra._id)}
                          onChange={() => toggleExtra(extra._id)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">
                          {extra.nome} (+R$ {extra.preco.toFixed(2)})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.disponivel}
                    onChange={(e) => setFormData({ ...formData, disponivel: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Produto disponível</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.destaque}
                    onChange={(e) => setFormData({ ...formData, destaque: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Produto em destaque</span>
                </label>
              </div>

              <div className="flex gap-3 mt-6">
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
                  {produtoEditando ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Produtos;
