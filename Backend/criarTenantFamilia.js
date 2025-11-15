// Script para criar tenant "Lanchonete em Família" com slug "familia"
import 'dotenv/config';
import mongoose from './db/conn.js';
import { Tenant, Categoria, Produto, Extra } from './Models/TenantModels.js';
import User from './Models/User.js';

console.log('🔌 MongoDB URI:', process.env.MONGODB_URI ? 'Configurado' : 'NÃO CONFIGURADO');

// Função para gerar tenantId único (MongoDB ObjectId como string)
function gerarTenantIdUnico() {
  return new mongoose.Types.ObjectId().toString();
}

// Dados iniciais de categorias, produtos e extras
const dadosIniciais = {
  categorias: [
    { nome: 'Lanches', icone: '🍔', ordem: 1 },
    { nome: 'Bebidas', icone: '🥤', ordem: 2 },
    { nome: 'Porções', icone: '🍟', ordem: 3 }
  ],
  produtos: [
    {
      categoria: 'Lanches',
      itens: [
        {
          nome: 'X-Tudo da Casa',
          descricao: 'Hambúrguer artesanal 200g, queijo, presunto, bacon, ovo, alface, tomate e molho especial',
          preco: 32.90,
          emoji: '🍔',
          disponivel: true
        },
        {
          nome: 'Misto Quente Especial',
          descricao: 'Pão de forma, queijo mussarela, presunto e orégano na chapa',
          preco: 15.90,
          emoji: '🥪',
          disponivel: true
        }
      ]
    },
    {
      categoria: 'Bebidas',
      itens: [
        {
          nome: 'Refrigerante Lata',
          descricao: 'Coca-Cola, Guaraná ou Fanta 350ml',
          preco: 5.00,
          emoji: '🥤',
          disponivel: true
        },
        {
          nome: 'Suco Natural',
          descricao: 'Laranja ou limão - 500ml',
          preco: 8.00,
          emoji: '🍹',
          disponivel: true
        }
      ]
    },
    {
      categoria: 'Porções',
      itens: [
        {
          nome: 'Batata Frita',
          descricao: 'Batata frita crocante - 400g',
          preco: 18.00,
          emoji: '🍟',
          disponivel: true
        },
        {
          nome: 'Onion Rings',
          descricao: 'Anéis de cebola empanados - 300g',
          preco: 20.00,
          emoji: '🧅',
          disponivel: true
        }
      ]
    }
  ],
  extras: [
    { nome: 'Bacon', preco: 5.00, disponivel: true },
    { nome: 'Queijo Extra', preco: 4.00, disponivel: true },
    { nome: 'Ovo', preco: 3.00, disponivel: true },
    { nome: 'Cheddar', preco: 4.50, disponivel: true }
  ]
};

async function criarTenantFamilia() {
  try {
    console.log('🔧 Iniciando criação do tenant "Lanchonete em Família"...');

    // Define slug fixo como "familia"
    const slug = 'familia';
    
    // Verifica se já existe
    const existente = await Tenant.findOne({ slug });
    if (existente) {
      console.log('⚠️  Tenant com slug "familia" já existe!');
      console.log('TenantId:', existente.tenantId);
      console.log('Nome:', existente.nome);
      return;
    }

    // Gera ID único
    const tenantId = gerarTenantIdUnico();
    console.log('✅ TenantId gerado:', tenantId);

    // Dados do tenant
    const dadosTenant = {
      nome: 'Lanchonete em Família',
      telefone: '(11) 98765-4321',
      email: 'contato@familia.com'
    };

    // Cria o tenant
    const novoTenant = await Tenant.create({
      tenantId,
      slug,
      nome: dadosTenant.nome,
      telefone: dadosTenant.telefone,
      email: dadosTenant.email,
      ativo: true,
      plano: 'premium'
    });

    console.log('✅ Tenant criado:', novoTenant.nome);

    // Cria categorias
    const categoriasCriadas = [];
    for (const cat of dadosIniciais.categorias) {
      const categoria = await Categoria.create({
        tenantId,
        nome: cat.nome,
        icone: cat.icone,
        ordem: cat.ordem,
        ativo: true
      });
      categoriasCriadas.push(categoria);
      console.log(`✅ Categoria criada: ${categoria.nome}`);
    }

    // Cria produtos
    let totalProdutos = 0;
    for (const grupo of dadosIniciais.produtos) {
      const categoria = categoriasCriadas.find(c => c.nome === grupo.categoria);
      if (!categoria) {
        console.log(`⚠️  Categoria "${grupo.categoria}" não encontrada`);
        continue;
      }

      for (const item of grupo.itens) {
        await Produto.create({
          tenantId,
          categoria: categoria._id,
          nome: item.nome,
          descricao: item.descricao,
          preco: item.preco,
          emoji: item.emoji,
          disponivel: item.disponivel,
          destaque: false
        });
        totalProdutos++;
      }
    }
    console.log(`✅ ${totalProdutos} produtos criados`);

    // Cria extras
    let totalExtras = 0;
    for (const extra of dadosIniciais.extras) {
      await Extra.create({
        tenantId,
        nome: extra.nome,
        preco: extra.preco,
        disponivel: extra.disponivel
      });
      totalExtras++;
    }
    console.log(`✅ ${totalExtras} extras criados`);

    // Cria usuário admin
    const emailAdmin = 'admin@familia.com';
    const senhaAdmin = 'familia123';

    const usuarioExistente = await User.findOne({ email: emailAdmin });
    if (usuarioExistente) {
      console.log('⚠️  Usuário admin já existe:', emailAdmin);
    } else {
      // IMPORTANTE: Não fazer hash manual, deixar o middleware do User fazer
      await User.create({
        tenantId,
        nome: 'Administrador Família',
        email: emailAdmin,
        senha: senhaAdmin, // Será hasheado automaticamente pelo middleware
        role: 'tenant_admin'
      });
      console.log('✅ Usuário admin criado:', emailAdmin);
    }

    console.log('\n🎉 TENANT CRIADO COM SUCESSO!');
    console.log('═══════════════════════════════════════');
    console.log('📋 DADOS DO TENANT:');
    console.log('   Nome:', dadosTenant.nome);
    console.log('   TenantId:', tenantId);
    console.log('   Slug:', slug);
    console.log('   Telefone:', dadosTenant.telefone);
    console.log('   Email:', dadosTenant.email);
    console.log('\n👤 CREDENCIAIS DE ACESSO:');
    console.log('   Email:', emailAdmin);
    console.log('   Senha:', senhaAdmin);
    console.log('\n🌐 SUBDOMÍNIO DE PRODUÇÃO:');
    console.log('   https://familia.fomezap.com');
    console.log('═══════════════════════════════════════\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Erro ao criar tenant:', error);
    process.exit(1);
  }
}

// Aguarda conexão do MongoDB e executa
mongoose.connection.once('open', () => {
  console.log('✅ Conectado ao MongoDB');
  criarTenantFamilia();
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Erro ao conectar no MongoDB:', err);
  process.exit(1);
});
