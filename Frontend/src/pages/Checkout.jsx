import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { API_URL, getCurrentTenant } from '../config/api';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // DETECÇÃO AUTOMÁTICA DE TENANT POR SUBDOMÍNIO
  const tenantId = getCurrentTenant() || searchParams.get('tenant') || 'demo';
  
  // Receber carrinho via location.state OU do localStorage
  const [carrinho] = useState(() => {
    if (location.state?.carrinho) {
      return location.state.carrinho;
    }
    // Fallback: tentar recuperar do localStorage
    const carrinhoSalvo = localStorage.getItem(`carrinho_${tenantId}`);
    return carrinhoSalvo ? JSON.parse(carrinhoSalvo) : [];
  });

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [configRestaurante, setConfigRestaurante] = useState({
    nome: '',
    endereco: '',
    telefone: '',
    horarioAbertura: '',
    horarioFechamento: ''
  });

  // Carregar configurações do restaurante
  useEffect(() => {
    const carregarConfiguracoes = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/${tenantId}/configuracoes`);
        if (response.ok) {
          const data = await response.json();
          setConfigRestaurante({
            nome: data.nome || 'Restaurante',
            endereco: data.endereco || '',
            telefone: data.telefone || '',
            horarioAbertura: data.horarioAbertura || '',
            horarioFechamento: data.horarioFechamento || ''
          });
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    };
    carregarConfiguracoes();
  }, [tenantId]);

  // Auto-esconder erro após 5 segundos
  useEffect(() => {
    if (erro) {
      const timer = setTimeout(() => setErro(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [erro]);

  // Form data
  const [cliente, setCliente] = useState({
    nome: '',
    telefone: '',
    email: ''
  });

  const [tipoEntrega, setTipoEntrega] = useState('delivery');
  const [endereco, setEndereco] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Cálculos
  const subtotal = carrinho.reduce((total, item) => {
    const extrasTotal = item.extras?.reduce((sum, extra) => sum + extra.preco, 0) || 0;
    return total + ((item.preco + extrasTotal) * item.quantidade);
  }, 0);

  const taxaEntrega = tipoEntrega === 'delivery' ? 5.00 : 0;
  const total = subtotal + taxaEntrega;

  // Validações
  const validarFormulario = () => {
    if (!cliente.nome.trim()) {
      setErro('Por favor, informe seu nome');
      return false;
    }

    if (!cliente.telefone.trim()) {
      setErro('Por favor, informe seu telefone');
      return false;
    }

    if (!/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/.test(cliente.telefone.replace(/\s/g, ''))) {
      setErro('Telefone inválido. Use o formato (00) 00000-0000');
      return false;
    }

    if (tipoEntrega === 'delivery' && !endereco.trim()) {
      setErro('Por favor, informe o endereço de entrega');
      return false;
    }

    if (!formaPagamento) {
      setErro('Por favor, selecione a forma de pagamento');
      return false;
    }

    return true;
  };

  // Máscara de telefone
  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 10) {
      return numeros.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    }
    return numeros.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  };

  const handleTelefoneChange = (e) => {
    const valor = e.target.value;
    setCliente({ ...cliente, telefone: formatarTelefone(valor) });
  };

  // Finalizar pedido
  const finalizarPedido = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    setErro('');

    try {
      const pedido = {
        cliente,
        itens: carrinho.map(item => ({
          produtoId: item._id, // Garantir que está usando _id do produto
          nome: item.nome,
          preco: item.preco,
          quantidade: item.quantidade,
          extras: (item.extras || []).map(extra => ({
            id: extra._id || extra.id,
            nome: extra.nome,
            preco: extra.preco
          })),
          observacoes: item.observacoes || ''
        })),
        entrega: {
          tipo: tipoEntrega,
          endereco: tipoEntrega === 'delivery' ? endereco : '',
          taxa: taxaEntrega
        },
        pagamento: {
          forma: formaPagamento,
          status: 'pendente'
        },
        observacoes
      };

      console.log('📤 Enviando pedido:', pedido);
      console.log('🔍 URL da API:', `${API_URL}/${tenantId}/pedidos`);
      console.log('📦 Itens detalhados:', JSON.stringify(pedido.itens, null, 2));

      const response = await fetch(`${API_URL}/${tenantId}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido)
      });

      console.log('📊 Status da resposta:', response.status);
      
      const data = await response.json();
      console.log('📥 Resposta completa do servidor:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        console.error('❌ Erro do servidor (status ' + response.status + '):', JSON.stringify(data, null, 2));
        throw new Error(data.message || 'Erro ao finalizar pedido');
      }

      // Limpar carrinho do localStorage
      localStorage.removeItem(`carrinho_${tenantId}`);

      // Redirecionar para página de sucesso
      navigate(`/pedido-confirmado?numero=${data.pedido.numeroPedido}&whatsapp=${encodeURIComponent(data.whatsappUrl)}`);

    } catch (error) {
      console.error('❌ Erro ao finalizar pedido:', error);
      console.error('❌ Detalhes:', error.message);
      setErro(error.message || 'Erro ao processar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (carrinho.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-2">Carrinho Vazio</h2>
          <p className="text-gray-600 mb-6">Adicione produtos para fazer seu pedido</p>
          <button
            onClick={() => navigate('/')}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Ver Cardápio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
      
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <span className="mr-2">←</span> Voltar ao cardápio
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-8">Finalizar Pedido</h1>

        {/* Toast de Erro Flutuante */}
        {erro && (
          <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg max-w-md animate-slide-in flex items-center gap-3">
            <div className="text-2xl">⚠️</div>
            <div className="flex-1">
              <p className="font-semibold">Atenção!</p>
              <p className="text-sm">{erro}</p>
            </div>
            <button
              onClick={() => setErro('')}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados do Cliente */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">📋 Seus Dados</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome completo *
                  </label>
                  <input
                    type="text"
                    value={cliente.nome}
                    onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    value={cliente.telefone}
                    onChange={handleTelefoneChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="(00) 00000-0000"
                    maxLength="15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail (opcional)
                  </label>
                  <input
                    type="email"
                    value={cliente.email}
                    onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Tipo de Entrega */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">🚚 Entrega</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  onClick={() => setTipoEntrega('delivery')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    tipoEntrega === 'delivery'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">🛵</div>
                  <div className="font-bold">Delivery</div>
                  <div className="text-sm text-gray-600">R$ {taxaEntrega.toFixed(2)}</div>
                </button>

                <button
                  onClick={() => setTipoEntrega('retirada')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    tipoEntrega === 'retirada'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">🏪</div>
                  <div className="font-bold">Retirada</div>
                  <div className="text-sm text-gray-600">Grátis</div>
                </button>
              </div>

              {tipoEntrega === 'delivery' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço de entrega *
                  </label>
                  <textarea
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Rua, número, bairro, complemento..."
                    rows="3"
                  />
                </div>
              )}

              {tipoEntrega === 'retirada' && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📍</span>
                    <div className="flex-1">
                      <p className="font-semibold text-orange-900 mb-1">Local de Retirada:</p>
                      <p className="text-orange-800 font-medium">
                        {configRestaurante.nome || 'Restaurante'}
                      </p>
                      <p className="text-orange-800 mt-1">
                        {configRestaurante.endereco || 'Endereço não cadastrado'}
                      </p>
                      {configRestaurante.telefone && (
                        <p className="text-orange-700 mt-1">
                          📱 {configRestaurante.telefone}
                        </p>
                      )}
                      {configRestaurante.horarioAbertura && configRestaurante.horarioFechamento && (
                        <p className="text-sm text-orange-700 mt-2">
                          ⏰ Horário: {configRestaurante.horarioAbertura} às {configRestaurante.horarioFechamento}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Forma de Pagamento */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">💳 Pagamento</h2>
              
              <div className="space-y-2">
                {['Dinheiro', 'PIX', 'Cartão de Crédito', 'Cartão de Débito'].map((forma) => (
                  <label key={forma} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="pagamento"
                      value={forma.toLowerCase()}
                      checked={formaPagamento === forma.toLowerCase()}
                      onChange={(e) => setFormaPagamento(e.target.value)}
                      className="w-4 h-4 text-orange-500"
                    />
                    <span className="ml-3">{forma}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Observações */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">📝 Observações</h2>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Alguma observação sobre o pedido?"
                rows="3"
              />
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>
              
              <div className="space-y-3 mb-4">
                {carrinho.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <div className="font-medium">{item.quantidade}x {item.nome}</div>
                      {item.extras?.length > 0 && (
                        <div className="text-gray-600 text-xs">
                          {item.extras.map(e => e.nome).join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="font-medium">
                      R$ {((item.preco + (item.extras?.reduce((s, e) => s + e.preco, 0) || 0)) * item.quantidade).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxa de entrega</span>
                  <span>R$ {taxaEntrega.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={finalizarPedido}
                disabled={loading}
                className="w-full bg-green-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? 'Processando...' : 'Finalizar Pedido'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
