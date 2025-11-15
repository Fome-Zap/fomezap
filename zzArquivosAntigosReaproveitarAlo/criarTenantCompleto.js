import readline from 'readline';
import mongoose from '../Backend/db/conn.js';
import { Tenant, Categoria, Produto, Extra } from '../Backend/Models/TenantModels.js';
import User from '../Backend/Models/User.js';
import { getNextSequence } from './db/sequence.js';

// Interface para perguntas no terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função helper para fazer perguntas
const pergunta = (texto) => {
  return new Promise((resolve) => {
    rl.question(texto, resolve);
  });
};

// Esperar conexão do MongoDB (feita automaticamente pelo conn.js)
const aguardarConexao = async () => {
  return new Promise((resolve) => {
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Conectado ao MongoDB');
      resolve();
    } else {
      mongoose.connection.once('open', () => {
        console.log('✅ Conectado ao MongoDB');
        resolve();
      });
    }
  });
};

// Função para gerar slug a partir do nome
const gerarSlug = (texto) => {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífen
    .replace(/--+/g, '-') // Remove hífens duplos
    .trim();
};

// Função principal
const criarTenantCompleto = async () => {
  console.log('\n🎯 === CRIAR NOVO RESTAURANTE (TENANT) ===\n');

  try {
    // 1. Coletar informações
    const nome = await pergunta('📝 Nome do restaurante: ');
    if (!nome.trim()) {
      console.log('❌ Nome não pode ser vazio!');
      process.exit(1);
    }

    // Gerar tenantId automaticamente a partir do nome e garantir unicidade
    const baseTenantId = gerarSlug(nome);
    let tenantId = baseTenantId;
    let sufixo = 0;
    while (await Tenant.findOne({ tenantId })) {
      sufixo += 1;
      tenantId = `${baseTenantId}${sufixo}`;
    }
    console.log(`🌐 ID do tenant gerado automaticamente: ${tenantId}`);

    const email = await pergunta('📧 Email do administrador: ');
    if (!email.trim() || !email.includes('@')) {
      console.log('❌ Email inválido!');
      process.exit(1);
    }

    // Verificar se email já existe
    const emailExiste = await User.findOne({ email: email.toLowerCase() });
    if (emailExiste) {
      console.log(`❌ Email "${email}" já está cadastrado!`);
      process.exit(1);
    }

    const senha = await pergunta('🔑 Senha (mínimo 6 caracteres): ');
    if (senha.length < 6) {
      console.log('❌ Senha deve ter no mínimo 6 caracteres!');
      process.exit(1);
    }

    const telefone = await pergunta('📱 Telefone (opcional): ') || '';
    const endereco = await pergunta('� Endereço (opcional): ') || '';

    const plano = await pergunta('�💎 Plano (free/basic/premium) [free]: ') || 'free';
    const planoValido = ['free', 'basic', 'premium'].includes(plano.toLowerCase());
    if (!planoValido) {
      console.log('❌ Plano inválido! Use: free, basic ou premium');
      process.exit(1);
    }

    console.log('\n⏳ Criando tenant...\n');

    // 2. Criar Tenant - obter publicId incremental (via helper)
    let nextPublicId;
    try {
      nextPublicId = await getNextSequence('tenantId');
      if (typeof nextPublicId === 'undefined' || nextPublicId === null) {
        throw new Error('getNextSequence retornou valor inválido');
      }
    } catch (e) {
      console.error('❌ Falha ao obter publicId sequencial:', e.message || e);
      throw e;
    }
    const tenant = await Tenant.create({
      tenantId,
      publicId: nextPublicId,
      nome: nome.trim(),
      slug: gerarSlug(nome),
      telefone,
      endereco,
      proprietario: {
        nome: nome.trim(),
        email: email.toLowerCase().trim(),
        telefone
      },
      status: 'ativo',
      plano: {
        tipo: plano.toLowerCase(),
        limiteProdutos: plano === 'free' ? 20 : plano === 'basic' ? 50 : 999,
        limitePedidosMes: plano === 'free' ? 50 : plano === 'basic' ? 200 : 9999
      }
    });
    console.log('✅ Tenant criado:', tenant.nome, `(publicId: ${tenant.publicId})`);

    // 3. Criar Usuário Admin
    const admin = await User.create({
      tenantId: tenant.tenantId,
      nome: nome.trim(),
      email: email.toLowerCase().trim(),
      senha, // O modelo vai fazer hash automaticamente
      role: 'tenant_admin',
      ativo: true
    });
    console.log('✅ Administrador criado:', admin.email);

    // 4. Criar cardápio de exemplo (3 categorias, 6 pratos, 3 bebidas, 3 sobremesas)
    console.log('\n⏳ Criando cardápio de exemplo...');

    const categoriasData = [
      { nome: 'Pratos', icone: '🍽️', ordem: 0 },
      { nome: 'Bebidas', icone: '🥤', ordem: 1 },
      { nome: 'Sobremesas', icone: '🍰', ordem: 2 }
    ];

    const categoriasCriadas = await Promise.all(
      categoriasData.map(c => Categoria.create({ ...c, tenantId: tenant.tenantId }))
    );

    const categoriaMap = {};
    categoriasCriadas.forEach(c => { categoriaMap[c.nome] = c._id; });

    const produtosData = [
      // 6 pratos
      { nome: 'Frango Grelhado', descricao: 'Frango temperado grelhado', preco: 28.0, categoria: 'Pratos', emoji: '🍗' },
      { nome: 'Bife Acebolado', descricao: 'Bife com cebolas caramelizadas', preco: 32.0, categoria: 'Pratos', emoji: '🥩' },
      { nome: 'Lasanha Bolonhesa', descricao: 'Lasanha caseira com molho bolonhesa', preco: 30.0, categoria: 'Pratos', emoji: '🍝' },
      { nome: 'Feijoada Simples', descricao: 'Feijoada com arroz e couve', preco: 25.0, categoria: 'Pratos', emoji: '🥘' },
      { nome: 'Risoto de Camarão', descricao: 'Risoto cremoso com camarões', preco: 38.0, categoria: 'Pratos', emoji: '🍤' },
      { nome: 'Macarrão Alho e Óleo', descricao: 'Macarrão simples e saboroso', preco: 20.0, categoria: 'Pratos', emoji: '🍜' },
      // 3 bebidas
      { nome: 'Suco de Laranja', descricao: 'Suco natural gelado', preco: 7.0, categoria: 'Bebidas', emoji: '🍊' },
      { nome: 'Coca-Cola 350ml', descricao: 'Refrigerante tradicional', preco: 6.0, categoria: 'Bebidas', emoji: '🥤' },
      { nome: 'Água Mineral', descricao: 'Água sem gás', preco: 3.5, categoria: 'Bebidas', emoji: '💧' },
      // 3 sobremesas
      { nome: 'Pudim', descricao: 'Pudim de leite condensado', preco: 10.0, categoria: 'Sobremesas', emoji: '🍮' },
      { nome: 'Brownie com Sorvete', descricao: 'Brownie quente com sorvete', preco: 14.0, category: 'Sobremesas', emoji: '🍫' },
      { nome: 'Açaí Bowl', descricao: 'Açaí com granola e frutas', preco: 18.0, categoria: 'Sobremesas', emoji: '🥣' }
    ];

    const produtosCriados = [];
    for (const p of produtosData) {
      const catId = categoriaMap[p.categoria || p.category];
      if (!catId) continue;
      const criado = await Produto.create({
        tenantId: tenant.tenantId,
        codigo: '',
        nome: p.nome,
        descricao: p.descricao,
        preco: p.preco,
        categoria: catId,
        emoji: p.emoji || '',
        imagem: '',
        disponivel: true,
        destaque: false,
        extras: [],
        tags: []
      });
      produtosCriados.push(criado);
    }

    console.log('✅ Cardápio de exemplo criado:', categoriasCriadas.length, 'categorias,', produtosCriados.length, 'produtos');

    // 5. Resumo
    console.log('\n✨ === TENANT CRIADO COM SUCESSO! ===\n');
    console.log('📋 INFORMAÇÕES DO RESTAURANTE:');
    console.log(`   Nome: ${tenant.nome}`);
    console.log(`   Tenant ID: ${tenant.tenantId}`);
    console.log(`   Slug: ${tenant.slug}`);
    console.log(`   Plano: ${tenant.plano.tipo}`);
    console.log(`   Status: ${tenant.status === 'ativo' ? 'Ativo ✅' : 'Inativo ❌'}`);
    console.log(`   Limites: ${tenant.plano.limiteProdutos} produtos / ${tenant.plano.limitePedidosMes} pedidos/mês`);
    console.log('\n👤 CREDENCIAIS DO ADMINISTRADOR:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Senha: ${senha}`);
    console.log(`   Role: ${admin.role}`);
    console.log('\n🌐 ACESSO:');
    console.log(`   Produção: https://fomezap.vercel.app`);
    console.log(`   Local: http://localhost:5173`);
    console.log('\n📧 INSTRUÇÕES PARA O CLIENTE:');
    console.log('   1. Acesse o sistema usando as credenciais acima');
    console.log('   2. Vá para o painel Admin (/admin)');
    console.log('   3. Configure o cardápio em Produtos e Categorias');
    console.log('   4. Ajuste as configurações do restaurante');
    console.log('   5. Troque a senha no primeiro acesso (recomendado)');
    console.log('\n');

  } catch (erro) {
    console.error('\n❌ ERRO:', erro.message);
    if (erro.code === 11000) {
      console.log('💡 Dica: Email ou Tenant ID já existe no banco!');
    }
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log('👋 Conexão encerrada.\n');
    process.exit(0);
  }
};

// Executar
aguardarConexao().then(criarTenantCompleto);
