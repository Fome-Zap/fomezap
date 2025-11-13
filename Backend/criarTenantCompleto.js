import readline from 'readline';
import mongoose from 'mongoose';
import { Tenant } from './Models/TenantModels.js';
import User from './Models/User.js';

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

    const tenantId = await pergunta(`🌐 ID do tenant (ex: ${gerarSlug(nome)}): `) || gerarSlug(nome);
    if (!tenantId.trim() || !/^[a-z0-9-]+$/.test(tenantId)) {
      console.log('❌ ID inválido! Use apenas letras minúsculas, números e hífen.');
      process.exit(1);
    }

    // Verificar se tenantId já existe
    const tenantExiste = await Tenant.findOne({ tenantId });
    if (tenantExiste) {
      console.log(`❌ ID "${tenantId}" já está em uso!`);
      process.exit(1);
    }

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

    // 2. Criar Tenant
    const tenant = await Tenant.create({
      tenantId,
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
    console.log('✅ Tenant criado:', tenant.nome);

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

    // 4. Resumo
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
