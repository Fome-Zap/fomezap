// setupDemo.js - Script simplificado para criar dados via API
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000';

async function criarDadosDemo() {
  try {
    console.log('🚀 Criando dados de demonstração...');

    // Teste se API está online
    const healthCheck = await fetch(`${API_BASE}/health`);
    if (!healthCheck.ok) {
      throw new Error('Backend não está rodando. Execute: npm start');
    }
    console.log('✅ Backend online');

    // Teste detecção de tenant
    const tenantTest = await fetch(`${API_BASE}/detect-tenant?tenant=demo`);
    const tenantData = await tenantTest.json();
    console.log('🔍 Tenant detectado:', tenantData);

    console.log('\n📋 Para testar o sistema:');
    console.log('1. Abra: http://localhost:5173?tenant=demo');
    console.log('2. Ou acesse: http://localhost:5000/health para ver status da API');
    console.log('3. Para debug do tenant: http://localhost:5000/detect-tenant?tenant=demo');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solução:');
      console.log('1. Certifique-se que o backend está rodando: npm start');
      console.log('2. Verifique se a porta 5000 está livre');
    }
  }
}

criarDadosDemo();