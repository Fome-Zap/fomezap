import { useState, useEffect, useRef } from 'react';
import { RefreshCw, Bell, BellRing } from 'lucide-react';
import './Pedidos.css';
import api from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [tamanhoImpressora, setTamanhoImpressora] = useState('80mm'); // 58mm ou 80mm
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [modalConfirmacao, setModalConfirmacao] = useState({ aberto: false, pedido: null, novoStatus: null });
  const [modalImpressao, setModalImpressao] = useState({ aberto: false, pedido: null });
  const [nomeRestaurante, setNomeRestaurante] = useState('');
  const [novosPedidos, setNovosPedidos] = useState(0);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const audioRef = useRef(null);
  const pedidosAnterioresRef = useRef([]);
  
  // Pegar user do AuthContext (fonte confiável)
  const { user } = useAuth();
  const tenantId = user?.tenantId;
  
  console.log('👤 Pedidos.jsx - User do AuthContext:', user);
  console.log('🏢 Pedidos.jsx - TenantId extraído:', tenantId);

  // Carregar nome do restaurante
  useEffect(() => {
    const carregarNomeRestaurante = async () => {
      try {
        const response = await api.get(`/api/admin/${tenantId}/configuracoes`);
        setNomeRestaurante(response.data.nome || 'Restaurante');
      } catch (error) {
        console.error('Erro ao carregar nome do restaurante:', error);
        setNomeRestaurante('Restaurante');
      }
    };
    if (tenantId) {
      carregarNomeRestaurante();
    }
  }, [tenantId]);

  // Carregar pedidos
  useEffect(() => {
    if (!tenantId) {
      console.log('⏳ Aguardando tenantId...');
      return;
    }
    
    console.log('✅ TenantId disponível, carregando pedidos...');
    carregarPedidos(true); // Primeira carga
    
    // Polling automático a cada 15 segundos
    const interval = setInterval(() => carregarPedidos(false), 15000);
    return () => clearInterval(interval);
  }, [tenantId]); // Adiciona tenantId como dependência

  useEffect(() => {
    if (mensagem.texto) {
      const timer = setTimeout(() => {
        setMensagem({ tipo: '', texto: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensagem]);

  // Tocar som de notificação
  const tocarNotificacao = () => {
    // Criar som de notificação simples
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const mostrarMensagem = (texto, tipo = 'sucesso') => {
    setMensagem({ tipo, texto });
  };

  const carregarPedidos = async (isManual = false) => {
    try {
      if (isManual) setAtualizando(true);
      
      // SEMPRE buscar todos os pedidos para ter contadores corretos
      const url = `/api/admin/${tenantId}/pedidos`;
      
      console.log('🔍 Pedidos.jsx - Carregando pedidos...');
      console.log('📍 URL:', url);
      console.log('🔑 TenantId:', tenantId);
      console.log('👤 User:', user);
      
      const response = await api.get(url);
      
      console.log('✅ Resposta recebida:', response.status);
      console.log('📦 Dados:', response.data);
      
      const pedidosCarregados = response.data.pedidos || [];
      
      console.log('📋 Total de pedidos:', pedidosCarregados.length);
      
      // Detectar novos pedidos
      if (pedidosAnterioresRef.current.length > 0 && !isManual) {
        const idsAntigos = pedidosAnterioresRef.current.map(p => p._id);
        const pedidosRealmenteNovos = pedidosCarregados.filter(p => !idsAntigos.includes(p._id));
        
        if (pedidosRealmenteNovos.length > 0) {
          setNovosPedidos(prev => prev + pedidosRealmenteNovos.length);
          tocarNotificacao();
          mostrarMensagem(
            `🔔 ${pedidosRealmenteNovos.length} novo(s) pedido(s) chegou!`,
            'novo'
          );
          
          // Notificação do navegador (se permitido)
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Novo Pedido! 🍔', {
              body: `${pedidosRealmenteNovos.length} pedido(s) acabou de chegar!`,
              icon: '/logo.png',
              badge: '/logo.png'
            });
          }
        }
      }
      
      // Atualizar referência dos pedidos anteriores
      pedidosAnterioresRef.current = pedidosCarregados;
      
      // Feedback para atualização manual
      if (isManual) {
        if (pedidosCarregados.length === 0) {
          mostrarMensagem('✨ Nenhum pedido no momento. Tudo tranquilo!', 'info');
        } else {
          mostrarMensagem(`✅ Lista atualizada! ${pedidosCarregados.length} pedido(s) no total.`, 'info');
        }
      }
      
      setPedidos(pedidosCarregados);
      setUltimaAtualizacao(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      setLoading(false);
      if (isManual) {
        mostrarMensagem('❌ Não foi possível conectar ao servidor. Tente novamente.', 'erro');
      }
    } finally {
      if (isManual) setAtualizando(false);
    }
  };

  // Solicitar permissão para notificações
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

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
      await api.patch(`/api/admin/${tenantId}/pedidos/${pedido._id}`, { status: novoStatus });
      carregarPedidos(false);
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
    setModalImpressao({ aberto: true, pedido });
  };

  const confirmarImpressao = () => {
    setModalImpressao({ aberto: false, pedido: null });
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

  // Contar pedidos por status
  const contarPorStatus = (status) => {
    if (status === 'todos') return pedidos.length;
    return pedidos.filter(p => p.status === status).length;
  };

  // Filtrar pedidos para exibição (apenas status)
  const pedidosFiltrados = filtroStatus === 'todos' 
    ? pedidos 
    : pedidos.filter(p => p.status === filtroStatus);

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
      {/* Guia Simplificado - Primeira Visita */}
      {/* DESABILITADO - {mostrarGuia && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            padding: '30px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>
              🔔 Bem-vindo aos Pedidos!
            </h2>
            
            <div style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '24px' }}>
              <p style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#f97316', fontSize: '20px' }}>✨ É automático!</strong><br/>
                A lista atualiza sozinha a cada 15 segundos.
              </p>
              
              <p style={{ marginBottom: '16px' }}>
                <strong style={{ color: '#f97316', fontSize: '20px' }}>🔊 Você vai ouvir um "bip"</strong><br/>
                Quando chegar um pedido novo.
              </p>
              
              <p style={{ marginBottom: '0' }}>
                <strong style={{ color: '#f97316', fontSize: '20px' }}>� Aparece um botão laranja</strong><br/>
                Clique nele para ver os pedidos novos.
              </p>
            </div>
            
            <button
              onClick={() => {
                setMostrarGuia(false);
                localStorage.setItem('guia_pedidos_visto', 'true');
              }}
              style={{
                width: '100%',
                backgroundColor: '#2563eb',
                color: 'white',
                fontWeight: 'bold',
                padding: '14px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              Entendi! �
            </button>
          </div>
        </div> */}
      {/* )} FIM DO GUIA DESABILITADO */}

      {/* Toast de mensagem */}
      {mensagem.texto && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg animate-slideIn ${
          mensagem.tipo === 'sucesso' 
            ? 'bg-green-500 text-white' 
            : mensagem.tipo === 'info'
            ? 'bg-blue-500 text-white'
            : mensagem.tipo === 'novo'
            ? 'bg-orange-500 text-white border-2 border-orange-300'
            : 'bg-red-500 text-white'
        }`}>
          <span className="text-2xl">
            {mensagem.tipo === 'sucesso' ? '✅' : 
             mensagem.tipo === 'info' ? '✨' : 
             mensagem.tipo === 'novo' ? '🔔' : '⚠️'}
          </span>
          <div className="flex-1">
            <p className="font-semibold">
              {mensagem.tipo === 'sucesso' ? 'Sucesso!' : 
               mensagem.tipo === 'info' ? 'Atualizado!' : 
               mensagem.tipo === 'novo' ? 'Novo Pedido!' : 'Atenção!'}
            </p>
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
        <div>
          <h1>📦 Gerenciar Pedidos</h1>
          {ultimaAtualizacao && (
            <p className="text-xs text-gray-500 mt-1">
              Atualização automática a cada 15s • Última: {ultimaAtualizacao.toLocaleTimeString('pt-BR')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {novosPedidos > 0 && (
            <button
              onClick={() => {
                setFiltroStatus('recebido');
                setNovosPedidos(0);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 animate-pulse font-bold shadow-lg transition-all"
              title="Clique para ver os novos pedidos"
            >
              <BellRing className="w-5 h-5" />
              <span>{novosPedidos} novo(s)!</span>
            </button>
          )}
          <button 
            className={`btn-atualizar ${atualizando ? 'atualizando' : ''}`}
            onClick={() => carregarPedidos(true)}
            disabled={atualizando}
            title="Forçar atualização agora (atualiza automaticamente a cada 15s)"
          >
            <RefreshCw className={`w-4 sm:w-5 ${atualizando ? 'animate-spin' : ''}`} />
            <span>{atualizando ? 'Atualizando...' : 'Atualizar'}</span>
          </button>
        </div>
      </div>

      {/* Filtros de Status */}
      <div className="filtros-status">
        <button 
          className={filtroStatus === 'todos' ? 'filtro-ativo' : ''}
          onClick={() => {
            setFiltroStatus('todos');
            setNovosPedidos(0);
          }}
        >
          📋 Todos ({contarPorStatus('todos')})
        </button>
        <button 
          className={filtroStatus === 'recebido' ? 'filtro-ativo' : ''}
          onClick={() => {
            setFiltroStatus('recebido');
            setNovosPedidos(0);
          }}
        >
          ⏳ Aguardando ({contarPorStatus('recebido')})
        </button>
        <button 
          className={filtroStatus === 'preparando' ? 'filtro-ativo' : ''}
          onClick={() => {
            setFiltroStatus('preparando');
            setNovosPedidos(0);
          }}
        >
          👨‍🍳 Preparando ({contarPorStatus('preparando')})
        </button>
        <button 
          className={filtroStatus === 'pronto' ? 'filtro-ativo' : ''}
          onClick={() => {
            setFiltroStatus('pronto');
            setNovosPedidos(0);
          }}
        >
          ✅ Pronto ({contarPorStatus('pronto')})
        </button>
        <button 
          className={filtroStatus === 'saiu_entrega' ? 'filtro-ativo' : ''}
          onClick={() => {
            setFiltroStatus('saiu_entrega');
            setNovosPedidos(0);
          }}
        >
          🚚 Saiu para Entrega ({contarPorStatus('saiu_entrega')})
        </button>
        <button 
          className={filtroStatus === 'entregue' ? 'filtro-ativo' : ''}
          onClick={() => {
            setFiltroStatus('entregue');
            setNovosPedidos(0);
          }}
        >
          ✓ Entregue ({contarPorStatus('entregue')})
        </button>
        <button 
          className={filtroStatus === 'cancelado' ? 'filtro-ativo' : ''}
          onClick={() => {
            setFiltroStatus('cancelado');
            setNovosPedidos(0);
          }}
        >
          ✗ Cancelado ({contarPorStatus('cancelado')})
        </button>
      </div>

      {/* Lista de Pedidos */}
      {pedidosFiltrados.length === 0 ? (
        <div className="sem-pedidos">
          <p>📭 Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div className="pedidos-grid">
          {pedidosFiltrados.map(pedido => (
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
          <div className={`comanda-impressao comanda-${tamanhoImpressora}`}>
            {/* Nome do Restaurante no topo */}
            <h2 style={{ textAlign: 'center', marginBottom: '5px', fontSize: tamanhoImpressora === '58mm' ? '14px' : '18px' }}>
              🏪 {nomeRestaurante.toUpperCase()}
            </h2>
            <h3 style={{ textAlign: 'center', marginBottom: '15px', fontSize: tamanhoImpressora === '58mm' ? '12px' : '16px' }}>
              COMANDA DE PEDIDO
            </h3>
            <hr />
            <h3 style={{ fontSize: tamanhoImpressora === '58mm' ? '12px' : '14px' }}>Pedido #{pedidoSelecionado.numeroPedido}</h3>
            <p style={{ fontSize: tamanhoImpressora === '58mm' ? '10px' : '12px' }}>
              <strong>Data/Hora:</strong> {formatarData(pedidoSelecionado.createdAt)}
            </p>
            <hr />
            <h4 style={{ fontSize: tamanhoImpressora === '58mm' ? '11px' : '13px' }}>CLIENTE:</h4>
            <p style={{ fontSize: tamanhoImpressora === '58mm' ? '10px' : '12px' }}>
              <strong>Nome:</strong> {pedidoSelecionado.cliente.nome}
            </p>
            <p style={{ fontSize: tamanhoImpressora === '58mm' ? '10px' : '12px' }}>
              <strong>Telefone:</strong> {pedidoSelecionado.cliente.telefone}
            </p>
            {pedidoSelecionado.entrega.tipo === 'delivery' && (
              <>
                <p style={{ fontSize: tamanhoImpressora === '58mm' ? '10px' : '12px' }}>
                  <strong>Tipo:</strong> 🚚 ENTREGA
                </p>
                <p style={{ fontSize: tamanhoImpressora === '58mm' ? '10px' : '12px', wordWrap: 'break-word' }}>
                  <strong>Endereço:</strong> {pedidoSelecionado.entrega.endereco}
                </p>
              </>
            )}
            {pedidoSelecionado.entrega.tipo === 'retirada' && (
              <p style={{ fontSize: tamanhoImpressora === '58mm' ? '10px' : '12px' }}>
                <strong>Tipo:</strong> 🏪 RETIRADA NO LOCAL
              </p>
            )}
            <hr />
            <h4 style={{ fontSize: tamanhoImpressora === '58mm' ? '11px' : '13px' }}>ITENS DO PEDIDO:</h4>
            {pedidoSelecionado.itens.map((item, idx) => (
              <div key={idx} style={{ marginBottom: '15px', fontSize: tamanhoImpressora === '58mm' ? '10px' : '12px' }}>
                <p><strong>{item.quantidade}x {item.nome}</strong> - R$ {item.preco.toFixed(2)}</p>
                {item.extras.length > 0 && (
                  <p style={{ marginLeft: '10px', fontSize: tamanhoImpressora === '58mm' ? '9px' : '11px' }}>
                    + Extras: {item.extras.map(e => `${e.nome} (R$ ${e.preco.toFixed(2)})`).join(', ')}
                  </p>
                )}
                {item.observacoes && (
                  <p style={{ marginLeft: '10px', fontSize: tamanhoImpressora === '58mm' ? '9px' : '11px', fontStyle: 'italic' }}>
                    📝 OBS: {item.observacoes}
                  </p>
                )}
                <p style={{ marginLeft: '10px' }}>
                  <strong>Subtotal:</strong> R$ {item.subtotal.toFixed(2)}
                </p>
              </div>
            ))}
            <hr />
            {pedidoSelecionado.observacoes && (
              <>
                <h4 style={{ fontSize: tamanhoImpressora === '58mm' ? '11px' : '13px' }}>OBSERVAÇÕES GERAIS:</h4>
                <p style={{ fontSize: tamanhoImpressora === '58mm' ? '10px' : '12px' }}>{pedidoSelecionado.observacoes}</p>
                <hr />
              </>
            )}
            <h4 style={{ fontSize: tamanhoImpressora === '58mm' ? '11px' : '13px' }}>PAGAMENTO:</h4>
            <p style={{ fontSize: tamanhoImpressora === '58mm' ? '10px' : '12px' }}>
              <strong>Forma:</strong> {pedidoSelecionado.pagamento.forma}
            </p>
            {pedidoSelecionado.entrega.taxa > 0 && (
              <p style={{ fontSize: tamanhoImpressora === '58mm' ? '10px' : '12px' }}>
                <strong>Taxa de Entrega:</strong> R$ {pedidoSelecionado.entrega.taxa.toFixed(2)}
              </p>
            )}
            <h3 style={{ textAlign: 'right', marginTop: '20px', fontSize: tamanhoImpressora === '58mm' ? '12px' : '16px' }}>
              TOTAL: R$ {pedidoSelecionado.valorTotal.toFixed(2)}
            </h3>
          </div>
        </div>
      )}

      {/* Modal de Seleção de Tamanho de Impressora */}
      {modalImpressao.aberto && (
        <div className="modal-overlay" onClick={() => setModalImpressao({ aberto: false, pedido: null })}>
          <div className="modal-confirmacao" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🖨️ Selecionar Tamanho da Impressora</h3>
              <button className="modal-close" onClick={() => setModalImpressao({ aberto: false, pedido: null })}>✕</button>
            </div>
            
            <div className="modal-body">
              <p className="modal-pedido-info">
                Pedido <strong>#{modalImpressao.pedido?.numeroPedido}</strong>
              </p>
              
              <div style={{ marginTop: '20px' }}>
                <p style={{ marginBottom: '15px', color: '#666' }}>
                  Selecione o tamanho da impressora térmica:
                </p>
                
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button
                    onClick={() => setTamanhoImpressora('58mm')}
                    className={`btn-tamanho-impressora ${tamanhoImpressora === '58mm' ? 'active' : ''}`}
                    style={{
                      padding: '15px 30px',
                      border: tamanhoImpressora === '58mm' ? '3px solid #10b981' : '2px solid #ddd',
                      borderRadius: '8px',
                      background: tamanhoImpressora === '58mm' ? '#ecfdf5' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '5px' }}>📄</div>
                    <div style={{ fontWeight: 'bold' }}>58mm</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Menor</div>
                  </button>
                  
                  <button
                    onClick={() => setTamanhoImpressora('80mm')}
                    className={`btn-tamanho-impressora ${tamanhoImpressora === '80mm' ? 'active' : ''}`}
                    style={{
                      padding: '15px 30px',
                      border: tamanhoImpressora === '80mm' ? '3px solid #10b981' : '2px solid #ddd',
                      borderRadius: '8px',
                      background: tamanhoImpressora === '80mm' ? '#ecfdf5' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '5px' }}>📃</div>
                    <div style={{ fontWeight: 'bold' }}>80mm</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Padrão</div>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-cancelar" 
                onClick={() => setModalImpressao({ aberto: false, pedido: null })}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirmar"
                onClick={confirmarImpressao}
              >
                🖨️ Imprimir
              </button>
            </div>
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
