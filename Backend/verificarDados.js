import mongoose from 'mongoose';
import User from './Models/User.js';
import { Tenant, Categoria, Produto } from './Models/TenantModels.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/FomeZap';

async function verificarDados() {
  try {
    console.log('🔌 Conectando ao MongoDB Atlas...');
    
    // Desconectar se já estiver conectado
    if (mongoose.connection.readyState !== 0) {
      console.log('⚠️  Desconectando conexão anterior...');
      await mongoose.disconnect();
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado!\n');

    // Verificar Tenant
    const tenants = await Tenant.find();
    console.log(`📊 Tenants: ${tenants.length}`);
    tenants.forEach(t => console.log(`   - ${t.tenantId}: ${t.nome}`));

    // Verificar Categorias
    const categorias = await Categoria.find();
    console.log(`\n📁 Categorias: ${categorias.length}`);
    categorias.forEach(c => console.log(`   - ${c.nome} (${c.tenantId})`));

    // Verificar Produtos
    const produtos = await Produto.find();
    console.log(`\n🍔 Produtos: ${produtos.length}`);
    produtos.forEach(p => console.log(`   - ${p.nome} - R$${p.preco}`));

    // Verificar Usuários
    const usuarios = await User.find();
    console.log(`\n👤 Usuários: ${usuarios.length}`);
    usuarios.forEach(u => {
      console.log(`   - ${u.email} (${u.role}) - Tenant: ${u.tenantId}`);
      console.log(`     Senha hash: ${u.senha.substring(0, 30)}...`);
      console.log(`     Ativo: ${u.ativo}`);
    });

    console.log('\n✅ Verificação completa!');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado');
  }
}

verificarDados();
