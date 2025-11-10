import { useState, useEffect } from 'react';
import './Pedidos.css';
import api from '../../api/api';

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [modalConfirmacao, setModalConfirmacao] = useState({ aberto: false, pedido: null, novoStatus: null });
  const tenantSlug = 'demo'; // TODO: Pegar dinamicamente do contexto

  // Carregar pedidos
  useEffect(() => {
    carregarPedidos();
    // Atualizar a cada 30 segundos
    const interval = setInterval(carregarPedidos, 30000);
    return () => clearInterval(interval);
  }, [filtroStatus]);

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

  const carregarPedidos = async () => {
    try {
      const url = filtroStatus === 'todos' 
        ? `/api/admin/${tenantSlug}/pedidos`
        : `/api/admin/${tenantSlug}/pedidos?status=${filtroStatus}`;
      
      const response = await api.get(url);
      setPedidos(response.data.pedidos || []);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      setLoading(false);
    }
  };

  // Alterar status do pedido
  const abrirModalConfirmacao = (pedido, novoStatus) => {
    setModalConfirmacao({ aberto: true, pedido, novoStatus });
  };

  const fecharModalConfirmacao = () => {
    setModalConfirmacao({ aberto: false, pedido: null, novoStatus: null });
  };

  const confirmarAlteracaoStatus = async () => {
    const { pedido, novoStatus } = modalConfirmacao;
    
    try {
      await api.patch(`/api/admin/${tenantSlug}/pedidos/${pedido._id}`, { status: novoStatus });
      carregarPedidos();
      mostrarMensagem('Status alterado com sucesso!', 'sucesso');
      fecharModalConfirmacao();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      mostrarMensagem('Erro ao alterar status do pedido', 'erro');
    }
  };

  // Imprimir pedido
  const imprimirPedido = (pedido) => {
    setPedidoSelecionado(pedido);
    setTimeout(() => {
      window.print();
      setPedidoSelecionado(null);
    }, 100);
  };

  // Status com cores e informações
  const getStatusInfo = (status) => {
    const statusConfig = {
      'recebido': { label: '🔔 Recebido', cor: '#3b82f6', emoji: '🔔' },
      'preparando': { label: '👨‍🍳 Preparando', cor: '#f59e0b', emoji: '👨‍🍳' },
      'pronto': { label: '✅ Pronto', cor: '#10b981', emoji: '✅' },
      'saiu_entrega': { label: '🚚 Saiu p/ Entrega', cor: '#8b5cf6', emoji: '🚚' },
      'entregue': { label: '🎉 Entregue', cor: '#059669', emoji: '🎉' },
      'cancelado': { label: '❌ Cancelado', cor: '#ef4444', emoji: '❌' }
    };
    return statusConfig[status] || { label: status, cor: '#6b7280', emoji: '📋' };
  };

  const getStatusBadge = (status) => {
    const info = getStatusInfo(status);
    return <span className={`status-badge status-${status}`}>{info.label}</span>;
  };

  // Obter opções de status disponíveis (exceto o atual)
  const getOpcoesStatus = (statusAtual) => {
    const todosStatus = [
      { valor: 'recebido', label: '🔔 Recebido', cor: '#3b82f6' },
      { valor: 'preparando', label: '👨‍🍳 Preparando', cor: '#f59e0b' },
      { valor: 'pronto', label: '✅ Pronto', cor: '#10b981' },
      { valor: 'saiu_entrega', label: '🚚 Saiu p/ Entrega', cor: '#8b5cf6' },
      { valor: 'entregue', label: '🎉 Entregue', cor: '#059669' },
      { valor: 'cancelado', label: '❌ Cancelar', cor: '#ef4444' }
    ];
    
    // Filtrar o status atual
    return todosStatus.filter(s => s.valor !== statusAtual);
  };

  const formatarData = (dataISO) => {
    const data = new Date(dataISO);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Carregando pedidos...</div>;
  }

  return (
    <div className="pedidos-container">
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

      <div className="pedidos-header">
        <h1>📦 Pedidos Online</h1>
        <button className="btn-atualizar" onClick={carregarPedidos}>
          🔄 Atualizar
        </button>
      </div>

      {/* Filtros de Status */}
      <div className="filtros-status">
        <button 
          className={filtroStatus === 'todos' ? 'filtro-ativo' : ''}
          onClick={() => setFiltroStatus('todos')}
        >
          Todos ({pedidos.length})
        </button>
        <button 
          className={filtroStatus === 'recebido' ? 'filtro-ativo' : ''}
          onClick={() => setFiltroStatus('recebido')}
        >
          🔔 Novos
        </button>
        <button 
          className={filtroStatus === 'preparando' ? 'filtro-ativo' : ''}
          onClick={() => setFiltroStatus('preparando')}
        >
          👨‍🍳 Preparando
        </button>
        <button 
          className={filtroStatus === 'pronto' ? 'filtro-ativo' : ''}
          onClick={() => setFiltroStatus('pronto')}
        >
          ✅ Prontos
        </button>
        <button 
          className={filtroStatus === 'saiu_entrega' ? 'filtro-ativo' : ''}
          onClick={() => setFiltroStatus('saiu_entrega')}
        >
          🚚 Em Entrega
        </button>
      </div>

      {/* Lista de Pedidos */}
      {pedidos.length === 0 ? (
        <div className="sem-pedidos">
          <p>📭 Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div className="pedidos-grid">
          {pedidos.map(pedido => (
            <div key={pedido._id} className="pedido-card">
              <div className="pedido-header-card">
                <div>
                  <h3>Pedido #{pedido.numeroPedido}</h3>
                  <p className="pedido-data">{formatarData(pedido.createdAt)}</p>
                </div>
                {getStatusBadge(pedido.status)}
              </div>

              <div className="pedido-cliente">
                <p><strong>👤 Cliente:</strong> {pedido.cliente.nome}</p>
                <p><strong>📱 Telefone:</strong> {pedido.cliente.telefone}</p>
                {pedido.entrega.tipo === 'delivery' && (
                  <p><strong>📍 Endereço:</strong> {pedido.entrega.endereco}</p>
                )}
                {pedido.entrega.tipo === 'retirada' && (
                  <p><strong>🏪 Tipo:</strong> Retirada no local</p>
                )}
              </div>

              <div className="pedido-itens">
                <strong>📋 Itens:</strong>
                {pedido.itens.map((item, idx) => (
                  <div key={idx} className="item-resumo">
                    <span>{item.quantidade}x {item.nome}</span>
                    {item.extras.length > 0 && (
                      <span className="item-extras">
                        + {item.extras.map(e => e.nome).join(', ')}
                      </span>
                    )}
                    {item.observacoes && (
                      <span className="item-obs">📝 {item.observacoes}</span>
                    )}
                  </div>
                ))}
              </div>

              {pedido.observacoes && (
                <div className="pedido-observacoes">
                  <strong>📝 Observações Gerais:</strong>
                  <p>{pedido.observacoes}</p>
                </div>
              )}

              <div className="pedido-pagamento">
                <p><strong>💳 Pagamento:</strong> {pedido.pagamento.forma}</p>
                <p className="pedido-total">
                  <strong>💰 Total:</strong> R$ {pedido.valorTotal.toFixed(2)}
                </p>
              </div>

              {/* Badges de Status Clicáveis */}
              {pedido.status !== 'entregue' && pedido.status !== 'cancelado' && (
                <div className="alterar-status-section">
                  <p style={{ fontSize: '14px', marginBottom: '10px', fontWeight: '500' }}>
                    Alterar para:
                  </p>
                  <div className="status-badges-container">
                    {getOpcoesStatus(pedido.status).map((opcao) => (
                      <button
                        key={opcao.valor}
                        className="status-badge-btn"
                        style={{ 
                          backgroundColor: opcao.cor,
                          opacity: 0.9
                        }}
                        onClick={() => abrirModalConfirmacao(pedido, opcao.valor)}
                        onMouseEnter={(e) => e.target.style.opacity = '1'}
                        onMouseLeave={(e) => e.target.style.opacity = '0.9'}
                      >
                        {opcao.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pedido-acoes">
                <button 
                  className="btn-imprimir"
                  onClick={() => imprimirPedido(pedido)}
                >
                  🖨️ Imprimir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Área de Impressão (oculta na tela, visível apenas ao imprimir) */}
      {pedidoSelecionado && (
        <div className="print-only">
          <div className="comanda-impressao">
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
              🍔 COMANDA DE PEDIDO
            </h2>
            <hr />
            <h3>Pedido #{pedidoSelecionado.numeroPedido}</h3>
            <p><strong>Data/Hora:</strong> {formatarData(pedidoSelecionado.createdAt)}</p>
            <hr />
            <h4>CLIENTE:</h4>
            <p><strong>Nome:</strong> {pedidoSelecionado.cliente.nome}</p>
            <p><strong>Telefone:</strong> {pedidoSelecionado.cliente.telefone}</p>
            {pedidoSelecionado.entrega.tipo === 'delivery' && (
              <>
                <p><strong>Tipo:</strong> 🚚 ENTREGA</p>
                <p><strong>Endereço:</strong> {pedidoSelecionado.entrega.endereco}</p>
              </>
            )}
            {pedidoSelecionado.entrega.tipo === 'retirada' && (
              <p><strong>Tipo:</strong> 🏪 RETIRADA NO LOCAL</p>
            )}
            <hr />
            <h4>ITENS DO PEDIDO:</h4>
            {pedidoSelecionado.itens.map((item, idx) => (
              <div key={idx} style={{ marginBottom: '15px' }}>
                <p><strong>{item.quantidade}x {item.nome}</strong> - R$ {item.preco.toFixed(2)}</p>
                {item.extras.length > 0 && (
                  <p style={{ marginLeft: '20px', fontSize: '0.9em' }}>
                    + Extras: {item.extras.map(e => `${e.nome} (R$ ${e.preco.toFixed(2)})`).join(', ')}
                  </p>
                )}
                {item.observacoes && (
                  <p style={{ marginLeft: '20px', fontSize: '0.9em', fontStyle: 'italic' }}>
                    📝 OBS: {item.observacoes}
                  </p>
                )}
                <p style={{ marginLeft: '20px' }}>
                  <strong>Subtotal:</strong> R$ {item.subtotal.toFixed(2)}
                </p>
              </div>
            ))}
            <hr />
            {pedidoSelecionado.observacoes && (
              <>
                <h4>OBSERVAÇÕES GERAIS:</h4>
                <p>{pedidoSelecionado.observacoes}</p>
                <hr />
              </>
            )}
            <h4>PAGAMENTO:</h4>
            <p><strong>Forma:</strong> {pedidoSelecionado.pagamento.forma}</p>
            {pedidoSelecionado.entrega.taxa > 0 && (
              <p><strong>Taxa de Entrega:</strong> R$ {pedidoSelecionado.entrega.taxa.toFixed(2)}</p>
            )}
            <h3 style={{ textAlign: 'right', marginTop: '20px' }}>
              TOTAL: R$ {pedidoSelecionado.valorTotal.toFixed(2)}
            </h3>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Alteração de Status */}
      {modalConfirmacao.aberto && (
        <div className="modal-overlay" onClick={fecharModalConfirmacao}>
          <div className="modal-confirmacao" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ Confirmar Alteração de Status</h3>
              <button className="modal-close" onClick={fecharModalConfirmacao}>✕</button>
            </div>
            
            <div className="modal-body">
              <p className="modal-pedido-info">
                Pedido <strong>#{modalConfirmacao.pedido?.numeroPedido}</strong>
              </p>
              
              <div className="status-change-preview">
                <div className="status-atual">
                  <span className="label">Status atual:</span>
                  <span className={`status-badge status-${modalConfirmacao.pedido?.status}`}>
                    {getStatusInfo(modalConfirmacao.pedido?.status).label}
                  </span>
                </div>
                
                <div className="arrow">↓</div>
                
                <div className="status-novo">
                  <span className="label">Alterar para:</span>
                  <span className={`status-badge status-${modalConfirmacao.novoStatus}`}>
                    {getStatusInfo(modalConfirmacao.novoStatus).label}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-cancelar-modal" onClick={fecharModalConfirmacao}>
                Cancelar
              </button>
              <button className="btn-confirmar-modal" onClick={confirmarAlteracaoStatus}>
                ✅ Confirmar Alteração
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
