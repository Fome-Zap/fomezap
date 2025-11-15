// Script para limpar tenant "familia" antes de recriar
import 'dotenv/config';
import mongoose from './db/conn.js';
import { Tenant, Categoria, Produto, Extra } from './Models/TenantModels.js';
import User from './Models/User.js';

async function limparTenantFamilia() {
  try {
    console.log('🧹 Limpando tenant "familia"...');

    const tenant = await Tenant.findOne({ slug: 'familia' });
    if (!tenant) {
      console.log('⚠️  Tenant "familia" não existe');
      process.exit(0);
    }

    const tenantId = tenant.tenantId;
    console.log('🗑️  TenantId encontrado:', tenantId);

    // Remove dados relacionados
    await Produto.deleteMany({ tenantId });
    console.log('✅ Produtos removidos');

    await Extra.deleteMany({ tenantId });
    console.log('✅ Extras removidos');

    await Categoria.deleteMany({ tenantId });
    console.log('✅ Categorias removidas');

    await User.deleteMany({ tenantId });
    console.log('✅ Usuários removidos');

    await Tenant.deleteOne({ tenantId });
    console.log('✅ Tenant removido');

    console.log('\n✅ Limpeza concluída!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

mongoose.connection.once('open', limparTenantFamilia);
