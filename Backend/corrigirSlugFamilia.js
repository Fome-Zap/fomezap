// Script para corrigir slug do tenant "familia" de "lanchonete-em-familia" para "familia"
import 'dotenv/config';
import mongoose from './db/conn.js';
import { Tenant } from './Models/TenantModels.js';

async function corrigirSlugFamilia() {
  try {
    console.log('🔧 Corrigindo slug do tenant "familia"...');

    // Buscar tenant com tenantId "familia"
    const tenant = await Tenant.findOne({ tenantId: 'familia' });
    
    if (!tenant) {
      console.log('⚠️  Tenant "familia" não encontrado');
      process.exit(0);
    }

    console.log('📋 Tenant encontrado:');
    console.log('   Nome:', tenant.nome);
    console.log('   TenantId:', tenant.tenantId);
    console.log('   Slug atual:', tenant.slug);

    // Verificar se slug "familia" já existe em outro tenant
    const slugExistente = await Tenant.findOne({ slug: 'familia' });
    
    if (slugExistente && slugExistente.tenantId !== 'familia') {
      console.log('⚠️  ATENÇÃO: Slug "familia" já está sendo usado por outro tenant:');
      console.log('   TenantId:', slugExistente.tenantId);
      console.log('   Nome:', slugExistente.nome);
      console.log('\n❌ Não é possível corrigir. Escolha outro slug.');
      process.exit(1);
    }

    // Atualizar slug
    tenant.slug = 'familia';
    await tenant.save();

    console.log('\n✅ Slug corrigido com sucesso!');
    console.log('   Slug antigo: lanchonete-em-familia');
    console.log('   Slug novo: familia');
    console.log('\n🌐 Subdomínio de produção:');
    console.log('   https://familia.fomezap.com');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

mongoose.connection.once('open', () => {
  console.log('✅ Conectado ao MongoDB');
  corrigirSlugFamilia();
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Erro ao conectar no MongoDB:', err);
  process.exit(1);
});
