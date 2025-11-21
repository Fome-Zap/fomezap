import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './FomeZapExact.css';
import { API_URL, API_BASE_URL, getImageUrl, getCurrentTenant, isManagerDomain } from '../config/api';

function FomeZapExact() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // DETECÇÃO AUTOMÁTICA DE TENANT POR SUBDOMÍNIO
  const tenantId = getCurrentTenant() || searchParams.get('tenant') || 'demo';
  const categoryFilterRef = useRef(null);
  
  const [tenantData, setTenantData] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [extras, setExtras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [horarioInfo, setHorarioInfo] = useState(null);
  const [categoriaAtiva, setCategoriaAtiva] = useState('all');
  const [carrinho, setCarrinho] = useState(() => {
    // Recuperar carrinho do localStorage ao inicializar
    try {
      const carrinhoSalvo = localStorage.getItem(`carrinho_${tenantId}`);
      return carrinhoSalvo ? JSON.parse(carrinhoSalvo) : [];
    } catch (error) {
      console.error('Erro ao carregar carrinho do localStorage:', error);
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [extrasModalOpen, setExtrasModalOpen] = useState(false);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [closedModalOpen, setClosedModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState({});
  
  // Estados para controlar visibilidade das setas
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  
  // Estado para toast de notificações
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Estado para tracking de scroll - destacar categoria ativa no menu
  const [categoriaVisivel, setCategoriaVisivel] = useState(null);

  // Estado para cores do tema
  const [temaCores, setTemaCores] = useState({
    corPrimaria: '#ff6b35',
    corSecundaria: '#2c3e50',
    corBotao: '#27ae60'
  });

  // Função para formatar preço em BRL
  const formatarPreco = (valor) => {
    return valor.toFixed(2).replace('.', ',');
  };

  // Função para mostrar toast
  const mostrarToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  // Salvar carrinho no localStorage sempre que mudar
  useEffect(() => {
    try {
      localStorage.setItem(`carrinho_${tenantId}`, JSON.stringify(carrinho));
    } catch (error) {
      console.error('Erro ao salvar carrinho no localStorage:', error);
      mostrarToast('Não foi possível salvar o carrinho. Verifique as configurações do navegador.', 'error');
    }
  }, [carrinho, tenantId]);

  useEffect(() => {
    // Redirecionar manager.fomezap.com para login
    if (isManagerDomain()) {
      console.log('🚫 Domínio de gerência detectado - redirecionando para login');
      navigate('/login');
      return;
    }
    
    carregarDados();
    
    // Debug: mostrar comando para limpar carrinho bugado
    console.log('🧹 Para limpar carrinho bugado, execute no console:');
    console.log(`localStorage.removeItem('carrinho_${tenantId}')`);
  }, [tenantId]);

  // Verificar scroll das categorias e atualizar setas
  useEffect(() => {
    const checkScroll = () => {
      const container = categoryFilterRef.current;
      if (!container) return;

      const { scrollLeft, scrollWidth, clientWidth } = container;
      
      // Mostrar seta esquerda se houver scroll para esquerda
      setShowLeftArrow(scrollLeft > 0);
      
      // Mostrar seta direita se houver conteúdo para rolar à direita
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    };

    const container = categoryFilterRef.current;
    if (container) {
      // Verificar inicialmente
      checkScroll();
      
      // Adicionar listener de scroll
      container.addEventListener('scroll', checkScroll);
      
      // Verificar quando redimensionar
      window.addEventListener('resize', checkScroll);
      
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [categorias]); // Re-executar quando categorias mudarem

  // useEffect para detectar categoria visível ao rolar a página
  useEffect(() => {
    if (categorias.length === 0 || categoriaAtiva !== 'all') return;

    const observerOptions = {
      root: null,
      rootMargin: '-100px 0px -70% 0px',
      threshold: [0, 0.1, 0.25]
    };

    let ultimaCategoriaVisivel = null;

    const observerCallback = (entries) => {
      // Encontrar a entrada com maior intersectionRatio
      let entradaMaisVisivel = null;
      let maiorRatio = 0;

      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > maiorRatio) {
          maiorRatio = entry.intersectionRatio;
          entradaMaisVisivel = entry;
        }
      });

      if (entradaMaisVisivel) {
        const categoriaId = entradaMaisVisivel.target.id;
        if (categoriaId && categoriaId !== ultimaCategoriaVisivel) {
          ultimaCategoriaVisivel = categoriaId;
          setCategoriaVisivel(categoriaId);
          
          // Scroll horizontal automático para mostrar categoria ativa
          const categoryButton = document.querySelector(`.filter-btn[data-category="${categoriaId}"]`);
          const container = categoryFilterRef.current;
          
          if (categoryButton && container) {
            const buttonRect = categoryButton.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            // Calcular se o botão está fora da view
            const isOutOfView = buttonRect.left < containerRect.left || buttonRect.right > containerRect.right;
            
            if (isOutOfView) {
              // Centralizar o botão no container
              const scrollPosition = categoryButton.offsetLeft - (container.offsetWidth / 2) + (categoryButton.offsetWidth / 2);
              container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
            }
          }
        }
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observar todas as seções de categoria
    categorias.forEach(categoria => {
      const section = document.getElementById(categoria._id);
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [categorias, categoriaAtiva]);

  // useEffect para detectar conteúdo rolável no modal de extras
  useEffect(() => {
    if (!extrasModalOpen) return;

    const checkScrollable = () => {
      const extrasList = document.querySelector('.extras-list');
      if (!extrasList) return;

      const hasScroll = extrasList.scrollHeight > extrasList.clientHeight;
      
      if (hasScroll) {
        extrasList.classList.add('has-more');
        
        // Remover indicador quando rolar até o fim
        const handleScroll = () => {
          const isAtBottom = extrasList.scrollHeight - extrasList.scrollTop <= extrasList.clientHeight + 10;
          if (isAtBottom) {
            extrasList.classList.remove('has-more');
          } else {
            extrasList.classList.add('has-more');
          }
        };
        
        extrasList.addEventListener('scroll', handleScroll);
        return () => extrasList.removeEventListener('scroll', handleScroll);
      } else {
        extrasList.classList.remove('has-more');
      }
    };

    // Aguardar renderização do modal
    const timer = setTimeout(checkScrollable, 100);
    return () => clearTimeout(timer);
  }, [extrasModalOpen, currentItem]);

  // Funções para scroll suave nas setas
  const scrollLeft = () => {
    if (categoryFilterRef.current) {
      categoryFilterRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (categoryFilterRef.current) {
      categoryFilterRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const carregarDados = async () => {
    try {
      setLoading(true);
      setErro(null);

      console.log('🔄 Carregando dados do tenant:', tenantId);

      // Buscar dados do cardápio (rotas públicas - sem autenticação)
      const [categoriasRes, produtosRes, extrasRes, horarioRes, configRes] = await Promise.all([
        fetch(`${API_URL}/${tenantId}/cardapio/categorias`),
        fetch(`${API_URL}/${tenantId}/cardapio/produtos`),
        fetch(`${API_URL}/${tenantId}/cardapio/extras`),
        fetch(`${API_URL}/${tenantId}/cardapio/horario`),
        fetch(`${API_URL}/${tenantId}/cardapio/configuracoes`)
      ]);

      console.log('📡 Respostas recebidas:', {
        categorias: categoriasRes.ok,
        produtos: produtosRes.ok,
        extras: extrasRes.ok,
        horario: horarioRes.ok,
        config: configRes.ok
      });

      if (!categoriasRes.ok || !produtosRes.ok || !extrasRes.ok) {
        throw new Error('Erro ao buscar dados');
      }

      const [categoriasData, produtosData, extrasData, horarioData, configData] = await Promise.all([
        categoriasRes.json(),
        produtosRes.json(),
        extrasRes.json(),
        horarioRes.ok ? horarioRes.json() : null,
        configRes.ok ? configRes.json() : null
      ]);

      console.log('✅ Dados parseados:', {
        categorias: categoriasData.length,
        produtos: produtosData.length,
        extras: extrasData.length,
        horario: horarioData,
        config: configData
      });

      // Configurar dados do tenant
      setTenantData({
        nome: configData?.nome || 'FomeZap',
        telefone: configData?.telefone || '(11) 99999-9999',
        endereco: configData?.endereco || 'Rua Exemplo, 123',
        taxaEntrega: configData?.taxaEntrega || 5.00,
        aceitaDelivery: configData?.aceitaDelivery !== false
      });
      
      // Configurar cores do tema
      if (configData?.tema) {
        const cores = {
          corPrimaria: configData.tema.corPrimaria || '#ff6b35',
          corSecundaria: configData.tema.corSecundaria || '#2c3e50',
          corBotao: configData.tema.corBotao || '#27ae60'
        };
        setTemaCores(cores);
        
        // Aplicar CSS variables
        document.documentElement.style.setProperty('--cor-primaria', cores.corPrimaria);
        document.documentElement.style.setProperty('--cor-secundaria', cores.corSecundaria);
        document.documentElement.style.setProperty('--cor-botao', cores.corBotao);
      }
      
      // Informações de horário
      setHorarioInfo(horarioData);
      
      setCategorias(categoriasData.filter(c => c.ativa).sort((a, b) => a.ordem - b.ordem)); // Ordenar por ordem
      setProdutos(produtosData.filter(p => p.disponivel).sort((a, b) => {
        // Primeiro ordenar por categoria, depois por ordem dentro da categoria
        const catA = categoriasData.find(c => c._id === a.categoria?._id)?.ordem || 0;
        const catB = categoriasData.find(c => c._id === b.categoria?._id)?.ordem || 0;
        if (catA !== catB) return catA - catB;
        return (a.ordem || 0) - (b.ordem || 0);
      })); // Ordenar por categoria e ordem
      setExtras(extrasData.filter(e => e.disponivel)); // Apenas extras disponíveis
      
      console.log('🎉 Carregamento concluído com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao carregar cardápio:', error);
      setErro('Não foi possível carregar o cardápio. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const produtosFiltrados = categoriaAtiva === 'all' 
    ? produtos
    : produtos.filter(produto => produto.categoria?._id === categoriaAtiva);

  // Agrupar produtos por categoria (quando mostrar todos)
  const produtosPorCategoria = () => {
    if (categoriaAtiva !== 'all') {
      const categoria = categorias.find(c => c._id === categoriaAtiva);
      if (!categoria) return [];
      return [{ categoria, produtos: produtosFiltrados }];
    }
    
    // Agrupar por categoria mantendo a ordem
    const grupos = [];
    categorias.forEach(cat => {
      const produtosCategoria = produtos.filter(p => p.categoria?._id === cat._id);
      if (produtosCategoria.length > 0) {
        grupos.push({ categoria: cat, produtos: produtosCategoria });
      }
    });
    return grupos;
  };

  // Verificar se o produto tem extras vinculados
  const produtoTemExtras = (produto) => {
    if (!produto.extras || produto.extras.length === 0) return false;
    
    // Verificar se algum extra vinculado está disponível
    const extrasDisponiveis = produto.extras.filter(extraId => 
      extras.some(extra => extra._id === extraId && extra.disponivel)
    );
    
    return extrasDisponiveis.length > 0;
  };

  // Buscar extras disponíveis para um produto
  const getExtrasDisponiveis = (produto) => {
    if (!produto.extras) return [];
    
    return extras.filter(extra => 
      produto.extras.includes(extra._id) && extra.disponivel
    );
  };

  // Calcular quantidade total de itens no carrinho
  const quantidadeTotalCarrinho = carrinho.reduce((total, item) => {
    return total + item.quantidade;
  }, 0);

  const totalCarrinho = carrinho.reduce((total, item) => {
    const extrasTotal = item.extras ? item.extras.reduce((sum, extra) => sum + extra.preco, 0) : 0;
    return total + ((item.preco + extrasTotal) * item.quantidade);
  }, 0);

  const handleAddToCart = (produto) => {
    console.log('🛒 handleAddToCart chamado:', produto);
    
    // Verificar se o restaurante está fechado
    if (horarioInfo && !horarioInfo.aberto) {
      console.log('🚫 Restaurante fechado, abrindo modal');
      setClosedModalOpen(true);
      return;
    }
    
    console.log('📦 Extras do produto:', produto.extras);
    console.log('✅ Extras disponíveis:', getExtrasDisponiveis(produto));
    
    if (produtoTemExtras(produto)) {
      console.log('✨ Produto tem extras, abrindo modal');
      setCurrentItem(produto);
      setSelectedExtras({});
      setExtrasModalOpen(true);
    } else {
      console.log('⚡ Produto sem extras, adicionando direto ao carrinho');
      adicionarAoCarrinho(produto, []);
    }
  };

  const adicionarAoCarrinho = (produto, extrasEscolhidos = []) => {
    console.log('📦 Adicionando ao carrinho:', { 
      produto,
      _id: produto._id,
      nome: produto.nome,
      extras: extrasEscolhidos 
    });
    
    const itemExistente = carrinho.find(item => 
      item._id === produto._id && 
      JSON.stringify(item.extras) === JSON.stringify(extrasEscolhidos)
    );

    if (itemExistente) {
      setCarrinho(carrinho.map(item =>
        item === itemExistente 
          ? { ...item, quantidade: item.quantidade + 1 }
          : item
      ));
    } else {
      const novoItem = { 
        ...produto,
        quantidade: 1,
        extras: extrasEscolhidos,
        observacoes: '' // Campo de observações vazio inicialmente
      };
      console.log('✅ Novo item no carrinho:', novoItem);
      setCarrinho([...carrinho, novoItem]);
    }
    
    // Abrir o carrinho automaticamente
    setCartOpen(true);
  };

  const confirmarExtras = () => {
    if (currentItem) {
      const extrasEscolhidos = Object.keys(selectedExtras)
        .filter(key => selectedExtras[key])
        .map(extraId => extras.find(extra => extra._id === extraId))
        .filter(Boolean);
      
      adicionarAoCarrinho(currentItem, extrasEscolhidos);
      setExtrasModalOpen(false);
      setCurrentItem(null);
      setSelectedExtras({});
      setCartOpen(true);
    }
  };

  const cancelarExtras = () => {
    if (currentItem) {
      adicionarAoCarrinho(currentItem, []);
      setExtrasModalOpen(false);
      setCurrentItem(null);
      setSelectedExtras({});
      setCartOpen(true);
    }
  };

  const removerDoCarrinho = (index) => {
    console.log('🗑️ Removendo item do carrinho, index:', index);
    setCarrinho(carrinho.filter((item, i) => i !== index));
  };

  const atualizarObservacao = (index, observacoes) => {
    setCarrinho(carrinho.map((item, i) => 
      i === index ? { ...item, observacoes } : item
    ));
  };

  const alterarQuantidade = (index, delta) => {
    console.log('🔢 Alterando quantidade, index:', index, 'delta:', delta);
    setCarrinho(carrinho.map((item, i) => {
      if (i === index) {
        const novaQuantidade = item.quantidade + delta;
        return novaQuantidade > 0 ? { ...item, quantidade: novaQuantidade } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const finalizarPedido = () => {
    if (carrinho.length === 0) {
      alert('Adicione itens ao carrinho antes de finalizar o pedido.');
      return;
    }
    
    // Navegar para página de checkout passando o carrinho
    navigate('/checkout', {
      state: { carrinho }
    });
  };

  const enviarWhatsApp = async (dadosEntrega) => {
    try {
      // 1. SALVAR PEDIDO NO BANCO
      const tenantSlug = new URLSearchParams(window.location.search).get('tenant') || 'demo';
      
      console.log('🔍 Iniciando envio do pedido...');
      console.log('📦 Tenant:', tenantSlug);
      console.log('🛒 Carrinho:', carrinho);
      
      // Preparar dados do pedido
      const pedidoData = {
        cliente: {
          nome: dadosEntrega.nome,
          telefone: '(00) 00000-0000' // Você pode adicionar campo de telefone no modal depois
        },
        itens: carrinho.map(item => {
          const extrasPreco = item.extras ? item.extras.reduce((total, extra) => total + (extra.preco || 0), 0) : 0;
          return {
            produtoId: item._id,
            nome: item.nome,
            preco: item.preco,
            quantidade: item.quantidade,
            extras: item.extras ? item.extras.map(extra => ({
              nome: extra.nome,
              preco: extra.preco || 0
            })) : [],
            observacoes: item.observacoes || '',
            subtotal: (item.preco + extrasPreco) * item.quantidade
          };
        }),
        entrega: {
          tipo: dadosEntrega.tipoEntrega === 'Entrega' ? 'delivery' : 'retirada',
          endereco: dadosEntrega.tipoEntrega === 'Entrega' ? 
            `${dadosEntrega.endereco}${dadosEntrega.complemento ? ' - ' + dadosEntrega.complemento : ''}` : '',
          taxa: dadosEntrega.tipoEntrega === 'Entrega' ? 5.00 : 0
        },
        subtotal: totalCarrinho,
        taxaEntrega: dadosEntrega.tipoEntrega === 'Entrega' ? 5.00 : 0,
        valorTotal: totalCarrinho + (dadosEntrega.tipoEntrega === 'Entrega' ? 5.00 : 0),
        pagamento: {
          forma: dadosEntrega.pagamento.toLowerCase(),
          status: 'pendente'
        },
        observacoes: dadosEntrega.observacaoGeral || ''
      };

      console.log('📤 Enviando pedido:', JSON.stringify(pedidoData, null, 2));

      // Enviar para API
      const response = await fetch(`${API_URL}/${tenantSlug}/pedidos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pedidoData)
      });

      console.log('📡 Resposta HTTP:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido no servidor' }));
        console.error('❌ Erro do servidor:', errorData);
        throw new Error(errorData.message || `Erro HTTP ${response.status}`);
      }

      const resultado = await response.json();
      console.log('✅ Pedido salvo com sucesso:', resultado);

      // 2. ENVIAR WHATSAPP (mantendo a mesma lógica)
      let mensagem = `*🍔 NOVO PEDIDO - ${tenantData.nome}*\n`;
      mensagem += `📋 *Pedido #${resultado.pedido.numeroPedido}*\n\n`;
      mensagem += `*📋 ITENS DO PEDIDO:*\n\n`;
      
      carrinho.forEach((item, index) => {
        const extrasTotal = item.extras ? item.extras.reduce((sum, extra) => sum + (extra.preco || 0), 0) : 0;
        const precoTotal = (item.preco + extrasTotal) * item.quantidade;
        
        mensagem += `${index + 1}. *${item.nome}*\n`;
        mensagem += `   Qtd: ${item.quantidade}x - R$ ${formatarPreco(item.preco)}\n`;
        
        if (item.extras && item.extras.length > 0) {
          mensagem += `   Extras: ${item.extras.map(extra => extra.nome).join(', ')}\n`;
        }
        
        if (item.observacoes && item.observacoes.trim() !== '') {
          mensagem += `   📝 Obs: ${item.observacoes}\n`;
        }
        
        mensagem += `   Subtotal: R$ ${formatarPreco(precoTotal)}\n\n`;
      });

      mensagem += `*💰 TOTAL: R$ ${formatarPreco(resultado.pedido.valorTotal)}*\n\n`;
      
      mensagem += `*👤 DADOS DO CLIENTE:*\n`;
      mensagem += `Nome: ${dadosEntrega.nome}\n`;
      
      if (dadosEntrega.tipoEntrega === 'Entrega') {
        mensagem += `📍 Entregar em: ${dadosEntrega.endereco}\n`;
        if (dadosEntrega.complemento) {
          mensagem += `Complemento: ${dadosEntrega.complemento}\n`;
        }
      } else {
        mensagem += `🏪 Retirar na loja\n`;
      }
      
      mensagem += `💳 Pagamento: ${dadosEntrega.pagamento}\n`;
      
      if (dadosEntrega.troco) {
        mensagem += `💰 Troco para: R$ ${dadosEntrega.troco}\n`;
      }
      
      if (dadosEntrega.observacaoGeral && dadosEntrega.observacaoGeral.trim() !== '') {
        mensagem += `\n*📝 OBSERVAÇÕES DO PEDIDO:*\n${dadosEntrega.observacaoGeral}\n`;
      }

      const telefone = tenantData.telefone.replace(/\D/g, '');
      const urlWhatsApp = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
      window.open(urlWhatsApp, '_blank');
      
      // Limpar carrinho após enviar
      setCarrinho([]);
      setDeliveryModalOpen(false);
      
      // Mostrar toast de sucesso (melhor que alert)
      mostrarToast(`✅ Pedido #${resultado.pedido.numeroPedido} registrado!`, 'success');

    } catch (error) {
      console.error('❌ ERRO COMPLETO:', error);
      
      // Mostrar toast de erro
      mostrarToast(`❌ Erro: ${error.message}`, 'error');
      
      // Não fechar o modal para permitir corrigir dados
      // setDeliveryModalOpen(false); // REMOVIDO
      
      // Permitir enviar WhatsApp mesmo se falhar salvar (fallback)
      const telefone = tenantData.telefone.replace(/\D/g, '');
      let mensagem = `*🍔 NOVO PEDIDO - ${tenantData.nome}*\n\n*ITENS:*\n\n`;
      carrinho.forEach((item, index) => {
        mensagem += `${index + 1}. ${item.nome} (${item.quantidade}x)\n`;
      });
      const urlWhatsApp = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
      window.open(urlWhatsApp, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando cardápio...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="error-container">
        <p>{erro}</p>
        <button onClick={carregarDados} className="btn-retry">Tentar novamente</button>
      </div>
    );
  }

  if (!tenantData || categorias.length === 0) {
    return (
      <div className="error-container">
        <h2>Cardápio Vazio</h2>
        <p>Este restaurante ainda não possui categorias e produtos cadastrados.</p>
        <p>Entre no painel administrativo para começar a adicionar itens ao cardápio.</p>
      </div>
    );
  }

  return (
    <div className="fome-zap-exact">
      {/* Header */}
      <header>
        <div className="header-container">
          <div className="logo">
            {tenantData.logo ? (
              <img src={tenantData.logo} alt={tenantData.nome} />
            ) : (
              <h1>{tenantData.nome}</h1>
            )}
          </div>
          
          {horarioInfo && (
            <div className={`status-badge ${horarioInfo.aberto ? 'open' : 'closed'}`} id="statusBadge">
              <span className="status-dot"></span>
              <span className="status-text">{horarioInfo.aberto ? 'ABERTO' : 'FECHADO'}</span>
            </div>
          )}
          
          <nav>
            <div 
              className="cart-icon" 
              onClick={() => setCartOpen(!cartOpen)}
            >
              <i className="fas fa-shopping-bag" style={{fontSize: '29px'}}></i>
              <span className="cart-count">{quantidadeTotalCarrinho}</span>
            </div>
            <div 
              className="menu-icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {/* Menu icon content if needed */}
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <div className="mobile-logo">
            <img src="images/familialogo.jpg" alt="Logo" />
          </div>
          <div 
            className="close-menu"
            onClick={() => setMobileMenuOpen(false)}
          >
            <i className="fas fa-times"></i>
          </div>
        </div>
        <nav className="mobile-nav">
          {categorias.map(categoria => (
            <a 
              key={categoria._id}
              href={`#${categoria._id}`}
              onClick={() => {
                setCategoriaAtiva(categoria._id);
                setMobileMenuOpen(false);
              }}
            >
              {categoria.icone} {categoria.nome}
            </a>
          ))}
        </nav>
      </div>

      {cartOpen && <div className="overlay" onClick={() => setCartOpen(false)}></div>}

      {/* Setas de navegação das categorias - Fixas na tela */}
      <div 
        className={`scroll-indicator-left ${showLeftArrow ? 'visible' : ''}`}
        onClick={scrollLeft}
      >
        <i className="fas fa-chevron-left"></i>
      </div>
      <div 
        className={`scroll-indicator-right ${showRightArrow ? 'visible' : ''}`}
        onClick={scrollRight}
      >
        <i className="fas fa-chevron-right"></i>
      </div>

      {/* Main Content */}
      <main style={{marginTop: '110px'}}>
        {/* Filtros fixos no topo - Igual ao HTML original */}
        <div className="sticky-filter" style={{
          position: 'fixed', 
          top: '65px', 
          left: '0px', 
          width: '100%', 
          zIndex: 100, 
          transition: 'top 0.1s, opacity 0.1s', 
          opacity: 1, 
          pointerEvents: 'auto',
          marginTop: '0',
          paddingTop: '10px'
        }}>
          <div className="category-filter" ref={categoryFilterRef}>
            <button
              className={`filter-btn ${categoriaAtiva === 'all' && !categoriaVisivel ? 'active' : ''}`}
              onClick={() => setCategoriaAtiva('all')}
            >
              Todos
            </button>
            {categorias.map(categoria => (
              <button
                key={categoria._id}
                className={`filter-btn ${(categoriaAtiva === 'all' && categoriaVisivel === categoria._id) || categoriaAtiva === categoria._id ? 'active' : ''}`}
                data-category={categoria._id}
                onClick={() => setCategoriaAtiva(categoria._id)}
              >
                {categoria.icone} {categoria.nome}
              </button>
            ))}
          </div>
        </div>

        {/* Seções de produtos agrupados por categoria */}
        {produtosPorCategoria().map(({ categoria, produtos: produtosGrupo }) => (
          <section key={categoria._id} id={categoria._id} style={{ marginBottom: '3rem' }}>
            {/* Título da categoria - Design minimalista */}
            <div className="category-section-title" style={{
              padding: '0.8rem 1.2rem',
              borderBottom: '2px solid #ff6b35',
              marginBottom: '1.5rem',
              marginTop: '2rem'
            }}>
              <h2 style={{ 
                margin: 0, 
                fontSize: '1.2rem', 
                fontWeight: '600',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '1.3rem' }}>{categoria.icone}</span>
                {categoria.nome}
              </h2>
            </div>

            {/* Grid de produtos */}
            <div className="menu-grid">
              {produtosGrupo.map(produto => (
                <div key={produto._id} className="menu-item">
                  <div className="item-image">
                    {/* Prioridade: imagem → emoji → placeholder */}
                    {produto.imagem ? (
                      <img 
                        src={getImageUrl(produto.imagem)}
                        alt={produto.nome}
                        onError={(e) => {
                          e.target.src = '/placeholder-food.jpg';
                        }}
                      />
                    ) : produto.emoji ? (
                      <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '5rem',
                        backgroundColor: '#f3f4f6'
                      }}>
                        {produto.emoji}
                      </div>
                    ) : (
                      <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '4rem',
                        backgroundColor: '#f3f4f6',
                        color: '#d1d5db'
                      }}>
                        🍽️
                      </div>
                    )}
                  </div>
                  <div className="item-info">
                    <div className="item-header">
                      <h3 className="item-title">
                        {produto.codigo && `${produto.codigo} - `}{produto.nome}
                      </h3>
                      <p className="item-description">{produto.descricao}</p>
                    </div>
                    <div className="item-footer">
                      <span className="item-price">R$ {formatarPreco(produto.preco)}</span>
                      <button 
                        className="add-to-cart"
                        onClick={() => handleAddToCart(produto)}
                      >
                        <i className="fas fa-plus"></i> Adicionar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Rodapé Minimalista */}
      <footer style={{
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #e9ecef',
        padding: '2rem 1rem',
        marginTop: '4rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem'
        }}>
          {/* Informações do Restaurante */}
          <div>
            <h3 style={{ 
              fontSize: '1.1rem', 
              fontWeight: '600', 
              marginBottom: '0.8rem',
              color: 'var(--cor-secundaria, #2c3e50)'
            }}>
              {tenantData?.nome || 'Nosso Restaurante'}
            </h3>
            <p style={{ 
              fontSize: '0.9rem', 
              color: '#666',
              lineHeight: '1.6',
              marginBottom: '0.5rem'
            }}>
              <i className="fas fa-map-marker-alt" style={{ marginRight: '0.5rem', color: 'var(--cor-primaria, #ff6b35)' }}></i>
              {tenantData?.endereco || 'Endereço não cadastrado'}
            </p>
          </div>

          {/* Horário de Funcionamento */}
          {horarioInfo && (
            <div>
              <h3 style={{ 
                fontSize: '1.1rem', 
                fontWeight: '600', 
                marginBottom: '0.8rem',
                color: 'var(--cor-secundaria, #2c3e50)'
              }}>
                Horário
              </h3>
              <p style={{ 
                fontSize: '0.9rem', 
                color: '#666',
                lineHeight: '1.6'
              }}>
                <i className="fas fa-clock" style={{ marginRight: '0.5rem', color: 'var(--cor-primaria, #ff6b35)' }}></i>
                {horarioInfo.diasFuncionamento?.join(', ') || 'Seg - Dom'}
                <br />
                <span style={{ marginLeft: '1.5rem' }}>
                  {horarioInfo.horarioAbertura || '00:00'} - {horarioInfo.horarioFechamento || '23:59'}
                </span>
              </p>
            </div>
          )}

          {/* Informações de Entrega */}
          <div>
            <h3 style={{ 
              fontSize: '1.1rem', 
              fontWeight: '600', 
              marginBottom: '0.8rem',
              color: 'var(--cor-secundaria, #2c3e50)'
            }}>
              Serviços
            </h3>
            <p style={{ 
              fontSize: '0.9rem', 
              color: '#666',
              lineHeight: '1.8'
            }}>
              {tenantData?.aceitaDelivery && (
                <>
                  <i className="fas fa-motorcycle" style={{ marginRight: '0.5rem', color: 'var(--cor-primaria, #ff6b35)' }}></i>
                  Delivery disponível
                  <br />
                </>
              )}
              <i className="fas fa-store" style={{ marginRight: '0.5rem', color: 'var(--cor-primaria, #ff6b35)' }}></i>
              Retirada no local
              <br />
              <i className="fas fa-credit-card" style={{ marginRight: '0.5rem', color: 'var(--cor-primaria, #ff6b35)' }}></i>
              Dinheiro, Cartão, PIX
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e9ecef'
        }}>
          <p style={{ 
            fontSize: '0.85rem', 
            color: '#999'
          }}>
            © {new Date().getFullYear()} {tenantData?.nome || 'FomeZap'}. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Cart Sidebar - Igual ao HTML original */}
      <div className={`cart-sidebar ${cartOpen ? 'active' : ''}`}>
        <div className="cart-header">
          <h3>Seu Pedido</h3>
          <div 
            className="close-cart"
            onClick={() => setCartOpen(false)}
          >
            <i className="fas fa-times"></i>
          </div>
        </div>
        
        <div className="cart-items">
          {carrinho.length === 0 ? (
            <div className="empty-cart">
              <i className="fas fa-shopping-cart" style={{ fontSize: '3rem', color: '#ddd', marginBottom: '1rem' }}></i>
              <p style={{ fontSize: '1.1rem', color: '#999' }}>Seu carrinho está vazio</p>
              <p style={{ fontSize: '0.9rem', color: '#bbb' }}>Adicione itens deliciosos!</p>
            </div>
          ) : (
            carrinho.map((item, index) => {
              const extrasTotal = item.extras ? item.extras.reduce((sum, extra) => sum + (extra.preco || 0), 0) : 0;
              const precoTotal = (item.preco + extrasTotal) * item.quantidade;
              
              // Processar imagem/emoji
              const imagemUrl = getImageUrl(item.imagem);
              const emoji = item.emoji || null;
              
              return (
                <div key={index} className="cart-item">
                  {/* Imagem/Emoji + Info */}
                  <div className="cart-item-main">
                    {/* Thumbnail */}
                    <div className="cart-item-thumbnail">
                      {imagemUrl ? (
                        <img src={imagemUrl} alt={item.nome} />
                      ) : emoji ? (
                        <div className="cart-item-emoji">{emoji}</div>
                      ) : (
                        <div className="cart-item-placeholder">🍽️</div>
                      )}
                    </div>
                    
                    {/* Info e Preço na mesma linha */}
                    <div className="cart-item-info">
                      <div className="cart-item-header">
                        <h4>{item.nome}</h4>
                        <span className="cart-item-price">R$ {formatarPreco(precoTotal)}</span>
                      </div>
                      
                      {/* Extras como etiquetas */}
                      {item.extras && item.extras.length > 0 && (
                        <div className="extras-tags">
                          {item.extras.map((extra, idx) => (
                            <span key={idx} className="extra-tag">
                              + {extra.nome}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Observações */}
                  <input 
                    type="text" 
                    placeholder="Observações: sem cebola, ponto da carne..."
                    value={item.observacoes || ''}
                    onChange={(e) => atualizarObservacao(index, e.target.value)}
                    className="obs-input-full"
                  />
                  
                  {/* Controles de Quantidade e Remover */}
                  <div className="cart-item-controls">
                    <div className="quantity-controls">
                      <button onClick={() => alterarQuantidade(index, -1)}>
                        <i className="fas fa-minus"></i>
                      </button>
                      <span className="cart-item-quantity">{item.quantidade}</span>
                      <button onClick={() => alterarQuantidade(index, 1)}>
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                    
                    <button 
                      className="remove-item"
                      onClick={() => removerDoCarrinho(index)}
                      title="Remover item"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <div className="cart-footer">
          <div className="cart-total">
            <span>Total:</span>
            <span>R$ {formatarPreco(totalCarrinho)}</span>
          </div>

          <button className="add-more-items" onClick={() => setCartOpen(false)}>
            <i className="fas fa-cart-plus"></i> Adicionar mais itens
          </button>

          <button className="checkout-btn" onClick={finalizarPedido}>
            <i className="fas fa-check"></i> Finalizar Pedido
          </button>
        </div>
      </div>

      {/* Modal de Extras */}
      {extrasModalOpen && currentItem && (
        <div className="extras-modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Adicionar acréscimo ou Continuar</h3>
              <div className="close-modal" onClick={() => setExtrasModalOpen(false)}>
                <i className="fas fa-times"></i>
              </div>
            </div>
            <div className="extras-body">
              <div className="item-preview">
                <h4>{currentItem.nome}</h4>
                <p>Preço Normal: R$ {formatarPreco(currentItem.preco)}</p>
              </div>

              <div className="extras-options">
                <h4>Adicionar acréscimo:</h4>
                <div className="extras-list">
                  {getExtrasDisponiveis(currentItem).map(extra => (
                    <div key={extra._id} className="extra-item">
                      <div className="extra-check">
                        <input 
                          type="checkbox" 
                          id={extra._id} 
                          checked={selectedExtras[extra._id] || false}
                          onChange={(e) => setSelectedExtras({
                            ...selectedExtras,
                            [extra._id]: e.target.checked
                          })}
                        />
                        <label htmlFor={extra._id} className="extra-name">{extra.nome}</label>
                      </div>
                      <span className="extra-price">+ R$ {formatarPreco(extra.preco)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="extras-footer">
              <button className="cancel-extras" onClick={cancelarExtras}>
                Sem Acréscimo
              </button>
              <button className="confirm-extras" onClick={confirmarExtras}>
                Add Acréscimo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Informações de Entrega */}
      {deliveryModalOpen && (
        <DeliveryModal 
          onClose={() => setDeliveryModalOpen(false)}
          onConfirm={enviarWhatsApp}
          totalPedido={totalCarrinho}
          mostrarToast={mostrarToast}
        />
      )}

      {/* Modal de Restaurante Fechado */}
      {closedModalOpen && horarioInfo && (
        <ClosedModal 
          onClose={() => setClosedModalOpen(false)}
          horarioInfo={horarioInfo}
        />
      )}

      {/* Toast de Notificações */}
      {toast.show && (
        <div className={`toast-notification toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

// Componente DeliveryModal
function DeliveryModal({ onClose, onConfirm, totalPedido, mostrarToast }) {
  const [formData, setFormData] = useState({
    nome: '',
    tipoEntrega: 'Entrega',
    endereco: '',
    complemento: '',
    pagamento: 'Dinheiro',
    troco: '',
    observacaoGeral: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.nome) {
      mostrarToast('⚠️ Por favor, preencha seu nome', 'error');
      return;
    }
    
    if (formData.tipoEntrega === 'Entrega' && !formData.endereco) {
      mostrarToast('⚠️ Por favor, preencha o endereço de entrega', 'error');
      return;
    }
    
    onConfirm(formData);
  };

  return (
    <div className="delivery-modal active">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Informações para Entrega</h3>
          <div className="close-modal" onClick={onClose}>
            <i className="fas fa-times"></i>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="customerName">Nome Completo</label>
            <input 
              type="text" 
              id="customerName" 
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              required 
            />
          </div>

          <div className="delivery-options">
            <div className="delivery-option">
              <input 
                type="radio" 
                id="deliveryOption" 
                name="deliveryType" 
                value="Entrega" 
                checked={formData.tipoEntrega === 'Entrega'}
                onChange={(e) => setFormData({...formData, tipoEntrega: e.target.value})}
              />
              <label htmlFor="deliveryOption">Entrega</label>
            </div>
            <div className="delivery-option">
              <input 
                type="radio" 
                id="pickupOption" 
                name="deliveryType" 
                value="Retirada"
                checked={formData.tipoEntrega === 'Retirada'}
                onChange={(e) => setFormData({...formData, tipoEntrega: e.target.value})}
              />
              <label htmlFor="pickupOption">Retirar</label>
            </div>
          </div>

          {formData.tipoEntrega === 'Entrega' ? (
            <div className="delivery-address-fields">
              <div className="form-group">
                <label htmlFor="deliveryAddress">Endereço, Nº</label>
                <input 
                  type="text" 
                  id="deliveryAddress" 
                  value={formData.endereco}
                  onChange={(e) => {
                    setFormData({...formData, endereco: e.target.value});
                    setErro(''); // Limpa erro ao digitar
                  }}
                  placeholder="Rua exemplo, 1029 - Bairro X"
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="deliveryComplement">Bairro/Complemento</label>
                <input 
                  type="text" 
                  id="deliveryComplement" 
                  value={formData.complemento}
                  onChange={(e) => setFormData({...formData, complemento: e.target.value})}
                  placeholder="Bairro, Apto, Bloco, etc." 
                />
              </div>
            </div>
          ) : (
            <div className="store-address">
              <p><strong>Endereço para retirada:</strong></p>
              <p>Rua Atilio Lotto, 127 - Jardim Olímpia</p>
              <p>Jaú/SP - CEP: 17208710</p>
              <p>Horário: Qua-Dom 18h-22h30</p>
            </div>
          )}

          <div className="form-group">
            <label>Forma de Pagamento</label>
            <div className="payment-options">
              <div className="payment-option">
                <input 
                  type="radio" 
                  id="paymentCash" 
                  name="payment" 
                  value="Dinheiro"
                  checked={formData.pagamento === 'Dinheiro'}
                  onChange={(e) => setFormData({...formData, pagamento: e.target.value})}
                />
                <label htmlFor="paymentCash">Dinheiro</label>
              </div>
              <div className="payment-option">
                <input 
                  type="radio" 
                  id="paymentCard" 
                  name="payment" 
                  value="Cartão"
                  checked={formData.pagamento === 'Cartão'}
                  onChange={(e) => setFormData({...formData, pagamento: e.target.value})}
                />
                <label htmlFor="paymentCard">Cartão</label>
              </div>
              <div className="payment-option">
                <input 
                  type="radio" 
                  id="paymentPix" 
                  name="payment" 
                  value="PIX"
                  checked={formData.pagamento === 'PIX'}
                  onChange={(e) => setFormData({...formData, pagamento: e.target.value})}
                />
                <label htmlFor="paymentPix">PIX</label>
              </div>
            </div>
          </div>

          {formData.pagamento === 'Dinheiro' && (
            <div className="form-group">
              <label htmlFor="changeFor">Troco para</label>
              <input 
                type="number" 
                id="changeFor" 
                value={formData.troco}
                onChange={(e) => setFormData({...formData, troco: e.target.value})}
                placeholder="Valor para o troco" 
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="observacaoGeral">Observações do Pedido (opcional)</label>
            <textarea 
              id="observacaoGeral" 
              value={formData.observacaoGeral}
              onChange={(e) => setFormData({...formData, observacaoGeral: e.target.value})}
              placeholder="Ex: Deixar na portaria, tocar campainha 2x, sem talher descartável..."
              rows="3"
            />
          </div>

          <div className="order-summary">
            <div className="total-order">
              <strong>Total do Pedido: R$ {totalPedido.toFixed(2)}</strong>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-order" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="confirm-order">
              <i className="fab fa-whatsapp"></i> Enviar Pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Componente ClosedModal
function ClosedModal({ onClose, horarioInfo }) {
  const diasSemanaMap = {
    'domingo': 'Dom',
    'segunda': 'Seg',
    'terca': 'Ter',
    'quarta': 'Qua',
    'quinta': 'Qui',
    'sexta': 'Sex',
    'sabado': 'Sáb'
  };
  
  const formatarDiasSemana = () => {
    if (!horarioInfo.diasFuncionamento || horarioInfo.diasFuncionamento.length === 0) {
      return 'Não informado';
    }
    
    const dias = horarioInfo.diasFuncionamento.map(dia => diasSemanaMap[dia]);
    
    if (dias.length === 7) {
      return 'Todos os dias';
    } else if (dias.length === 5 && !horarioInfo.diasFuncionamento.includes('domingo') && !horarioInfo.diasFuncionamento.includes('sabado')) {
      return 'Segunda a Sexta';
    } else if (dias.length === 6 && !horarioInfo.diasFuncionamento.includes('domingo')) {
      return 'Segunda a Sábado';
    } else {
      return dias.join(', ');
    }
  };

  return (
    <div className="extras-modal active">
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h3>🕐 Restaurante Fechado</h3>
          <div className="close-modal" onClick={onClose}>
            <i className="fas fa-times"></i>
          </div>
        </div>
        
        <div className="modal-body" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: '#666' }}>
            Desculpe, estamos fechados no momento.
          </p>
          
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '1.5rem', 
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <h4 style={{ marginBottom: '1rem', color: '#333' }}>Horário de Funcionamento</h4>
            
            <div style={{ marginBottom: '0.8rem' }}>
              <strong>Dias:</strong> {formatarDiasSemana()}
            </div>
            
            <div style={{ marginBottom: '0.8rem' }}>
              <strong>Horário:</strong> {horarioInfo.horarioAbertura} - {horarioInfo.horarioFechamento}
            </div>
            
            {horarioInfo.horaAtual && (
              <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
                Agora são {horarioInfo.horaAtual}
              </div>
            )}
          </div>
          
          <p style={{ fontSize: '0.95rem', color: '#888' }}>
            Volte mais tarde ou agende seu pedido para quando estivermos abertos! 😊
          </p>
        </div>

        <div className="modal-actions">
          <button 
            type="button" 
            className="confirm-button" 
            onClick={onClose}
            style={{ width: '100%' }}
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}

export default FomeZapExact;