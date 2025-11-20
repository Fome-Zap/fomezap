import mongoose from 'mongoose';
import argon2 from 'argon2';
import User from './Models/User.js';

// COLE AQUI SUA URI DO MONGODB ATLAS
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://usuario:senha@cluster.mongodb.net/fomezap?retryWrites=true&w=majority';

async function createSuperAdmin() {
  try {
    console.log('🔗 Conectando ao MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB!\n');

    // Verificar se já existe super admin
    const existente = await User.findOne({ role: 'super_admin' });
    if (existente) {
      console.log('⚠️  Super admin já existe:');
      console.log(`   Email: ${existente.email}`);
      console.log(`   Nome: ${existente.nome}\n`);
      console.log('Se esqueceu a senha, delete este usuário no MongoDB Atlas e execute novamente.\n');
      await mongoose.connection.close();
      return;
    }

    // Criar super admin
    console.log('👤 Criando super administrador...');
    
    const hashedPassword = await argon2.hash('Admin@2024!Strong');
    
    const superAdmin = new User({
      email: 'admin@fomezap.com',
      senha: hashedPassword,
      nome: 'Super Administrador',
      role: 'super_admin',
      tenantId: 'super_admin'
    });
    
    await superAdmin.save();
    
    console.log('\n✅ Super admin criado com sucesso!\n');
    console.log('📧 Email: admin@fomezap.com');
    console.log('🔑 Senha: Admin@2024!Strong');
    console.log('\n⚠️  IMPORTANTE: Após primeiro login, ALTERE A SENHA!');
    console.log('\n🌐 Acesse: https://seu-dominio.vercel.app/login\n');
    
    await mongoose.connection.close();
    console.log('✅ Conexão fechada.');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error('\n💡 Verifique:');
    console.error('   1. URI do MongoDB Atlas está correta');
    console.error('   2. Senha na URI está sem caracteres especiais (ou codificada)');
    console.error('   3. IP 0.0.0.0/0 está liberado no Network Access\n');
    process.exit(1);
  }
}

createSuperAdmin();
