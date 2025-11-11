// src/pages/Admin/Dashboard.jsx - Dashboard com análise de pedidos e faturamento
import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, DollarSign, Package, Clock, Award } from 'lucide-react';
import './Dashboard.css';
import api from '../../api/api';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [pedidos, setPedidos] = useState([]);
  const tenantSlug = 'demo';
  
  // Filtro de data
  const [filtroData, setFiltroData] = useState('hoje');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  useEffect(() => {
    // Definir datas ANTES de carregar pedidos
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataHoje = formatarDataInput(hoje);
    
    setDataInicio(dataHoje);
    setDataFim(dataHoje);
    setFiltroData('hoje');
    
    // Pequeno delay para garantir que os estados foram atualizados
    setTimeout(() => {
      carregarPedidos();
    }, 100);
  }, []);

  useEffect(() => {
    // Recarregar quando mudar período (mas não na primeira vez)
    if (dataInicio && dataFim && pedidos.length > 0) {
      // Apenas filtra, não precisa buscar novamente
    }
  }, [dataInicio, dataFim]);

  // Funções auxiliares para datas
  const obterDataHoje = () => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return hoje;
  };

  const obterDataOntem = () => {
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    ontem.setHours(0, 0, 0, 0);
    return ontem;
  };

  const obterData7DiasAtras = () => {
    const data = new Date();
    data.setDate(data.getDate() - 7);
    data.setHours(0, 0, 0, 0);
    return data;
  };

  const formatarDataInput = (date) => {
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const dia = String(date.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };

  const aplicarFiltroData = (tipo) => {
    setFiltroData(tipo);
    setMostrarCalendario(false);
    
    const hoje = obterDataHoje();
    
    switch (tipo) {
      case 'hoje':
        setDataInicio(formatarDataInput(hoje));
        setDataFim(formatarDataInput(hoje));
        break;
      case 'ontem':
        const ontem = obterDataOntem();
        setDataInicio(formatarDataInput(ontem));
        setDataFim(formatarDataInput(ontem));
        break;
      case '7dias':
        const seteAtras = obterData7DiasAtras();
        setDataInicio(formatarDataInput(seteAtras));
        setDataFim(formatarDataInput(hoje));
        break;
      case 'personalizado':
        setMostrarCalendario(true);
        if (!dataInicio) setDataInicio(formatarDataInput(hoje));
        if (!dataFim) setDataFim(formatarDataInput(hoje));
        break;
    }
  };

  const carregarPedidos = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/admin/${tenantSlug}/pedidos`);
      const pedidosRecebidos = response.data.pedidos || [];
      setPedidos(pedidosRecebidos);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar pedidos por data
  const filtrarPorData = (pedido) => {
    if (!dataInicio || !dataFim) return true;
    
    const dataPedido = new Date(pedido.createdAt);
    
    // Criar datas de início e fim considerando o horário local
    const [anoInicio, mesInicio, diaInicio] = dataInicio.split('-').map(Number);
    const inicio = new Date(anoInicio, mesInicio - 1, diaInicio, 0, 0, 0, 0);
    
    const [anoFim, mesFim, diaFim] = dataFim.split('-').map(Number);
    const fim = new Date(anoFim, mesFim - 1, diaFim, 23, 59, 59, 999);
    
    return dataPedido >= inicio && dataPedido <= fim;
  };

  const pedidosFiltrados = pedidos.filter(p => filtrarPorData(p));

  // Cálculos de KPIs
  const calcularFaturamento = () => {
    return pedidosFiltrados
      .filter(p => p.status !== 'cancelado')
      .reduce((total, pedido) => {
        // Pedidos podem ter 'total' ou 'valorTotal'
        const valor = pedido.valorTotal || pedido.total || 0;
        return total + valor;
      }, 0);
  };

  const calcularTicketMedio = () => {
    const pedidosValidos = pedidosFiltrados.filter(p => p.status !== 'cancelado');
    if (pedidosValidos.length === 0) return 0;
    return calcularFaturamento() / pedidosValidos.length;
  };

  const contarPorStatus = (status) => {
    return pedidosFiltrados.filter(p => p.status === status).length;
  };

  const calcularEmAndamento = () => {
    return contarPorStatus('recebido') + contarPorStatus('preparando') + contarPorStatus('pronto') + contarPorStatus('saiu_entrega');
  };

  const calcularFinalizados = () => {
    return contarPorStatus('entregue');
  };

  // Top 5 produtos mais vendidos
  const calcularTopProdutos = () => {
    const produtosMap = {};
    
    pedidosFiltrados
      .filter(p => p.status !== 'cancelado')
      .forEach(pedido => {
        if (!pedido.itens || !Array.isArray(pedido.itens)) return;
        
        pedido.itens.forEach(item => {
          if (!produtosMap[item.nome]) {
            produtosMap[item.nome] = {
              nome: item.nome,
              quantidade: 0,
              faturamento: 0
            };
          }
          produtosMap[item.nome].quantidade += item.quantidade || 0;
          
          // Calcular faturamento: pode ser precoUnitario, preco, ou valorUnitario
          const preco = item.precoUnitario || item.preco || item.valorUnitario || 0;
          const quantidade = item.quantidade || 0;
          produtosMap[item.nome].faturamento += preco * quantidade;
        });
      });
    
    return Object.values(produtosMap)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);
  };

  // Faturamento por dia (últimos 7 dias)
  const calcularFaturamentoPorDia = () => {
    const faturamentoDias = {};
    const hoje = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i);
      const dataKey = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      faturamentoDias[dataKey] = 0;
    }
    
    pedidosFiltrados
      .filter(p => p.status !== 'cancelado')
      .forEach(pedido => {
        const dataPedido = new Date(pedido.createdAt);
        const dataKey = dataPedido.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        if (faturamentoDias.hasOwnProperty(dataKey)) {
          const valor = pedido.valorTotal || pedido.total || 0;
          faturamentoDias[dataKey] += valor;
        }
      });
    
    return faturamentoDias;
  };

  // Horários de pico
  const calcularHorariosPico = () => {
    const horariosMap = {};
    
    pedidosFiltrados.forEach(pedido => {
      const hora = new Date(pedido.createdAt).getHours();
      const faixa = `${hora}h-${hora + 1}h`;
      horariosMap[faixa] = (horariosMap[faixa] || 0) + 1;
    });
    
    return Object.entries(horariosMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  };

  const topProdutos = calcularTopProdutos();
  const faturamentoPorDia = calcularFaturamentoPorDia();
  const horariosPico = calcularHorariosPico();
  const maxFaturamento = Math.max(...Object.values(faturamentoPorDia), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">📊 Dashboard - Análise de Negócio</h1>
      
      {/* Filtro de Data */}
      <div className="filtro-data-dashboard">
        <div className="filtro-data-opcoes">
          <Calendar className="w-5 h-5 text-gray-600" />
          <button
            className={filtroData === 'hoje' ? 'filtro-data-ativo' : ''}
            onClick={() => aplicarFiltroData('hoje')}
          >
            Hoje
          </button>
          <button
            className={filtroData === 'ontem' ? 'filtro-data-ativo' : ''}
            onClick={() => aplicarFiltroData('ontem')}
          >
            Ontem
          </button>
          <button
            className={filtroData === '7dias' ? 'filtro-data-ativo' : ''}
            onClick={() => aplicarFiltroData('7dias')}
          >
            Últimos 7 dias
          </button>
          <button
            className={filtroData === 'personalizado' ? 'filtro-data-ativo' : ''}
            onClick={() => aplicarFiltroData('personalizado')}
          >
            📅 Personalizado
          </button>
        </div>

        {mostrarCalendario && (
          <div className="filtro-data-calendario">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">De:</label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Até:</label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KPIs Principais */}
      <div className="kpis-principais">
        {/* Faturamento */}
        <div className="kpi-card destaque">
          <div className="kpi-icon">
            <DollarSign className="w-8 h-8" />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Faturamento Total</p>
            <p className="kpi-valor-grande">R$ {calcularFaturamento().toFixed(2).replace('.', ',')}</p>
          </div>
        </div>

        {/* Total de Pedidos */}
        <div className="kpi-card">
          <div className="kpi-icon blue">
            <Package className="w-8 h-8" />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Total de Pedidos</p>
            <p className="kpi-valor">{pedidosFiltrados.length}</p>
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="kpi-card">
          <div className="kpi-icon green">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Ticket Médio</p>
            <p className="kpi-valor">R$ {calcularTicketMedio().toFixed(2).replace('.', ',')}</p>
          </div>
        </div>
      </div>

      {/* Cards de Status */}
      <div className="kpis-status">
        <div className="status-card aguardando">
          <div className="status-icon">⏳</div>
          <div>
            <p className="status-valor">{contarPorStatus('recebido')}</p>
            <p className="status-label">Aguardando</p>
          </div>
        </div>

        <div className="status-card em-andamento">
          <div className="status-icon">🔥</div>
          <div>
            <p className="status-valor">{calcularEmAndamento()}</p>
            <p className="status-label">Em Andamento</p>
          </div>
        </div>

        <div className="status-card finalizados">
          <div className="status-icon">✅</div>
          <div>
            <p className="status-valor">{calcularFinalizados()}</p>
            <p className="status-label">Finalizados</p>
          </div>
        </div>

        <div className="status-card cancelados">
          <div className="status-icon">❌</div>
          <div>
            <p className="status-valor">{contarPorStatus('cancelado')}</p>
            <p className="status-label">Cancelados</p>
          </div>
        </div>
      </div>

      {/* Gráfico de Faturamento */}
      <div className="grafico-container">
        <h2 className="secao-titulo">📊 Faturamento - Últimos 7 Dias</h2>
        <div className="grafico-barras">
          {Object.entries(faturamentoPorDia).map(([dia, valor]) => (
            <div key={dia} className="barra-wrapper">
              <div 
                className="barra" 
                style={{ height: `${(valor / maxFaturamento) * 100}%` }}
                title={`R$ ${valor.toFixed(2)}`}
              >
                <span className="barra-valor">R$ {valor.toFixed(0)}</span>
              </div>
              <span className="barra-label">{dia}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Produtos e Horários */}
      <div className="grid-2cols">
        {/* Top 5 Produtos */}
        <div className="card-analise">
          <h2 className="secao-titulo">
            <Award className="w-6 h-6 inline-block mr-2" />
            Top 5 Produtos Mais Vendidos
          </h2>
          <div className="lista-produtos">
            {topProdutos.length === 0 ? (
              <p className="texto-vazio">Nenhum produto vendido no período</p>
            ) : (
              topProdutos.map((produto, index) => (
                <div key={index} className="produto-item">
                  <div className="produto-posicao">{index + 1}º</div>
                  <div className="produto-info">
                    <p className="produto-nome">{produto.nome}</p>
                    <p className="produto-detalhes">
                      {produto.quantidade} vendidos • R$ {produto.faturamento.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Horários de Pico */}
        <div className="card-analise">
          <h2 className="secao-titulo">
            <Clock className="w-6 h-6 inline-block mr-2" />
            Horários de Pico
          </h2>
          <div className="lista-horarios">
            {horariosPico.length === 0 ? (
              <p className="texto-vazio">Sem dados de horários no período</p>
            ) : (
              horariosPico.map(([horario, quantidade], index) => (
                <div key={index} className="horario-item">
                  <div className="horario-badge">🕐 {horario}</div>
                  <div className="horario-info">
                    <div className="horario-barra">
                      <div 
                        className="horario-progresso" 
                        style={{ width: `${(quantidade / pedidosFiltrados.length) * 100}%` }}
                      />
                    </div>
                    <p className="horario-percentual">
                      {quantidade} pedidos ({((quantidade / pedidosFiltrados.length) * 100).toFixed(0)}%)
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;