// Script para verificar usuários no banco
import 'dotenv/config';
import mongoose from './db/conn.js';
import User from './Models/User.js';

async function verificar() {
  try {
    // Aguardar conexão
    let tentativas = 0;
    while (mongoose.connection.readyState !== 1 && tentativas < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      tentativas++;
    }
    
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Não foi possível conectar ao MongoDB');
    }
    
    console.log('✅ Conectado ao MongoDB');
    console.log('📊 Banco atual:', mongoose.connection.name);
    
    // Listar todos os usuários
    const usuarios = await User.find({});
    
    console.log(`\n👥 Total de usuários: ${usuarios.length}\n`);
    
    usuarios.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Nome: ${user.nome}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   TenantId: ${user.tenantId || 'N/A'}`);
      console.log(`   Ativo: ${user.ativo}`);
      console.log('---');
    });
    
    // Buscar usuário específico
    const lanchoneteCentral = await User.findOne({ email: 'admin@lanchonete-central.com' });
    
    if (lanchoneteCentral) {
      console.log('\n✅ Usuário Lanchonete Central encontrado!');
      console.log('TenantId:', lanchoneteCentral.tenantId);
    } else {
      console.log('\n❌ Usuário Lanchonete Central NÃO encontrado');
    }
    
    const demo = await User.findOne({ email: 'admin@demo.com' });
    
    if (demo) {
      console.log('\n✅ Usuário Demo encontrado!');
      console.log('TenantId:', demo.tenantId);
    } else {
      console.log('\n❌ Usuário Demo NÃO encontrado');
    }
    
    process.exit(0);
  } catch (erro) {
    console.error('❌ Erro:', erro.message);
    process.exit(1);
  }
}

verificar();
