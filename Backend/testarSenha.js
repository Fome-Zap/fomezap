// Script para testar verificação de senha
import 'dotenv/config';
import mongoose from './db/conn.js';
import User from './Models/User.js';
import argon2 from 'argon2';

async function testar() {
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
    
    console.log('✅ Conectado ao MongoDB\n');
    
    // Buscar usuário
    const usuario = await User.findOne({ email: 'admin@lanchonete-central.com' });
    
    if (!usuario) {
      console.log('❌ Usuário não encontrado');
      process.exit(1);
    }
    
    console.log('👤 Usuário encontrado:');
    console.log('   Email:', usuario.email);
    console.log('   Nome:', usuario.nome);
    console.log('   TenantId:', usuario.tenantId);
    console.log('   Senha (hash):', usuario.senha.substring(0, 50) + '...');
    console.log('');
    
    // Testar senha
    const senhasTeste = ['admin123', 'Admin123', 'ADMIN123', '123456'];
    
    for (const senha of senhasTeste) {
      console.log(`🔐 Testando senha: "${senha}"`);
      const resultado = await usuario.compararSenha(senha);
      console.log(`   Resultado: ${resultado ? '✅ CORRETA' : '❌ INCORRETA'}`);
    }
    
    // Testar hash manual
    console.log('\n🔬 Testando hash manual de "admin123":');
    const hashManual = await argon2.hash('admin123');
    console.log('   Hash gerado:', hashManual.substring(0, 50) + '...');
    const verificaManual = await argon2.verify(hashManual, 'admin123');
    console.log('   Verificação:', verificaManual ? '✅ OK' : '❌ FALHA');
    
    // Testar hash do banco
    console.log('\n🔬 Testando hash do banco com "admin123":');
    const verificaBanco = await argon2.verify(usuario.senha, 'admin123');
    console.log('   Verificação:', verificaBanco ? '✅ OK' : '❌ FALHA');
    
    process.exit(0);
  } catch (erro) {
    console.error('❌ Erro:', erro.message);
    console.error(erro);
    process.exit(1);
  }
}

testar();
