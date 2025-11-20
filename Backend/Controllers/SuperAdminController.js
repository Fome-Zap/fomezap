// Controllers/SuperAdminController.js - Gerenciamento de tenants pelo Super Admin
import { Tenant, Categoria, Produto, Extra, Pedido } from "../Models/TenantModels.js";
import User from "../Models/User.js";
import mongoose from "mongoose";

export default class SuperAdminController {
  
  // ============================================
  // ESTATÍSTICAS
  // ============================================
  
  static async estatisticas(req, res) {
    try {
      console.log('📊 Buscando estatísticas...');
      console.log('   userId:', req.userId);
      console.log('   userRole:', req.userRole);
      
      const totalTenants = await Tenant.countDocuments();
      const tenantsAtivos = await Tenant.countDocuments({ status: 'ativo' });
      const tenantsInativos = await Tenant.countDocuments({ status: 'inativo' });
      const totalUsuarios = await User.countDocuments();

      console.log('✅ Estatísticas:', { totalTenants, tenantsAtivos, tenantsInativos, totalUsuarios });
      
      res.json({
        totalTenants,
        tenantsAtivos,
        tenantsInativos,
        totalUsuarios
      });
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas', detalhes: error.message });
    }
  }
  
  // ============================================
  // LISTAR TENANTS
  // ============================================
  
  static async listarTenants(req, res) {
    try {
      console.log('📋 Listando tenants...');
      console.log('   userId:', req.userId);
      console.log('   userRole:', req.userRole);
      console.log('   tenantId:', req.tenantId);
      
      // Buscar todos os tenants
      const tenants = await Tenant.find()
        .select('tenantId nome slug telefone email endereco status createdAt')
        .sort({ createdAt: -1 })
        .lean();

      // Para cada tenant, buscar o email do admin (usuário com role tenant_admin)
      const tenantsComAdmin = await Promise.all(tenants.map(async (tenant) => {
        const admin = await User.findOne({ 
          tenantId: tenant.tenantId, 
          role: 'tenant_admin' 
        }).select('email').lean();
        
        return {
          ...tenant,
          emailAdmin: admin?.email || null // Email de login do admin
        };
      }));

      console.log(`✅ ${tenantsComAdmin.length} tenants encontrados`);
      res.json(tenantsComAdmin);
    } catch (error) {
      console.error('❌ Erro ao listar tenants:', error);
      res.status(500).json({ error: 'Erro ao listar tenants', detalhes: error.message });
    }
  }
  
  // ============================================
  // CRIAR TENANT
  // ============================================
  
  static async criarTenant(req, res) {
    console.log('⭐⭐⭐ MÉTODO CRIAR TENANT CHAMADO ⭐⭐⭐');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    
    try {
      const { nome, slug, telefone, email, endereco, status } = req.body;

      console.log('🏪 Criando novo tenant...');
      console.log('   Nome:', nome);
      console.log('   Slug:', slug);
      console.log('   Email:', email);
      console.log('   Telefone:', telefone);
      console.log('   Endereço:', endereco);

      // Validações
      if (!nome || !slug) {
        return res.status(400).json({ error: 'Nome e slug são obrigatórios' });
      }

      if (!email) {
        return res.status(400).json({ error: 'Email é obrigatório para criar o usuário admin' });
      }

      // Verificar se slug já existe
      const slugExistente = await Tenant.findOne({ slug });
      if (slugExistente) {
        return res.status(400).json({ error: 'Slug já está em uso por outro tenant' });
      }

      // Gerar tenantId único
      const tenantId = new mongoose.Types.ObjectId().toString();

      // Criar tenant
      const novoTenant = await Tenant.create({
        tenantId,
        nome,
        slug,
        telefone,
        email,
        endereco,
        status: status || 'ativo',
        logo: 'images/logo-default.png',
        plano: {
          tipo: 'basic',
          ativo: true
        }
      });

      // Criar usuário admin automaticamente com senha padrão
      const emailAdmin = email; // Usar o email fornecido
      const senhaPadrao = 'Fomezap@2024'; // Senha padrão forte
      
      let adminUser;
      try {
        adminUser = await User.create({
          email: emailAdmin,
          senha: senhaPadrao,
          nome: `Admin ${nome}`,
          role: 'tenant_admin',
          tenantId: tenantId,
          ativo: true
        });
        console.log(`✅ Usuário admin criado: ${emailAdmin} (senha: ${senhaPadrao})`);
      } catch (userError) {
        console.error('❌ ERRO CRÍTICO ao criar usuário admin:', userError);
        // Deletar tenant se admin não foi criado
        await Tenant.deleteOne({ tenantId });
        return res.status(500).json({ 
          error: 'Erro ao criar usuário admin para o tenant',
          detalhes: userError.message,
          dica: userError.code === 11000 ? 'Email já existe no sistema' : 'Erro desconhecido'
        });
      }

      // Criar categorias padrão
      const categoriasPadrao = [
        { nome: 'Lanches', icone: '🍔', ordem: 1 },
        { nome: 'Bebidas', icone: '🥤', ordem: 2 },
        { nome: 'Sobremesas', icone: '🍰', ordem: 3 }
      ];

      const categoriasIds = {};
      for (const cat of categoriasPadrao) {
        const categoria = await Categoria.create({
          tenantId,
          nome: cat.nome,
          icone: cat.icone,
          ordem: cat.ordem,
          ativo: true
        });
        categoriasIds[cat.nome] = categoria._id;
      }

      // Criar produtos modelo
      const produtosModelo = [
        {
          codigo: '001',
          nome: 'X-Burger Tradicional',
          descricao: 'Pão, hambúrguer, queijo, alface, tomate e molho especial',
          preco: 18.90,
          categoria: categoriasIds['Lanches'],
          disponivel: true,
          foto: null
        },
        {
          codigo: '002',
          nome: 'X-Bacon',
          descricao: 'Pão, hambúrguer, bacon, queijo, alface, tomate e maionese',
          preco: 22.90,
          categoria: categoriasIds['Lanches'],
          disponivel: true,
          foto: null
        },
        {
          codigo: '003',
          nome: 'X-Salada',
          descricao: 'Pão, hambúrguer, queijo, alface, tomate, milho, ervilha e batata palha',
          preco: 20.90,
          categoria: categoriasIds['Lanches'],
          disponivel: true,
          foto: null
        },
        {
          codigo: '101',
          nome: 'Refrigerante Lata 350ml',
          descricao: 'Coca-Cola, Guaraná ou Sprite',
          preco: 5.00,
          categoria: categoriasIds['Bebidas'],
          disponivel: true,
          foto: null
        },
        {
          codigo: '102',
          nome: 'Suco Natural 500ml',
          descricao: 'Laranja, limão ou morango',
          preco: 8.00,
          categoria: categoriasIds['Bebidas'],
          disponivel: true,
          foto: null
        },
        {
          codigo: '201',
          nome: 'Pudim de Leite',
          descricao: 'Pudim caseiro com calda de caramelo',
          preco: 7.50,
          categoria: categoriasIds['Sobremesas'],
          disponivel: true,
          foto: null
        }
      ];

      for (const prod of produtosModelo) {
        await Produto.create({
          tenantId,
          ...prod
        });
      }

      // Criar extras padrão
      const extrasPadrao = [
        { nome: 'Bacon', preco: 5.00 },
        { nome: 'Queijo Extra', preco: 4.00 },
        { nome: 'Ovo', preco: 3.00 }
      ];

      for (const extra of extrasPadrao) {
        await Extra.create({
          tenantId,
          nome: extra.nome,
          preco: extra.preco,
          disponivel: true
        });
      }

      console.log(`✅ Tenant criado: ${nome} (${slug})`);
      console.log('   Dados do tenant:', {
        tenantId: novoTenant.tenantId,
        nome: novoTenant.nome,
        email: novoTenant.email,
        slug: novoTenant.slug
      });
      console.log('   Admin criado para:', emailAdmin);
      
      res.status(201).json(novoTenant);
    } catch (error) {
      console.error('Erro ao criar tenant:', error);
      res.status(500).json({ error: 'Erro ao criar tenant' });
    }
  }
  
  // ============================================
  // ATUALIZAR TENANT
  // ============================================
  
  static async atualizarTenant(req, res) {
    try {
      const { tenantId } = req.params;
      const { nome, telefone, email, endereco, status } = req.body;

      // Não permitir alterar tenantId e slug
      const updates = {};
      if (nome) updates.nome = nome;
      if (telefone !== undefined) updates.telefone = telefone;
      if (email !== undefined) updates.email = email;
      if (endereco !== undefined) updates.endereco = endereco;
      if (status) updates.status = status;

      const tenantAtualizado = await Tenant.findOneAndUpdate(
        { tenantId },
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!tenantAtualizado) {
        return res.status(404).json({ error: 'Tenant não encontrado' });
      }

      console.log(`✅ Tenant atualizado: ${tenantAtualizado.nome}`);
      res.json(tenantAtualizado);
    } catch (error) {
      console.error('Erro ao atualizar tenant:', error);
      res.status(500).json({ error: 'Erro ao atualizar tenant' });
    }
  }
  
  // ============================================
  // ALTERAR STATUS
  // ============================================
  
  static async alterarStatus(req, res) {
    try {
      const { tenantId } = req.params;
      const { status } = req.body;

      if (!['ativo', 'inativo'].includes(status)) {
        return res.status(400).json({ error: 'Status inválido. Use "ativo" ou "inativo"' });
      }

      const tenant = await Tenant.findOneAndUpdate(
        { tenantId },
        { $set: { status } },
        { new: true }
      );

      if (!tenant) {
        return res.status(404).json({ error: 'Tenant não encontrado' });
      }

      console.log(`✅ Status alterado: ${tenant.nome} → ${status}`);
      res.json(tenant);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      res.status(500).json({ error: 'Erro ao alterar status' });
    }
  }
  
  // ============================================
  // EXCLUIR TENANT
  // ============================================
  
  static async excluirTenant(req, res) {
    try {
      const { tenantId } = req.params;

      // Buscar tenant
      const tenant = await Tenant.findOne({ tenantId });
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant não encontrado' });
      }

      // Excluir todos os dados relacionados
      await Categoria.deleteMany({ tenantId });
      await Produto.deleteMany({ tenantId });
      await Extra.deleteMany({ tenantId });
      await Pedido.deleteMany({ tenantId });
      await User.deleteMany({ tenantId });
      await Tenant.deleteOne({ tenantId });

      console.log(`🗑️  Tenant excluído: ${tenant.nome} (${tenantId})`);
      res.json({ message: 'Tenant e todos os dados relacionados foram excluídos' });
    } catch (error) {
      console.error('Erro ao excluir tenant:', error);
      res.status(500).json({ error: 'Erro ao excluir tenant' });
    }
  }
  
  // ============================================
  // ALTERAR SENHA DO ADMIN DO TENANT
  // ============================================
  
  static async alterarSenhaTenant(req, res) {
    try {
      const { tenantId } = req.params;
      const { novaSenha } = req.body;

      if (!novaSenha || novaSenha.length < 6) {
        return res.status(400).json({ error: 'Nova senha deve ter no mínimo 6 caracteres' });
      }

      // Buscar admin do tenant
      const admin = await User.findOne({ 
        tenantId, 
        role: 'tenant_admin' 
      });

      if (!admin) {
        return res.status(404).json({ error: 'Admin do tenant não encontrado' });
      }

      // Atualizar senha (será hasheada automaticamente pelo middleware do model)
      admin.senha = novaSenha;
      await admin.save();

      console.log(`🔑 Senha alterada para admin do tenant ${tenantId}`);
      res.json({ message: 'Senha do admin alterada com sucesso' });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({ error: 'Erro ao alterar senha' });
    }
  }
  
  // ============================================
  // GERAR TOKEN DE ACESSO PARA O TENANT
  // ============================================
  
  static async gerarAcessoTenant(req, res) {
    try {
      const { tenantId } = req.params;

      // Buscar tenant
      const tenant = await Tenant.findOne({ tenantId });
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant não encontrado' });
      }

      // Buscar admin do tenant
      const admin = await User.findOne({ 
        tenantId, 
        role: 'tenant_admin' 
      });

      if (!admin) {
        return res.status(404).json({ error: 'Admin do tenant não encontrado' });
      }

      // Gerar token JWT para o admin
      const jwt = (await import('jsonwebtoken')).default;
      const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-super-secreto-aqui-2024';
      
      const token = jwt.sign(
        { 
          userId: admin._id,
          email: admin.email,
          role: admin.role,
          tenantId: admin.tenantId
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log(`🔑 Token de acesso gerado para tenant ${tenantId}`);
      res.json({ 
        token,
        usuario: {
          id: admin._id,
          email: admin.email,
          nome: admin.nome,
          role: admin.role,
          tenantId: admin.tenantId
        }
      });
    } catch (error) {
      console.error('Erro ao gerar acesso:', error);
      res.status(500).json({ error: 'Erro ao gerar acesso' });
    }
  }
}
