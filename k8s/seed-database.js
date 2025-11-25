// Script para popular MongoDB no Kubernetes
// Executar dentro do pod do backend

import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://mongodb-service:27017/FomeZap';

const tenantData = {
  nome: 'FomeZap Demo',
  slug: 'demo',
  cnpj: '12.345.678/0001-90',
  telefone: '(11) 98765-4321',
  email: 'contato@fomezap.com.br',
  endereco: 'Rua Demo, 123 - São Paulo/SP',
  plano: 'premium',
  status: 'ativo',
  configuracoes: {
    corPrimaria: '#FF6B35',
    corSecundaria: '#004E89',
    logo: 'https://via.placeholder.com/150',
    taxaEntrega: 5.00,
    tempoMinimoEntrega: 30,
    tempoMaximoEntrega: 60,
    aceitaPix: true,
    aceitaCartao: true,
    aceitaDinheiro: true
  }
};

const adminData = {
  nome: 'Super Admin',
  email: 'tffjauds@gmail.com',
  senha: '$argon2id$v=19$m=65536,t=3,p=4$SrUNcFnwuGFdNSKuKwGoDQ$zz0vMAviw1rJHfhfgYeO1qDE7zyjulaXN5KBZ5TI6IY', // admin123
  role: 'superadmin',
  ativo: true
};

async function seed() {
  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado!');

    // Definir schemas
    const tenantSchema = new mongoose.Schema({
      nome: String,
      slug: { type: String, unique: true },
      cnpj: String,
      telefone: String,
      email: String,
      endereco: String,
      plano: String,
      status: String,
      configuracoes: Object,
      createdAt: { type: Date, default: Date.now }
    });

    const usuarioSchema = new mongoose.Schema({
      nome: String,
      email: { type: String, unique: true },
      senha: String,
      role: String,
      tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
      ativo: Boolean,
      createdAt: { type: Date, default: Date.now }
    });

    const Tenant = mongoose.model('Tenant', tenantSchema);
    const Usuario = mongoose.model('Usuario', usuarioSchema);

    // Limpar banco (opcional)
    console.log('Limpando banco...');
    await Tenant.deleteMany({});
    await Usuario.deleteMany({});

    // Criar tenant
    console.log('Criando tenant...');
    const tenant = await Tenant.create(tenantData);
    console.log('✅ Tenant criado:', tenant.slug);

    // Criar admin
    console.log('Criando usuário admin...');
    const admin = await Usuario.create({
      ...adminData,
      tenant: tenant._id
    });
    console.log('✅ Usuário criado:', admin.email);

    console.log('\n========================================');
    console.log('✅ BANCO POPULADO COM SUCESSO!');
    console.log('========================================');
    console.log('Tenant:', tenant.slug);
    console.log('Email:', admin.email);
    console.log('Senha: admin123');
    console.log('URL: http://localhost:30080');
    console.log('========================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

seed();
