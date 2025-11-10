// Script para criar tenant demo
import mongoose from 'mongoose';
import { Tenant } from './Models/TenantModels.js';

const MONGO_URI = 'mongodb://127.0.0.1:27017/FomeZap';

async function criarTenantDemo() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado ao MongoDB');

    // Verificar se já existe
    const existente = await Tenant.findOne({ tenantId: 'demo' });
    
    if (existente) {
      console.log('⚠️  Tenant "demo" já existe:', existente.nome);
      process.exit(0);
    }

    // Criar tenant demo
    const tenant = new Tenant({
      tenantId: 'demo',
      nome: 'FomeZap Demo',
      slug: 'demo',
      telefone: '(11) 99999-9999',
      endereco: 'Rua Demo, 123 - São Paulo, SP',
      fusoHorario: 'America/Sao_Paulo',
      horarioFuncionamento: {
        abertura: '18:00',
        fechamento: '23:30',
        diasSemana: ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']
      },
      configuracoes: {
        aceitaDelivery: true,
        taxaEntrega: 5.00,
        pedidoMinimo: 25.00,
        tempoEstimado: '45-60 minutos',
        formasPagamento: ['dinheiro', 'pix', 'cartao']
      },
      tema: {
        corPrimaria: '#FF6B35',
        corSecundaria: '#F7931E',
        corBotao: '#4ECDC4'
      },
      status: 'ativo'
    });

    await tenant.save();
    console.log('✅ Tenant "demo" criado com sucesso!');
    console.log('📋 Dados:', {
      tenantId: tenant.tenantId,
      nome: tenant.nome,
      telefone: tenant.telefone
    });

  } catch (erro) {
    console.error('❌ Erro:', erro.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

criarTenantDemo();
