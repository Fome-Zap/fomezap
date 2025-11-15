// Controllers/AdminController.js - CRUD para painel administrativo
import { Tenant, Categoria, Produto, Extra, Pedido } from "../Models/TenantModels.js";
import mongoose from "mongoose";

export default class AdminController {
  
  // ============================================
  // CATEGORIAS
  // ============================================
  
  // Listar todas as categorias do tenant
  static async listarCategorias(req, res) {
    try {
      const { tenantId } = req.params;
      console.log('📁 AdminController.listarCategorias - tenantId:', tenantId);
      
      const categorias = await Categoria.find({ tenantId })
        .sort({ ordem: 1 })
        .lean();
      
      console.log('✅ Categorias encontradas:', categorias.length);
      
      // Se não há categorias, retornar array vazio (não erro)
      if (categorias.length === 0) {
        return res.status(200).json([]);
      }
      
      // Contar produtos por categoria
      const categoriasComContagem = await Promise.all(
        categorias.map(async (categoria) => {
          const count = await Produto.countDocuments({ 
            tenantId, 
            categoria: categoria._id 
          });
          return { ...categoria, totalProdutos: count };
        })
      );
      
      res.status(200).json(categoriasComContagem);
    } catch (error) {
      console.error('Erro ao listar categorias:', error);
      res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
  }
  
  // Criar nova categoria
  static async criarCategoria(req, res) {
    try {
      const { tenantId } = req.params;
      const { nome, icone, imagemPadrao } = req.body;
      
      if (!nome) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
      }
      
      // Buscar última ordem
      const ultimaCategoria = await Categoria.findOne({ tenantId })
        .sort({ ordem: -1 })
        .select('ordem');
      
      const novaOrdem = ultimaCategoria ? ultimaCategoria.ordem + 1 : 0;
      
      const novaCategoria = new Categoria({
        tenantId,
        nome,
        icone: icone || '📦',
        imagemPadrao: imagemPadrao || '',
        ordem: novaOrdem,
        ativa: true
      });
      
      const categoriaSalva = await novaCategoria.save();
      
      res.status(201).json({
        message: 'Categoria criada com sucesso',
        categoria: categoriaSalva
      });
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      res.status(500).json({ error: 'Erro ao criar categoria' });
    }
  }
  
  // Editar categoria
  static async editarCategoria(req, res) {
    try {
      const { tenantId, id } = req.params;
      const { nome, icone, imagemPadrao, ativa } = req.body;
      
      const categoriaAtualizada = await Categoria.findOneAndUpdate(
        { _id: id, tenantId },
        { nome, icone, imagemPadrao, ativa },
        { new: true, runValidators: true }
      );
      
      if (!categoriaAtualizada) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }
      
      res.status(200).json({
        message: 'Categoria atualizada com sucesso',
        categoria: categoriaAtualizada
      });
    } catch (error) {
      console.error('Erro ao editar categoria:', error);
      res.status(500).json({ error: 'Erro ao atualizar categoria' });
    }
  }
  
  // Deletar categoria
  static async deletarCategoria(req, res) {
    try {
      const { tenantId, id } = req.params;
      
      // Verificar se há produtos vinculados
      const produtosVinculados = await Produto.countDocuments({
        tenantId,
        categoria: id
      });
      
      if (produtosVinculados > 0) {
        return res.status(400).json({ 
          error: `Não é possível deletar. Existem ${produtosVinculados} produto(s) vinculado(s) a esta categoria.`
        });
      }
      
      const categoriaRemovida = await Categoria.findOneAndDelete({ 
        _id: id, 
        tenantId 
      });
      
      if (!categoriaRemovida) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }
      
      res.status(200).json({ 
        message: 'Categoria removida com sucesso',
        categoria: categoriaRemovida
      });
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      res.status(500).json({ error: 'Erro ao deletar categoria' });
    }
  }
  
  // Reordenar categorias
  static async reordenarCategorias(req, res) {
    try {
      const { tenantId } = req.params;
      const { categorias } = req.body; // Array de { id, ordem }
      
      if (!Array.isArray(categorias)) {
        return res.status(400).json({ error: 'Formato inválido' });
      }
      
      // Atualizar ordem de cada categoria
      const promises = categorias.map(({ id, ordem }) => 
        Categoria.findOneAndUpdate(
          { _id: id, tenantId },
          { ordem },
          { new: true }
        )
      );
      
      await Promise.all(promises);
      
      res.status(200).json({ message: 'Ordem atualizada com sucesso' });
    } catch (error) {
      console.error('Erro ao reordenar categorias:', error);
      res.status(500).json({ error: 'Erro ao reordenar categorias' });
    }
  }
  
  // ============================================
  // PRODUTOS
  // ============================================
  
  // Listar todos os produtos do tenant
  static async listarProdutos(req, res) {
    try {
      const { tenantId } = req.params;
      const { categoria, busca, disponivel } = req.query;
      
      const filtro = { tenantId };
      
      if (categoria) {
        filtro.categoria = categoria;
      }
      
      if (busca) {
        filtro.$or = [
          { nome: { $regex: busca, $options: 'i' } },
          { descricao: { $regex: busca, $options: 'i' } }
        ];
      }
      
      if (disponivel !== undefined) {
        filtro.disponivel = disponivel === 'true';
      }
      
      const produtos = await Produto.find(filtro)
        .populate('categoria', 'nome icone')
        .sort({ createdAt: -1 })
        .lean();
      
      // Se não há produtos, retornar array vazio (não erro)
      res.status(200).json(produtos || []);
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
  }
  
  // Buscar um produto específico
  static async buscarProduto(req, res) {
    try {
      const { tenantId, id } = req.params;
      
      const produto = await Produto.findOne({ _id: id, tenantId })
        .populate('categoria', 'nome icone')
        .lean();
      
      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      
      res.status(200).json(produto);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      res.status(500).json({ error: 'Erro ao buscar produto' });
    }
  }
  
  // Criar novo produto
  static async criarProduto(req, res) {
    try {
      const { tenantId } = req.params;
      const { 
        codigo, 
        nome, 
        descricao, 
        preco, 
        categoria,
        emoji,
        imagem, 
        disponivel, 
        destaque,
        extras,
        tags 
      } = req.body;
      
      // Validações
      if (!nome) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
      }
      
      if (!preco || preco < 0) {
        return res.status(400).json({ error: 'Preço inválido' });
      }
      
      if (!categoria) {
        return res.status(400).json({ error: 'Categoria é obrigatória' });
      }
      
      // Verificar se categoria existe
      const categoriaExiste = await Categoria.findOne({ 
        _id: categoria, 
        tenantId 
      });
      
      if (!categoriaExiste) {
        return res.status(400).json({ error: 'Categoria não encontrada' });
      }
      
      const novoProduto = new Produto({
        tenantId,
        codigo: codigo || '',
        nome,
        descricao: descricao || '',
        preco: parseFloat(preco),
        categoria,
        emoji: emoji || '',
        imagem: imagem || '',
        disponivel: disponivel !== false,
        destaque: destaque === true,
        extras: extras || [],
        tags: tags || []
      });
      
      const produtoSalvo = await novoProduto.save();
      
      // Popular categoria antes de retornar
      await produtoSalvo.populate('categoria', 'nome icone');
      
      res.status(201).json({
        message: 'Produto criado com sucesso',
        produto: produtoSalvo
      });
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      res.status(500).json({ error: 'Erro ao criar produto' });
    }
  }
  
  // Editar produto
  static async editarProduto(req, res) {
    try {
      const { tenantId, id } = req.params;
      const dadosAtualizacao = req.body;
      
      // Se categoria foi alterada, verificar se existe
      if (dadosAtualizacao.categoria) {
        const categoriaExiste = await Categoria.findOne({ 
          _id: dadosAtualizacao.categoria, 
          tenantId 
        });
        
        if (!categoriaExiste) {
          return res.status(400).json({ error: 'Categoria não encontrada' });
        }
      }
      
      const produtoAtualizado = await Produto.findOneAndUpdate(
        { _id: id, tenantId },
        dadosAtualizacao,
        { new: true, runValidators: true }
      ).populate('categoria', 'nome icone');
      
      if (!produtoAtualizado) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      
      res.status(200).json({
        message: 'Produto atualizado com sucesso',
        produto: produtoAtualizado
      });
    } catch (error) {
      console.error('Erro ao editar produto:', error);
      res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
  }
  
  // Deletar produto
  static async deletarProduto(req, res) {
    try {
      const { tenantId, id } = req.params;
      
      const produtoRemovido = await Produto.findOneAndDelete({ 
        _id: id, 
        tenantId 
      });
      
      if (!produtoRemovido) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      
      res.status(200).json({ 
        message: 'Produto removido com sucesso',
        produto: produtoRemovido
      });
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      res.status(500).json({ error: 'Erro ao deletar produto' });
    }
  }
  
  // Toggle disponibilidade do produto
  static async toggleDisponibilidade(req, res) {
    try {
      const { tenantId, id } = req.params;
      
      const produto = await Produto.findOne({ _id: id, tenantId });
      
      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      
      produto.disponivel = !produto.disponivel;
      await produto.save();
      
      res.status(200).json({
        message: `Produto ${produto.disponivel ? 'ativado' : 'desativado'} com sucesso`,
        produto
      });
    } catch (error) {
      console.error('Erro ao alterar disponibilidade:', error);
      res.status(500).json({ error: 'Erro ao alterar disponibilidade' });
    }
  }
  
  // ============================================
  // EXTRAS
  // ============================================
  
  // Listar todos os extras do tenant
  static async listarExtras(req, res) {
    try {
      const { tenantId } = req.params;
      
      const extras = await Extra.find({ tenantId })
        .sort({ nome: 1 })
        .lean();
      
      // Se não há extras, retornar array vazio (não erro)
      res.status(200).json(extras || []);
    } catch (error) {
      console.error('Erro ao listar extras:', error);
      res.status(500).json({ error: 'Erro ao buscar extras' });
    }
  }
  
  // Criar novo extra
  static async criarExtra(req, res) {
    try {
      const { tenantId } = req.params;
      const { nome, preco, disponivel } = req.body;
      
      if (!nome) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
      }
      
      if (preco === undefined || preco < 0) {
        return res.status(400).json({ error: 'Preço inválido' });
      }
      
      const novoExtra = new Extra({
        tenantId,
        nome,
        preco: parseFloat(preco),
        disponivel: disponivel !== false
      });
      
      const extraSalvo = await novoExtra.save();
      
      res.status(201).json({
        message: 'Extra criado com sucesso',
        extra: extraSalvo
      });
    } catch (error) {
      console.error('Erro ao criar extra:', error);
      res.status(500).json({ error: 'Erro ao criar extra' });
    }
  }
  
  // Editar extra
  static async editarExtra(req, res) {
    try {
      const { tenantId, id } = req.params;
      const { nome, preco, disponivel } = req.body;
      
      const extraAtualizado = await Extra.findOneAndUpdate(
        { _id: id, tenantId },
        { nome, preco, disponivel },
        { new: true, runValidators: true }
      );
      
      if (!extraAtualizado) {
        return res.status(404).json({ error: 'Extra não encontrado' });
      }
      
      res.status(200).json({
        message: 'Extra atualizado com sucesso',
        extra: extraAtualizado
      });
    } catch (error) {
      console.error('Erro ao editar extra:', error);
      res.status(500).json({ error: 'Erro ao atualizar extra' });
    }
  }
  
  // Deletar extra
  static async deletarExtra(req, res) {
    try {
      const { tenantId, id } = req.params;
      
      const extraRemovido = await Extra.findOneAndDelete({ 
        _id: id, 
        tenantId 
      });
      
      if (!extraRemovido) {
        return res.status(404).json({ error: 'Extra não encontrado' });
      }
      
      res.status(200).json({ 
        message: 'Extra removido com sucesso',
        extra: extraRemovido
      });
    } catch (error) {
      console.error('Erro ao deletar extra:', error);
      res.status(500).json({ error: 'Erro ao deletar extra' });
    }
  }
  
  // ============================================
  // DASHBOARD / ESTATÍSTICAS
  // ============================================
  
  static async getDashboard(req, res) {
    try {
      const { tenantId } = req.params;
      
      const [
        totalCategorias,
        totalProdutos,
        produtosDisponiveis,
        totalExtras
      ] = await Promise.all([
        Categoria.countDocuments({ tenantId }),
        Produto.countDocuments({ tenantId }),
        Produto.countDocuments({ tenantId, disponivel: true }),
        Extra.countDocuments({ tenantId })
      ]);
      
      res.status(200).json({
        categorias: totalCategorias,
        produtos: totalProdutos,
        produtosDisponiveis,
        produtosIndisponiveis: totalProdutos - produtosDisponiveis,
        extras: totalExtras
      });
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  }

  // ============================================
  // PEDIDOS
  // ============================================
  
  static async listarPedidos(req, res) {
    try {
      const { tenantId } = req.params;
      const { status } = req.query;
      
      const filtro = { tenantId };
      if (status) filtro.status = status;
      
      const pedidos = await Pedido.find(filtro)
        .sort({ createdAt: -1 })
        .limit(100);
      
      res.status(200).json({ pedidos });
    } catch (error) {
      console.error('Erro ao listar pedidos:', error);
      res.status(500).json({ error: 'Erro ao buscar pedidos' });
    }
  }

  static async buscarPedido(req, res) {
    try {
      const { tenantId, id } = req.params;
      
      const pedido = await Pedido.findOne({ _id: id, tenantId });
      
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
      
      res.status(200).json(pedido);
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      res.status(500).json({ error: 'Erro ao buscar pedido' });
    }
  }

  static async atualizarStatusPedido(req, res) {
    try {
      const { tenantId, id } = req.params;
      const { status } = req.body;
      
      const statusValidos = ['recebido', 'preparando', 'pronto', 'saiu_entrega', 'entregue', 'cancelado'];
      if (!statusValidos.includes(status)) {
        return res.status(400).json({ error: 'Status inválido' });
      }
      
      const pedido = await Pedido.findOneAndUpdate(
        { _id: id, tenantId },
        { status, updatedAt: new Date() },
        { new: true }
      );
      
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
      
      res.status(200).json({ message: 'Status atualizado com sucesso', pedido });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      res.status(500).json({ error: 'Erro ao atualizar status' });
    }
  }

  static async deletarPedido(req, res) {
    try {
      const { tenantId, id } = req.params;
      
      const pedido = await Pedido.findOneAndDelete({ _id: id, tenantId });
      
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
      
      res.status(200).json({ message: 'Pedido deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar pedido:', error);
      res.status(500).json({ error: 'Erro ao deletar pedido' });
    }
  }
}
