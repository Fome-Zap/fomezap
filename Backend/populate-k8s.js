// Script para popular banco de dados no Kubernetes
// Executar: node populate-k8s.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Conectar no MongoDB do Kubernetes
const MONGODB_URI = 'mongodb://localhost:27017/FomeZap';

console.log('🔗 Conectando ao MongoDB via port-forward...');
console.log('📍 URI:', MONGODB_URI);
console.log('');
console.log('⚠️  IMPORTANTE: Execute antes:');
console.log('   kubectl port-forward service/mongodb-service 27017:27017');
console.log('');

// Modelos
const tenantSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  nome: { type: String, required: true },
  dominio: String,
  ativo: { type: Boolean, default: true },
  config: {
    tema: {
      corPrimaria: String,
      corSecundaria: String,
      logo: String
    },
    contato: {
      email: String,
      telefone: String,
      endereco: String
    }
  }
}, { timestamps: true });

const usuarioSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  nome: { type: String, required: true },
  email: { type: String, required: true },
  senha: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'admin', 'user'], default: 'user' },
  ativo: { type: Boolean, default: true }
}, { timestamps: true });

usuarioSchema.index({ tenantId: 1, email: 1 }, { unique: true });

const Tenant = mongoose.model('Tenant', tenantSchema);
const Usuario = mongoose.model('Usuario', usuarioSchema);

async function popular() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB!\n');

    // Limpar dados existentes
    console.log('🗑️  Limpando dados antigos...');
    await Usuario.deleteMany({});
    await Tenant.deleteMany({});
    console.log('✅ Banco limpo!\n');

    // Criar tenant FomeZap
    console.log('🏪 Criando tenant FomeZap...');
    const fomezapTenant = await Tenant.create({
      slug: 'fomezap',
      nome: 'FomeZap',
      dominio: 'localhost',
      ativo: true,
      config: {
        tema: {
          corPrimaria: '#EF4444',
          corSecundaria: '#F59E0B',
          logo: '/logo-fomezap.png'
        },
        contato: {
          email: 'contato@fomezap.com.br',
          telefone: '(11) 99999-9999',
          endereco: 'São Paulo, SP'
        }
      }
    });
    console.log('✅ Tenant FomeZap criado:', fomezapTenant._id);

    // Criar superadmin
    console.log('\n👤 Criando usuário superadmin...');
    const senhaHash = await bcrypt.hash('admin123', 10);
    const superadmin = await Usuario.create({
      tenantId: fomezapTenant._id,
      nome: 'Super Admin',
      email: 'tffjauds@gmail.com',
      senha: senhaHash,
      role: 'superadmin',
      ativo: true
    });
    console.log('✅ Superadmin criado:', superadmin.email);

    // Criar admin
    console.log('\n👤 Criando usuário admin...');
    const senhaHashAdmin = await bcrypt.hash('admin123', 10);
    const admin = await Usuario.create({
      tenantId: fomezapTenant._id,
      nome: 'Admin FomeZap',
      email: 'admin@fomezap.com',
      senha: senhaHashAdmin,
      role: 'admin',
      ativo: true
    });
    console.log('✅ Admin criado:', admin.email);

    // Criar tenant demo
    console.log('\n🏪 Criando tenant Demo...');
    const demoTenant = await Tenant.create({
      slug: 'demo',
      nome: 'Restaurante Demo',
      dominio: 'demo.localhost',
      ativo: true,
      config: {
        tema: {
          corPrimaria: '#3B82F6',
          corSecundaria: '#8B5CF6',
          logo: '/logo-demo.png'
        },
        contato: {
          email: 'contato@demo.com',
          telefone: '(11) 88888-8888',
          endereco: 'Demo City'
        }
      }
    });
    console.log('✅ Tenant Demo criado:', demoTenant._id);

    // Criar usuário demo
    console.log('\n👤 Criando usuário demo...');
    const senhaHashDemo = await bcrypt.hash('demo123', 10);
    const userDemo = await Usuario.create({
      tenantId: demoTenant._id,
      nome: 'Usuário Demo',
      email: 'demo@demo.com',
      senha: senhaHashDemo,
      role: 'admin',
      ativo: true
    });
    console.log('✅ Usuário demo criado:', userDemo.email);

    console.log('\n');
    console.log('════════════════════════════════════════');
    console.log('  ✅ BANCO POPULADO COM SUCESSO!');
    console.log('════════════════════════════════════════');
    console.log('');
    console.log('📋 CREDENCIAIS:');
    console.log('');
    console.log('🔐 Superadmin (Tenant: fomezap)');
    console.log('   Email: tffjauds@gmail.com');
    console.log('   Senha: admin123');
    console.log('');
    console.log('🔐 Admin (Tenant: fomezap)');
    console.log('   Email: admin@fomezap.com');
    console.log('   Senha: admin123');
    console.log('');
    console.log('🔐 Demo (Tenant: demo)');
    console.log('   Email: demo@demo.com');
    console.log('   Senha: demo123');
    console.log('');
    console.log('🌐 Acesse: http://localhost:30080');
    console.log('');

    await mongoose.connection.close();
    console.log('👋 Desconectado do MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error(error);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 SOLUÇÃO:');
      console.log('Execute em outro terminal:');
      console.log('  kubectl port-forward service/mongodb-service 27017:27017');
      console.log('');
      console.log('Depois execute este script novamente.');
    }
    
    process.exit(1);
  }
}

popular();
