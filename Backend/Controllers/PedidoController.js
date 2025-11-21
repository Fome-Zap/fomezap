// Controllers/PedidoController.js - Evolução do TarefaController para Multi-Tenant
import { Pedido, Produto, Extra, Tenant } from "../Models/TenantModels.js";
import { Types } from "mongoose";

export default class PedidoController {
  
  // Criar pedido (evolução do create de tarefas)
  static async create(req, res) {
    const { cliente, itens, entrega, pagamento, observacoes } = req.body;
    
    // Suporta tanto slug quanto tenantId ObjectId
    const tenantParam = req.tenantId || req.params.tenantId;
    console.log('📦 PedidoController.create - Parâmetro tenant:', tenantParam);
    
    // Resolver slug para tenantId se necessário
    const tenantQuery = tenantParam.length === 24 && /^[0-9a-fA-F]+$/.test(tenantParam)
      ? { tenantId: tenantParam }
      : { $or: [{ tenantId: tenantParam }, { slug: tenantParam }] };
    
    const tenant = await Tenant.findOne(tenantQuery);
    
    if (!tenant) {
      console.log('❌ Tenant não encontrado:', tenantParam);
      return res.status(404).json({ message: "Restaurante não encontrado" });
    }
    
    const tenantId = tenant.tenantId;
    console.log('✅ Tenant resolvido:', { slug: tenant.slug, tenantId });

    // Validações básicas (similar ao seu padrão)
    if (!cliente?.nome) {
      return res.status(422).json({ message: "Preencha o nome do cliente" });
    }
    if (!cliente?.telefone) {
      return res.status(422).json({ message: "Preencha o telefone do cliente" });
    }
    if (!itens || itens.length === 0) {
      return res.status(422).json({ message: "Adicione pelo menos um item ao pedido" });
    }
    if (!entrega?.tipo) {
      return res.status(422).json({ message: "Tipo de entrega é obrigatório" });
    }
    if (!pagamento?.forma) {
      return res.status(422).json({ message: "Forma de pagamento é obrigatória" });
    }

    try {
      // Recalcular preços no backend (SEGURANÇA)
      let subtotal = 0;
      const itensValidados = [];

      for (const item of itens) {
        // Buscar produto real no banco
        const produtoId = item.produtoId || item.id || item._id;
        
        if (!produtoId) {
          console.log('❌ Item sem ID:', item);
          return res.status(400).json({ 
            message: `Item sem ID encontrado: ${item.nome}` 
          });
        }

        const produto = await Produto.findOne({ 
          _id: produtoId, 
          tenantId,
          disponivel: true 
        });

        if (!produto) {
          console.log('❌ Produto não encontrado:', { produtoId, tenantId, itemNome: item.nome });
          return res.status(404).json({ 
            message: `Produto ${item.nome} não encontrado ou indisponível` 
          });
        }

        let precoItem = produto.preco;
        const extrasValidados = [];

        // Validar e recalcular extras
        if (item.extras?.length) {
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

      // Buscar configurações do tenant (já temos o objeto tenant)
      const taxaEntrega = entrega.tipo === 'delivery' ? (tenant.configuracoes?.taxaEntrega || 5.00) : 0;
      const valorTotal = subtotal + taxaEntrega;

      // Verificar pedido mínimo
      const pedidoMinimo = tenant.configuracoes?.pedidoMinimo || 0;
      if (pedidoMinimo > 0 && subtotal < pedidoMinimo) {
        return res.status(422).json({ 
          message: `Pedido mínimo: R$ ${pedidoMinimo.toFixed(2)}` 
        });
      }

      // Gerar número do pedido (similar ao sistema de ID das tarefas)
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

      // Criar pedido (similar ao padrão do seu create)
      const pedido = new Pedido({
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
        status: 'recebido' // Equivale à situação das tarefas
      });

      const novoPedido = await pedido.save();
      
      // Gerar link do WhatsApp
      const whatsappUrl = PedidoController.gerarLinkWhatsApp(novoPedido, tenant);

      res.status(200).json({ 
        message: "Pedido criado com sucesso!", 
        pedido: novoPedido,
        whatsappUrl
      });

    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      res.status(500).json({ message: "Problema ao processar o pedido", error });
    }
  }

  // Remover pedido (adaptação do remove)
  static async remove(req, res) {
    const id = req.params.id;
    const tenantId = req.tenantId;
    const ObjectId = Types.ObjectId;

    if (!ObjectId.isValid(id)) {
      return res.status(422).json({ message: "Id inválido" });
    }

    try {
      const pedido = await Pedido.findOne({ _id: id, tenantId });
      
      if (!pedido) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }

      // Só permitir remoção se estiver em status específicos
      if (!['recebido', 'cancelado'].includes(pedido.status)) {
        return res.status(422).json({ 
          message: "Não é possível remover pedidos em andamento" 
        });
      }

      await Pedido.findOneAndDelete({ _id: id, tenantId });
      res.status(200).json({ message: "Pedido removido com sucesso!" });

    } catch (error) {
      res.status(500).json({ message: "Problema ao remover o pedido", error });
    }
  }

  // Buscar todos os pedidos (adaptação do getAll)
  static async getAll(req, res) {
    const tenantId = req.tenantId;
    const { status, limite = 50, pagina = 1 } = req.query;

    try {
      const filtro = { tenantId };
      if (status) filtro.status = status;

      const pedidos = await Pedido.find(filtro)
        .sort({ createdAt: -1 }) // Mais recentes primeiro (como no seu padrão)
        .limit(parseInt(limite))
        .skip((parseInt(pagina) - 1) * parseInt(limite))
        .populate('itens.produtoId', 'nome');

      const total = await Pedido.countDocuments(filtro);

      res.status(200).json({ 
        pedidos,
        total,
        pagina: parseInt(pagina),
        totalPaginas: Math.ceil(total / limite)
      });

    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar pedidos", error });
    }
  }

  // Buscar um pedido (adaptação do getOne)
  static async getOne(req, res) {
    const id = req.params.id;
    const tenantId = req.tenantId;
    const ObjectId = Types.ObjectId;

    if (!ObjectId.isValid(id)) {
      return res.status(422).json({ message: "Id inválido" });
    }

    try {
      const pedido = await Pedido.findOne({ _id: id, tenantId })
        .populate('itens.produtoId', 'nome imagem');

      if (!pedido) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }

      res.status(200).json(pedido);

    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar o pedido", error });
    }
  }

  // Atualizar status parcial (adaptação do updateParcial)
  static async updateParcial(req, res) {
    try {
      const id = req.params.id;
      const { status } = req.body;
      const tenantId = req.tenantId;
      const ObjectId = Types.ObjectId;

      if (!ObjectId.isValid(id)) {
        return res.status(422).json({ message: "Id inválido" });
      }

      if (!status) {
        return res.status(422).json({ message: "Status não informado" });
      }

      // Validar status permitidos
      const statusValidos = ['recebido', 'preparando', 'pronto', 'saiu_entrega', 'entregue', 'cancelado'];
      if (!statusValidos.includes(status)) {
        return res.status(422).json({ message: "Status inválido" });
      }

      const updatedPedido = await Pedido.findOneAndUpdate(
        { _id: id, tenantId },
        { status },
        { new: true }
      );

      if (!updatedPedido) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }

      res.status(200).json({ 
        message: "Status alterado com sucesso", 
        pedido: updatedPedido 
      });

    } catch (error) {
      res.status(500).json({ message: "Erro ao alterar o status", error });
    }
  }

  // Atualizar dados completos (adaptação do updateCompleta)
  static async updateCompleta(req, res) {
    try {
      const id = req.params.id;
      const { cliente, entrega, pagamento, observacoes, status } = req.body;
      const tenantId = req.tenantId;
      const ObjectId = Types.ObjectId;

      if (!ObjectId.isValid(id)) {
        return res.status(422).json({ message: "Id inválido" });
      }

      // Validações básicas
      if (!cliente?.nome || !cliente?.telefone || !entrega?.tipo || !pagamento?.forma) {
        return res.status(422).json({ 
          message: "Nome, telefone, tipo de entrega e forma de pagamento são obrigatórios" 
        });
      }

      const updateData = {
        cliente,
        entrega,
        pagamento,
        observacoes: observacoes || '',
        status: status || 'recebido'
      };

      const updatedPedido = await Pedido.findOneAndUpdate(
        { _id: id, tenantId },
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedPedido) {
        return res.status(404).json({ message: "Pedido não encontrado" });
      }

      res.status(200).json({ 
        message: "Pedido alterado com sucesso", 
        pedido: updatedPedido 
      });

    } catch (error) {
      res.status(500).json({ message: "Erro ao alterar o pedido", error });
    }
  }

  // Função auxiliar para gerar link do WhatsApp (formatação compacta)
  static gerarLinkWhatsApp(pedido, tenant) {
    const formatarPreco = (valor) => `R$ ${Number(valor).toFixed(2).replace('.', ',')}`;
    
    let msg = [];
    
    // CABEÇALHO
    msg.push(`== NOVO PEDIDO: #${pedido.numeroPedido} ==`);
    
    // DATA
    const data = new Date(pedido.createdAt || Date.now());
    const dataFormatada = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    const horaFormatada = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    msg.push(`📋Data: ${dataFormatada}, ${horaFormatada}`);
    
    // CLIENTE
    msg.push(`👤Cliente: ${pedido.cliente.nome}`);
    if (pedido.cliente.telefone) {
      msg.push(`📱Telefone: ${pedido.cliente.telefone}`);
    }
    
    // ENTREGA/RETIRADA
    if (pedido.entrega.tipo === 'delivery') {
      msg.push(`🚚Tipo: Entrega`);
      if (pedido.entrega.endereco) {
        msg.push(`📍Endereço: ${pedido.entrega.endereco}`);
      }
    } else {
      msg.push(`🏪Tipo: Retirada`);
    }
    
    // PAGAMENTO
    msg.push(`💳Pagamento: ${pedido.pagamento.forma}`);
    msg.push('');
    
    // ITENS
    msg.push('=== ITENS PEDIDOS ===');
    
    pedido.itens.forEach((item, idx) => {
      // Código do produto (usar índice como código) - Nome - Quantidade - Preço unitário
      const codigo = String(item.produtoId).slice(-2).padStart(2, '0');
      msg.push(`${codigo} - ${item.nome.toUpperCase()} (${item.quantidade}x) - ${formatarPreco(item.preco)}`);
      
      // Extras na mesma linha, separados por |
      if (item.extras?.length) {
        const extrasFormatados = item.extras
          .map(e => `+${e.nome.toUpperCase()}: ${formatarPreco(e.preco)}`)
          .join(' | ');
        msg.push(extrasFormatados);
      }
      
      // Observações do item (se houver)
      if (item.observacoes) {
        msg.push(`OBS: ${item.observacoes}`);
      }
      
      msg.push('--------------------------');
    });
    
    // RESUMO
    msg.push('=== RESUMO ===');
    msg.push(`Subtotal: ${formatarPreco(pedido.subtotal)}`);
    
    if (pedido.entrega.taxa && pedido.entrega.taxa > 0) {
      msg.push(`🚚Taxa: ${formatarPreco(pedido.entrega.taxa)}`);
    }
    
    msg.push(`💰TOTAL: ${formatarPreco(pedido.valorTotal)}`);
    msg.push('===================');
    
    // Observações gerais (se houver)
    if (pedido.observacoes) {
      msg.push('');
      msg.push(`📝 OBS GERAL: ${pedido.observacoes}`);
    }
    
    const mensagem = msg.join('\n');
    const telefone = (tenant.telefone || '').replace(/\D/g, '');
    return `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
  }
}