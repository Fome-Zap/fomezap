import mongoose from './db/conn.js';
import User from './Models/User.js';

// Script para criar usuário manualmente
// USO: node criarUsuario.js

const criarUsuario = async () => {
  try {
    // Aguardar conexão com MongoDB
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('📦 Conectado ao MongoDB');

    // Dados do usuário (ALTERE AQUI)
    const dadosUsuario = {
      email: 'admin@demo.com',
      senha: '123456',
      nome: 'Administrador Demo',
      role: 'tenant_admin', // super_admin, tenant_admin ou employee
      tenantId: 'demo'
    };

    // Verificar se usuário já existe
    const usuarioExistente = await User.findOne({ email: dadosUsuario.email });
    if (usuarioExistente) {
      console.log('⚠️  Usuário já existe:', dadosUsuario.email);
      process.exit(0);
    }

    // Criar usuário
    const novoUsuario = new User(dadosUsuario);
    await novoUsuario.save();

    console.log('✅ Usuário criado com sucesso!');
    console.log('📧 Email:', dadosUsuario.email);
    console.log('🔑 Senha:', dadosUsuario.senha);
    console.log('👤 Nome:', dadosUsuario.nome);
    console.log('🎭 Role:', dadosUsuario.role);
    console.log('🏪 TenantId:', dadosUsuario.tenantId);
    console.log('\n🔐 Use estas credenciais para fazer login no painel admin');

    process.exit(0);

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
    process.exit(1);
  }
};

criarUsuario();
