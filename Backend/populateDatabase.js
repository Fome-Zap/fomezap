// populateDatabase.js - Script para criar dados de exemplo
import mongoose from "./db/conn.js";
import { Tenant, Categoria, Produto, Extra } from "./Models/TenantModels.js";

async function popularBanco() {
  try {
    console.log('🚀 Iniciando população do banco de dados...');

    // Limpar dados existentes do tenant demo
    await Tenant.deleteOne({ tenantId: 'demo' });
    await Categoria.deleteMany({ tenantId: 'demo' });
    await Produto.deleteMany({ tenantId: 'demo' });
    await Extra.deleteMany({ tenantId: 'demo' });

    // 1. Criar Tenant Demo
    const tenant = new Tenant({
      tenantId: 'demo',
      nome: 'Lanches do João',
      slug: 'lanches-do-joao',
      logo: '/images/logo-demo.png',
      telefone: '(11) 99999-9999',
      endereco: 'Rua dos Lanches, 123 - Centro',
      horarioFuncionamento: {
        abertura: '18:00',
        fechamento: '23:30',
        diasSemana: ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']
      },
      tema: {
        corPrimaria: '#ff6b35',
        corSecundaria: '#2c3e50',
        corBotao: '#27ae60'
      },
      configuracoes: {
        mostarPrecos: true,
        permitirExtras: true,
        taxaEntrega: 5.00,
        pedidoMinimo: 25.00,
        tempoEstimado: '45-60 minutos',
        formasPagamento: ['dinheiro', 'pix', 'cartao'],
        mensagemWhatsApp: 'Olá! Gostaria de fazer um pedido:'
      },
      status: 'ativo',
      plano: {
        tipo: 'basic',
        limiteProdutos: 100,
        limitePedidosMes: 500
      },
      proprietario: {
        nome: 'João Silva',
        email: 'joao@lanchesdojoao.com',
        telefone: '(11) 99999-9999'
      }
    });

    await tenant.save();
    console.log('✅ Tenant criado:', tenant.nome);

    // 2. Criar Categorias
    const categorias = [
      {
        tenantId: 'demo',
        nome: 'Hambúrguers',
        icone: '🍔',
        ordem: 1
      },
      {
        tenantId: 'demo', 
        nome: 'Pizzas',
        icone: '🍕',
        ordem: 2
      },
      {
        tenantId: 'demo',
        nome: 'Bebidas',
        icone: '🥤',
        ordem: 3
      },
      {
        tenantId: 'demo',
        nome: 'Sobremesas',
        icone: '🍰',
        ordem: 4
      }
    ];

    const categoriasCreated = await Categoria.insertMany(categorias);
    console.log('✅ Categorias criadas:', categoriasCreated.length);

    // 3. Criar Extras  
    const extras = [
      {
        tenantId: 'demo',
        nome: 'Bacon',
        preco: 3.00
      },
      {
        tenantId: 'demo',
        nome: 'Ovo',
        preco: 2.50
      },
      {
        tenantId: 'demo',
        nome: 'Queijo Extra',
        preco: 2.00
      },
      {
        tenantId: 'demo',
        nome: 'Catupiry',
        preco: 3.50
      }
    ];

    const extrasCreated = await Extra.insertMany(extras);
    console.log('✅ Extras criados:', extrasCreated.length);

    // 4. Criar Produtos
    const produtos = [
      // Hambúrguers
      {
        tenantId: 'demo',
        codigo: '01',
        nome: 'X-Burger',
        descricao: 'Hambúrguer bovino, queijo, alface, tomate e molho especial',
        preco: 18.90,
        categoria: categoriasCreated.find(c => c.nome === 'Hambúrguers')._id,
        disponivel: true,
        destaque: true
      },
      {
        tenantId: 'demo',
        codigo: '02', 
        nome: 'X-Bacon',
        descricao: 'Hambúrguer bovino, bacon, queijo, alface, tomate',
        preco: 22.90,
        categoria: categoriasCreated.find(c => c.nome === 'Hambúrguers')._id,
        disponivel: true,
        destaque: true
      },
      {
        tenantId: 'demo',
        codigo: '03',
        nome: 'X-Tudo',
        descricao: 'Hambúrguer bovino, bacon, ovo, queijo, presunto, alface, tomate',
        preco: 28.90,
        categoria: categoriasCreated.find(c => c.nome === 'Hambúrguers')._id,
        disponivel: true
      },

      // Pizzas
      {
        tenantId: 'demo',
        codigo: '10',
        nome: 'Pizza Margherita',
        descricao: 'Molho de tomate, mussarela, manjericão e azeite',
        preco: 32.90,
        categoria: categoriasCreated.find(c => c.nome === 'Pizzas')._id,
        disponivel: true
      },
      {
        tenantId: 'demo',
        codigo: '11',
        nome: 'Pizza Calabresa',
        descricao: 'Molho de tomate, mussarela, calabresa e cebola',
        preco: 35.90,
        categoria: categoriasCreated.find(c => c.nome === 'Pizzas')._id,
        disponivel: true,
        destaque: true
      },
      {
        tenantId: 'demo',
        codigo: '12',
        nome: 'Pizza Portuguesa',
        descricao: 'Molho de tomate, mussarela, presunto, ovos, cebola e azeitona',
        preco: 38.90,
        categoria: categoriasCreated.find(c => c.nome === 'Pizzas')._id,
        disponivel: true
      },

      // Bebidas
      {
        tenantId: 'demo',
        codigo: '20',
        nome: 'Coca-Cola 350ml',
        descricao: 'Refrigerante gelado',
        preco: 5.50,
        categoria: categoriasCreated.find(c => c.nome === 'Bebidas')._id,
        disponivel: true
      },
      {
        tenantId: 'demo',
        codigo: '21',
        nome: 'Suco de Laranja',
        descricao: 'Suco natural de laranja 400ml',
        preco: 8.90,
        categoria: categoriasCreated.find(c => c.nome === 'Bebidas')._id,
        disponivel: true
      },
      {
        tenantId: 'demo',
        codigo: '22', 
        nome: 'Água Mineral',
        descricao: 'Água mineral 500ml',
        preco: 3.50,
        categoria: categoriasCreated.find(c => c.nome === 'Bebidas')._id,
        disponivel: true
      },

      // Sobremesas
      {
        tenantId: 'demo',
        codigo: '30',
        nome: 'Pudim de Leite',
        descricao: 'Pudim caseiro com calda de caramelo',
        preco: 12.90,
        categoria: categoriasCreated.find(c => c.nome === 'Sobremesas')._id,
        disponivel: true
      },
      {
        tenantId: 'demo',
        codigo: '31',
        nome: 'Brownie com Sorvete',
        descricao: 'Brownie de chocolate com sorvete de baunilha',
        preco: 15.90,
        categoria: categoriasCreated.find(c => c.nome === 'Sobremesas')._id,
        disponivel: true,
        destaque: true
      }
    ];

    const produtosCreated = await Produto.insertMany(produtos);
    console.log('✅ Produtos criados:', produtosCreated.length);

    console.log('\n🎉 Banco de dados populado com sucesso!');
    console.log('\n📋 Dados criados:');
    console.log(`- Tenant: ${tenant.nome} (ID: ${tenant.tenantId})`);
    console.log(`- Categorias: ${categoriasCreated.length}`);
    console.log(`- Produtos: ${produtosCreated.length}`);
    console.log(`- Extras: ${extrasCreated.length}`);
    console.log('\n🌐 Para testar, acesse: http://localhost:5173?tenant=demo');

  } catch (error) {
    console.error('❌ Erro ao popular banco:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Executar se for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  popularBanco();
}

export default popularBanco;