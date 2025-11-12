import mongoose from 'mongoose';
import argon2 from 'argon2';
import { Tenant, Categoria, Produto, Extra } from './Models/TenantModels.js';
import User from './Models/User.js';

// Conectar ao MongoDB Atlas (produção)
const MONGODB_URI = 'mongodb+srv://tffjauds_db_user:VK8j7FSIYvV6whHh@fomezap-prod.wwj0swg.mongodb.net/fomezap?retryWrites=true&w=majority&appName=fomezap-prod';

async function popularProducao() {
  // Fechar conexão existente se houver
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  try {
    console.log('🔌 Conectando ao MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB Atlas!');

    // Limpar dados existentes
    console.log('🗑️  Limpando dados existentes...');
    await Tenant.deleteMany({ tenantId: 'demo' });
    await Categoria.deleteMany({ tenantId: 'demo' });
    await Produto.deleteMany({ tenantId: 'demo' });
    await Extra.deleteMany({ tenantId: 'demo' });
    await User.deleteMany({ tenantId: 'demo' });

    // 1. Criar Tenant
    console.log('🏪 Criando tenant "demo"...');
    const tenant = await Tenant.create({
      tenantId: 'demo',
      nome: 'Lanches do João',
      slug: 'demo',
      logo: 'https://via.placeholder.com/150x150.png?text=Lanches+do+João',
      telefone: '(14) 99999-9999',
      endereco: 'Rua das Flores, 123 - Centro - Jaú/SP',
      horarioFuncionamento: {
        abertura: '18:00',
        fechamento: '23:00',
        diasSemana: ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']
      },
      tema: {
        corPrimaria: '#FF6B35',
        corSecundaria: '#004E89',
        corBotao: '#FF6B35'
      },
      configuracoes: {
        mostarPrecos: true,
        permitirExtras: true,
        taxaEntrega: 5.00,
        pedidoMinimo: 20.00,
        tempoEstimado: '30-45 minutos',
        formasPagamento: ['dinheiro', 'pix', 'cartao'],
        mensagemWhatsApp: 'Olá! Gostaria de fazer um pedido.'
      },
      status: 'ativo',
      plano: {
        tipo: 'free',
        limiteProdutos: 100,
        limitePedidosMes: 500
      },
      proprietario: {
        nome: 'João Silva',
        email: 'joao@demo.com',
        telefone: '(14) 99999-9999'
      }
    });
    console.log(`✅ Tenant criado: ${tenant.tenantId}`);

    // 2. Criar Categorias
    console.log('📁 Criando categorias...');
    const categorias = await Categoria.create([
      {
        tenantId: 'demo',
        nome: 'Lanches',
        descricao: 'Deliciosos lanches artesanais',
        imagem: 'https://via.placeholder.com/300x200.png?text=Lanches',
        ordem: 1,
        ativo: true
      },
      {
        tenantId: 'demo',
        nome: 'Bebidas',
        descricao: 'Refrigerantes e sucos naturais',
        imagem: 'https://via.placeholder.com/300x200.png?text=Bebidas',
        ordem: 2,
        ativo: true
      },
      {
        tenantId: 'demo',
        nome: 'Porções',
        descricao: 'Porções para compartilhar',
        imagem: 'https://via.placeholder.com/300x200.png?text=Porcoes',
        ordem: 3,
        ativo: true
      },
      {
        tenantId: 'demo',
        nome: 'Sobremesas',
        descricao: 'Doces irresistíveis',
        imagem: 'https://via.placeholder.com/300x200.png?text=Sobremesas',
        ordem: 4,
        ativo: true
      }
    ]);
    console.log(`✅ ${categorias.length} categorias criadas`);

    // 3. Criar Extras
    console.log('🍟 Criando extras...');
    const extras = await Extra.create([
      {
        tenantId: 'demo',
        nome: 'Queijo Extra',
        preco: 3.00,
        disponivel: true
      },
      {
        tenantId: 'demo',
        nome: 'Bacon',
        preco: 4.00,
        disponivel: true
      },
      {
        tenantId: 'demo',
        nome: 'Ovo',
        preco: 2.50,
        disponivel: true
      },
      {
        tenantId: 'demo',
        nome: 'Catupiry',
        preco: 3.50,
        disponivel: true
      }
    ]);
    console.log(`✅ ${extras.length} extras criados`);

    // 4. Criar Produtos (usando ObjectId das categorias)
    console.log('🍔 Criando produtos...');
    
    // Buscar categorias para pegar seus ObjectIds
    const categoriaLanches = categorias.find(c => c.nome === 'Lanches');
    const categoriaBebidas = categorias.find(c => c.nome === 'Bebidas');
    const categoriaPorcoes = categorias.find(c => c.nome === 'Porções');
    
    const produtos = await Produto.create([
      {
        tenantId: 'demo',
        categoria: categoriaLanches._id,
        nome: 'X-Burger Tradicional',
        descricao: 'Hambúrguer 180g, queijo, alface, tomate e molho especial',
        preco: 25.00,
        imagem: 'https://via.placeholder.com/300x200.png?text=X-Burger',
        disponivel: true,
        estoque: 50
      },
      {
        tenantId: 'demo',
        categoria: categoriaLanches._id,
        nome: 'X-Bacon',
        descricao: 'Hambúrguer 180g, queijo, bacon crocante, alface, tomate',
        preco: 30.00,
        imagem: 'https://via.placeholder.com/300x200.png?text=X-Bacon',
        disponivel: true,
        estoque: 40
      },
      {
        tenantId: 'demo',
        categoria: categoriaLanches._id,
        nome: 'X-Egg',
        descricao: 'Hambúrguer 180g, queijo, ovo, alface, tomate',
        preco: 28.00,
        imagem: 'https://via.placeholder.com/300x200.png?text=X-Egg',
        disponivel: true,
        estoque: 35
      },
      {
        tenantId: 'demo',
        categoria: categoriaBebidas._id,
        nome: 'Coca-Cola 350ml',
        descricao: 'Refrigerante Coca-Cola gelado',
        preco: 5.00,
        imagem: 'https://via.placeholder.com/300x200.png?text=Coca-Cola',
        disponivel: true,
        estoque: 100
      },
      {
        tenantId: 'demo',
        categoria: categoriaBebidas._id,
        nome: 'Suco de Laranja 500ml',
        descricao: 'Suco natural de laranja',
        preco: 8.00,
        imagem: 'https://via.placeholder.com/300x200.png?text=Suco+Laranja',
        disponivel: true,
        estoque: 50
      },
      {
        tenantId: 'demo',
        categoria: categoriaPorcoes._id,
        nome: 'Batata Frita Grande',
        descricao: 'Porção de batata frita crocante (500g)',
        preco: 18.00,
        imagem: 'https://via.placeholder.com/300x200.png?text=Batata+Frita',
        disponivel: true,
        estoque: 60
      }
    ]);
    console.log(`✅ ${produtos.length} produtos criados`);

    // 5. Criar Usuário Admin
    console.log('👤 Criando usuário admin...');
    const admin = await User.create({
      tenantId: 'demo',
      nome: 'Administrador',
      email: 'admin@demo.com',
      senha: '123456', // Senha sem hash - o modelo vai hashear automaticamente
      role: 'tenant_admin'
    });
    console.log(`✅ Usuário admin criado: ${admin.email}`);

    console.log('\n🎉 Banco de produção populado com sucesso!');
    console.log('\n📋 Credenciais de acesso:');
    console.log('   Email: admin@demo.com');
    console.log('   Senha: 123456');
    console.log('\n🌐 Acesse: https://fomezap.netlify.app/admin');

  } catch (error) {
    console.error('❌ Erro ao popular produção:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado do MongoDB Atlas');
    process.exit(0);
  }
}

popularProducao();
