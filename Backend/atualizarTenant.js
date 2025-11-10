// Script para atualizar tenant demo com todas as configurações
import mongoose from 'mongoose';
import { Tenant } from './Models/TenantModels.js';

const MONGO_URI = 'mongodb://127.0.0.1:27017/FomeZap';

async function atualizarTenantDemo() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado ao MongoDB');

    const tenant = await Tenant.findOne({ tenantId: 'demo' });
    
    if (!tenant) {
      console.log('❌ Tenant "demo" não encontrado!');
      process.exit(1);
    }

    console.log('📝 Atualizando tenant:', tenant.nome);

    // Atualizar dados
    tenant.nome = 'FomeZap Demo';
    tenant.telefone = tenant.telefone || '(11) 99999-9999';
    tenant.endereco = tenant.endereco || 'Rua Demo, 123 - São Paulo, SP';
    tenant.fusoHorario = tenant.fusoHorario || 'America/Sao_Paulo';
    
    tenant.horarioFuncionamento = {
      abertura: tenant.horarioFuncionamento?.abertura || '18:00',
      fechamento: tenant.horarioFuncionamento?.fechamento || '23:30',
      diasSemana: tenant.horarioFuncionamento?.diasSemana || ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']
    };

    tenant.configuracoes = {
      aceitaDelivery: tenant.configuracoes?.aceitaDelivery !== false ? true : false,
      taxaEntrega: tenant.configuracoes?.taxaEntrega || 5.00,
      pedidoMinimo: tenant.configuracoes?.pedidoMinimo || 25.00,
      tempoEstimado: tenant.configuracoes?.tempoEstimado || '45-60 minutos',
      formasPagamento: tenant.configuracoes?.formasPagamento || ['dinheiro', 'pix', 'cartao']
    };

    tenant.tema = {
      corPrimaria: tenant.tema?.corPrimaria || '#FF6B35',
      corSecundaria: tenant.tema?.corSecundaria || '#F7931E',
      corBotao: tenant.tema?.corBotao || '#4ECDC4'
    };

    tenant.status = 'ativo';

    await tenant.save();
    
    console.log('✅ Tenant atualizado com sucesso!');
    console.log('📋 Configurações:', JSON.stringify({
      nome: tenant.nome,
      telefone: tenant.telefone,
      endereco: tenant.endereco,
      horario: tenant.horarioFuncionamento,
      configuracoes: tenant.configuracoes
    }, null, 2));

  } catch (erro) {
    console.error('❌ Erro:', erro.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

atualizarTenantDemo();
