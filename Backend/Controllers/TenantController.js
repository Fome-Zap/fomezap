// Controllers/TenantController.js
import { Tenant, Categoria, Produto, Extra, Pedido } from "../Models/TenantModels.js";
import { Types } from "mongoose";

export default class TenantController {
  
  // Middleware para extrair tenant do subdomínio
  static async extractTenant(req, res, next) {
    const hostname = req.get('host');
    let tenantId = null;
    
    // Produção: subdomain.fomezap.com
    if (hostname.endsWith('.fomezap.com')) {
      tenantId = hostname.replace('.fomezap.com', '');
    }
    // Desenvolvimento: localhost com header
    else if (hostname.includes('localhost')) {
      tenantId = req.headers['x-tenant-id'] || req.query.tenant;
    }
    // Domínio customizado (consultar mapeamento)
    else {
      tenantId = await TenantController.getTenantByDomain(hostname);
    }
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant não identificado' });
    }
    
    req.tenantId = tenantId;
    next();
  }
  
  // Validar se tenant existe e está ativo
  static async validateTenant(req, res, next) {
    try {
      const tenant = await Tenant.findOne({ 
        tenantId: req.tenantId,
        status: { $in: ['ativo', 'trial'] }
      });
      
      if (!tenant) {
        return res.status(404).json({ error: 'Lanchonete não encontrada ou inativa' });
      }
      
      req.tenant = tenant;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Erro ao validar tenant' });
    }
  }
  
  // Obter configuração completa do tenant
  static async getConfig(req, res) {
    try {
      const tenantId = req.tenantId;
      
      // Buscar dados do tenant
      const tenant = await Tenant.findOne({ tenantId });
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant não encontrado' });
      }
      
      // Buscar categorias ativas
      const categorias = await Categoria.find({ 
        tenantId, 
        ativa: true 
      }).sort({ ordem: 1 });
      
      // Buscar produtos disponíveis
      const produtos = await Produto.find({ 
        tenantId, 
        disponivel: true 
      }).populate('categoria');
      
      // Buscar extras disponíveis
      const extras = await Extra.find({ 
        tenantId, 
        disponivel: true 
      });
      
      // Montar configuração no formato esperado pelo frontend
      const config = {
        restaurante: {
          nome: tenant.nome,
          logo: tenant.logo,
          telefone: tenant.telefone,
          endereco: tenant.endereco,
          horarioFuncionamento: tenant.horarioFuncionamento,
          cores: {
            primaria: tenant.tema.corPrimaria,
            secundaria: tenant.tema.corSecundaria,
            botao: tenant.tema.corBotao
          }
        },
        categorias: categorias.map(cat => ({
          id: cat._id.toString(),
          nome: cat.nome,
          icone: cat.icone,
          imagemPadrao: cat.imagemPadrao,
          ordem: cat.ordem
        })),
        produtos: produtos.map(prod => ({
          id: prod._id.toString(),
          codigo: prod.codigo,
          nome: prod.nome,
          descricao: prod.descricao,
          preco: prod.preco,
          categoria: prod.categoria._id.toString(),
          imagem: prod.imagem,
          disponivel: prod.disponivel,
          destaque: prod.destaque,
          extras: prod.extras,
          tags: prod.tags
        })),
        extras: extras.map(extra => ({
          id: extra._id.toString(),
          nome: extra.nome,
          preco: extra.preco
        })),
        configuracoes: tenant.configuracoes
      };
      
      res.status(200).json(config);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao carregar configuração' });
    }
  }
  
  // Criar novo pedido
  static async createPedido(req, res) {
    try {
      const tenantId = req.tenantId;
      const { cliente, itens, entrega, pagamento, observacoes } = req.body;
      
      // Validações básicas
      if (!cliente.nome || !cliente.telefone) {
        return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
      }
      
      if (!itens || itens.length === 0) {
        return res.status(400).json({ error: 'Pedido deve ter pelo menos um item' });
      }
      
      // Recalcular valores no backend (segurança)
      let subtotal = 0;
      const itensValidados = [];
      
      for (const item of itens) {
        const produto = await Produto.findOne({ 
          _id: item.produtoId, 
          tenantId,
          disponivel: true 
        });
        
        if (!produto) {
          return res.status(400).json({ 
            error: `Produto ${item.nome} não encontrado ou indisponível` 
          });
        }
        
        let precoItem = produto.preco;
        const extrasValidados = [];
        
        // Validar extras
        if (item.extras && item.extras.length > 0) {
          for (const extraItem of item.extras) {
            const extra = await Extra.findOne({ 
              _id: extraItem.id, 
              tenantId,
              disponivel: true 
            });
            
            if (extra) {
              precoItem += extra.preco;
              extrasValidados.push({
                nome: extra.nome,
                preco: extra.preco
              });
            }
          }
        }
        
        const itemSubtotal = precoItem * item.quantidade;
        subtotal += itemSubtotal;
        
        itensValidados.push({
          produtoId: produto._id,
          nome: produto.nome,
          preco: produto.preco,
          quantidade: item.quantidade,
          extras: extrasValidados,
          observacoes: item.observacoes || '',
          subtotal: itemSubtotal
        });
      }
      
      // Calcular taxa de entrega
      const tenant = await Tenant.findOne({ tenantId });
      const taxaEntrega = entrega.tipo === 'delivery' ? tenant.configuracoes.taxaEntrega : 0;
      const valorTotal = subtotal + taxaEntrega;
      
      // Verificar pedido mínimo
      if (subtotal < tenant.configuracoes.pedidoMinimo) {
        return res.status(400).json({ 
          error: `Pedido mínimo: R$ ${tenant.configuracoes.pedidoMinimo.toFixed(2)}` 
        });
      }
      
      // Gerar número do pedido
      const hoje = new Date();
      const prefix = hoje.getFullYear().toString().slice(-2) + 
                   (hoje.getMonth() + 1).toString().padStart(2, '0') + 
                   hoje.getDate().toString().padStart(2, '0');
      
      const ultimoPedido = await Pedido.findOne({ tenantId })
        .sort({ createdAt: -1 })
        .select('numeroPedido');
      
      let numeroSequencial = 1;
      if (ultimoPedido && ultimoPedido.numeroPedido.startsWith(prefix)) {
        numeroSequencial = parseInt(ultimoPedido.numeroPedido.slice(-3)) + 1;
      }
      
      const numeroPedido = prefix + numeroSequencial.toString().padStart(3, '0');
      
      // Criar pedido
      const novoPedido = new Pedido({
        tenantId,
        numeroPedido,
        cliente,
        itens: itensValidados,
        entrega: {
          tipo: entrega.tipo,
          endereco: entrega.endereco || '',
          taxa: taxaEntrega
        },
        subtotal,
        taxaEntrega,
        valorTotal,
        pagamento,
        observacoes: observacoes || '',
        status: 'recebido'
      });
      
      const pedidoSalvo = await novoPedido.save();
      
      res.status(201).json({
        message: 'Pedido criado com sucesso!',
        pedido: pedidoSalvo,
        numeroPedido
      });
      
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
  
  // Listar pedidos (para painel admin)
  static async getPedidos(req, res) {
    try {
      const tenantId = req.tenantId;
      const { status, limite = 50, pagina = 1 } = req.query;
      
      const filtro = { tenantId };
      if (status) filtro.status = status;
      
      const pedidos = await Pedido.find(filtro)
        .sort({ createdAt: -1 })
        .limit(parseInt(limite))
        .skip((parseInt(pagina) - 1) * parseInt(limite));
      
      const total = await Pedido.countDocuments(filtro);
      
      res.status(200).json({
        pedidos,
        total,
        pagina: parseInt(pagina),
        totalPaginas: Math.ceil(total / limite)
      });
      
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar pedidos' });
    }
  }
  
  // Atualizar status do pedido
  static async updateStatusPedido(req, res) {
    try {
      const tenantId = req.tenantId;
      const { id } = req.params;
      const { status } = req.body;
      
      const statusValidos = ['recebido', 'preparando', 'pronto', 'saiu_entrega', 'entregue', 'cancelado'];
      if (!statusValidos.includes(status)) {
        return res.status(400).json({ error: 'Status inválido' });
      }
      
      const pedido = await Pedido.findOneAndUpdate(
        { _id: id, tenantId },
        { status },
        { new: true }
      );
      
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
      
      res.status(200).json({
        message: 'Status atualizado com sucesso',
        pedido
      });
      
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar status' });
    }
  }
  
  static async getTenantByDomain(domain) {
    const tenant = await Tenant.findOne({ dominioCustomizado: domain });
    return tenant ? tenant.tenantId : null;
  }
}