// Script para criar novo tenant com dados iniciais automaticamente
import 'dotenv/config';
import mongoose from './db/conn.js';
import { Tenant, Categoria, Produto, Extra } from './Models/TenantModels.js';
import User from './Models/User.js';
import argon2 from 'argon2';

console.log('🔌 MongoDB URI:', process.env.MONGODB_URI ? 'Configurado' : 'NÃO CONFIGURADO');

// Função para gerar slug único a partir do nome
function gerarSlug(nome) {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '-')      // Substitui caracteres especiais por hífen
    .replace(/^-+|-+$/g, '');         // Remove hífens no início/fim
}

// Função para gerar tenantId único (MongoDB ObjectId como string)
function gerarTenantIdUnico() {
  return new mongoose.Types.ObjectId().toString();
}

// Dados iniciais de categorias, produtos e extras
const dadosIniciais = {
  categorias: [
    { nome: 'Pratos', icone: '🍽️', ordem: 1 },
    { nome: 'Bebidas', icone: '🥤', ordem: 2 },
    { nome: 'Sobremesas', icone: '🍰', ordem: 3 }
  ],
  produtos: [
    {
      categoria: 'Pratos',
      itens: [
        {
          nome: 'Hambúrguer Clássico',
          descricao: 'Pão, carne bovina, queijo, alface, tomate e molho especial',
          preco: 25.90,
          emoji: '🍔',
          disponivel: true
        },
        {
          nome: 'X-Bacon',
          descricao: 'Hambúrguer com bacon crocante, queijo cheddar e molho barbecue',
          preco: 28.90,
          emoji: '🥓',
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
          descricao: 'Laranja, limão ou maracujá - 500ml',
          preco: 8.00,
          emoji: '🍹',
          disponivel: true
        }
      ]
    },
    {
      categoria: 'Sobremesas',
      itens: [
        {
          nome: 'Brownie de Chocolate',
          descricao: 'Brownie artesanal com calda de chocolate',
          preco: 12.00,
          emoji: '🍫',
          disponivel: true
        },
        {
          nome: 'Pudim de Leite',
          descricao: 'Pudim cremoso com calda de caramelo',
          preco: 10.00,
          emoji: '🍮',
          disponivel: true
        }
      ]
    }
  ],
  extras: [
    { nome: 'Bacon', preco: 4.00, disponivel: true },
    { nome: 'Queijo Extra', preco: 3.00, disponivel: true },
    { nome: 'Ovo', preco: 2.50, disponivel: true },
    { nome: 'Cebola Caramelizada', preco: 3.50, disponivel: true }
  ]
};

async function criarNovoTenant(dadosTenant, criarUsuarioAdmin = true) {
  try {
    console.log('🔧 Iniciando criação de tenant...');
    
    // Aguardar conexão estar completamente estabelecida
    const maxTentativas = 100; // 100 x 100ms = 10 segundos
    let tentativas = 0;
    
    while (mongoose.connection.readyState !== 1 && tentativas < maxTentativas) {
      await new Promise(resolve => setTimeout(resolve, 100));
      tentativas++;
    }
    
    if (mongoose.connection.readyState !== 1) {
      throw new Error('❌ Timeout: não foi possível conectar ao MongoDB após 10 segundos');
    }
    
    console.log('✅ Conectado ao MongoDB (estado:', mongoose.connection.readyState, ')');

    // Validar dados obrigatórios
    console.log('🔍 Validando dados do tenant...');
    if (!dadosTenant.nome) {
      throw new Error('Nome do tenant é obrigatório');
    }
    if (!dadosTenant.nome) {
      throw new Error('Nome do tenant é obrigatório');
    }

    // Gerar tenantId único usando MongoDB ObjectId
    const tenantId = gerarTenantIdUnico();
    console.log(`🔑 TenantId gerado: ${tenantId}`);

    // Gerar slug único
    let slug = gerarSlug(dadosTenant.nome);
    let slugFinal = slug;
    let contador = 1;

    // Garantir que o slug seja único
    while (await Tenant.findOne({ slug: slugFinal })) {
      slugFinal = `${slug}-${contador}`;
      contador++;
    }

    console.log(`🏷️  Slug gerado: ${slugFinal}`);

    // Criar tenant
    const tenant = new Tenant({
      tenantId,
      nome: dadosTenant.nome,
      slug: slugFinal,
      telefone: dadosTenant.telefone || '',
      endereco: dadosTenant.endereco || '',
      horarioFuncionamento: {
        abertura: dadosTenant.horarioAbertura || '18:00',
        fechamento: dadosTenant.horarioFechamento || '23:30',
        diasSemana: dadosTenant.diasSemana || ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']
      },
      configuracoes: {
        aceitaDelivery: dadosTenant.aceitaDelivery !== false,
        taxaEntrega: dadosTenant.taxaEntrega || 5.00,
        pedidoMinimo: dadosTenant.pedidoMinimo || 25.00,
        tempoEstimado: dadosTenant.tempoEstimado || '45-60 minutos',
        formasPagamento: dadosTenant.formasPagamento || ['dinheiro', 'pix', 'cartao'],
        mensagemWhatsApp: dadosTenant.mensagemWhatsApp || 'Olá! Gostaria de fazer um pedido:'
      },
      tema: {
        corPrimaria: dadosTenant.corPrimaria || '#FF6B35',
        corSecundaria: dadosTenant.corSecundaria || '#F7931E',
        corBotao: dadosTenant.corBotao || '#4ECDC4'
      },
      status: dadosTenant.status || 'trial',
      plano: {
        tipo: dadosTenant.plano || 'free',
        limiteProdutos: dadosTenant.limiteProdutos || 20,
        limitePedidosMes: dadosTenant.limitePedidosMes || 50
      }
    });

    await tenant.save();
    console.log('✅ Tenant criado com sucesso!');

    // Criar categorias iniciais
    console.log('📦 Criando categorias iniciais...');
    const categoriasMap = {};

    for (const catData of dadosIniciais.categorias) {
      const categoria = new Categoria({
        tenantId,
        nome: catData.nome,
        icone: catData.icone,
        ordem: catData.ordem,
        ativa: true
      });
      await categoria.save();
      categoriasMap[catData.nome] = categoria._id;
      console.log(`   ✓ Categoria: ${catData.nome}`);
    }

    // Criar produtos iniciais
    console.log('🍔 Criando produtos iniciais...');
    let totalProdutos = 0;

    for (const grupo of dadosIniciais.produtos) {
      const categoriaId = categoriasMap[grupo.categoria];
      
      for (const prodData of grupo.itens) {
        const produto = new Produto({
          tenantId,
          nome: prodData.nome,
          descricao: prodData.descricao,
          preco: prodData.preco,
          categoria: categoriaId,
          emoji: prodData.emoji,
          disponivel: prodData.disponivel,
          destaque: false,
          extras: [],
          tags: []
        });
        await produto.save();
        totalProdutos++;
        console.log(`   ✓ Produto: ${prodData.nome}`);
      }
    }

    // Criar extras iniciais
    console.log('🧀 Criando extras iniciais...');
    const extrasIds = [];

    for (const extraData of dadosIniciais.extras) {
      const extra = new Extra({
        tenantId,
        nome: extraData.nome,
        preco: extraData.preco,
        disponivel: extraData.disponivel
      });
      await extra.save();
      extrasIds.push(extra._id.toString());
      console.log(`   ✓ Extra: ${extraData.nome}`);
    }

    // Criar usuário admin se solicitado
    if (criarUsuarioAdmin) {
      console.log('👤 Criando usuário administrador...');
      
      const emailAdmin = dadosTenant.emailAdmin || `admin@${slugFinal}.com`;
      const senhaAdmin = dadosTenant.senhaAdmin || 'admin123';

      // Verificar se já existe
      const usuarioExistente = await User.findOne({ email: emailAdmin });
      
      if (usuarioExistente) {
        console.log(`   ⚠️  Usuário ${emailAdmin} já existe, pulando...`);
      } else {
        // NÃO hashear manualmente - o middleware do User fará isso automaticamente
        const admin = new User({
          nome: dadosTenant.nomeAdmin || 'Administrador',
          email: emailAdmin,
          senha: senhaAdmin, // Senha em texto plano - será hasheada pelo middleware
          telefone: dadosTenant.telefone || '',
          role: 'tenant_admin',
          tenantId,
          ativo: true
        });

        await admin.save();
        console.log(`   ✅ Admin criado: ${emailAdmin} / ${senhaAdmin}`);
      }
    }

    // Resumo final
    console.log('\n🎉 TENANT CRIADO COM SUCESSO!\n');
    console.log('═══════════════════════════════════════');
    console.log(`📋 Nome: ${tenant.nome}`);
    console.log(`🔑 TenantId: ${tenantId}`);
    console.log(`🏷️  Slug: ${slugFinal}`);
    console.log(`📊 Categorias: ${dadosIniciais.categorias.length}`);
    console.log(`🍔 Produtos: ${totalProdutos}`);
    console.log(`🧀 Extras: ${dadosIniciais.extras.length}`);
    
    if (criarUsuarioAdmin) {
      console.log(`👤 Admin: ${dadosTenant.emailAdmin || `admin@${slugFinal}.com`}`);
      console.log(`🔐 Senha: ${dadosTenant.senhaAdmin || 'admin123'}`);
    }
    
    console.log('═══════════════════════════════════════');
    console.log(`\n🌐 URLs de acesso:`);
    console.log(`   Local: http://localhost:5173?tenant=${tenantId}`);
    console.log(`   Painel: http://localhost:5173/login`);
    console.log('\n💡 Use o tenantId acima para acessar o sistema!\n');

    return {
      tenantId,
      slug: slugFinal,
      nome: tenant.nome,
      emailAdmin: dadosTenant.emailAdmin || `admin@${slugFinal}.com`,
      senhaAdmin: dadosTenant.senhaAdmin || 'admin123'
    };

  } catch (erro) {
    console.error('❌ Erro ao criar tenant:', erro.message);
    console.error('Detalhes:', erro);
    throw erro;
  }
}

// Executar se chamado diretamente
// Check simplificado que funciona em Windows e Linux
const isMainModule = process.argv[1] && (
  process.argv[1].endsWith('criarNovoTenant.js') || 
  process.argv[1].includes('criarNovoTenant')
);

console.log('🔍 Debug: isMainModule =', isMainModule);
console.log('🔍 Debug: process.argv[1] =', process.argv[1]);

if (isMainModule) {
  console.log('✅ Script sendo executado diretamente');
  
  // Pegar argumentos da linha de comando
  const args = process.argv.slice(2);
  console.log('📋 Argumentos recebidos:', args);
  
  if (args.length === 0) {
    console.log(`
╔════════════════════════════════════════════════════════╗
║   🍔 CRIAR NOVO TENANT - FomeZap SaaS                 ║
╚════════════════════════════════════════════════════════╝

Uso: node criarNovoTenant.js "Nome da Lanchonete" [telefone] [email]

Exemplos:
  node criarNovoTenant.js "Burger King"
  node criarNovoTenant.js "Lanchonete do João" "(11) 99999-8888"
  node criarNovoTenant.js "FoodExpress" "(21) 98765-4321" "admin@foodexpress.com"

O sistema irá criar automaticamente:
  ✓ Tenant com ID único (MongoDB ObjectId)
  ✓ 3 categorias (Pratos, Bebidas, Sobremesas)
  ✓ 6 produtos de exemplo
  ✓ 4 extras (Bacon, Queijo, Ovo, Cebola)
  ✓ Usuário administrador

`);
    process.exit(0);
  }

  const dadosTenant = {
    nome: args[0],
    telefone: args[1] || '',
    emailAdmin: args[2] || undefined,
    senhaAdmin: 'admin123'
  };

  criarNovoTenant(dadosTenant, true)
    .then(() => process.exit(0))
    .catch((erro) => {
      console.error('Falha na criação:', erro);
      process.exit(1);
    });
}

export default criarNovoTenant;
