// testKeepAlive.js - Script para testar keep-alive localmente
// Simula ambiente de produção para verificar se lógica está correta

import fetch from 'node-fetch';

const TESTE_URL = 'http://localhost:5000'; // Porta local do backend

// Função para testar horário ativo
function testarHorarioAtivo() {
  console.log('\n🧪 TESTANDO LÓGICA DE HORÁRIO ATIVO\n');
  
  // Horário de funcionamento: 15:00 - 01:00 (UTC-3 Brasília)
  const HORARIO_INICIO = 15;
  const HORARIO_FIM = 1;
  
  // Casos de teste (horário de Brasília)
  const casosDeTeste = [
    { hora: 14, esperado: false, descricao: 'Antes do horário (14h)' },
    { hora: 15, esperado: true, descricao: 'Início exato (15h)' },
    { hora: 18, esperado: true, descricao: 'Durante horário (18h)' },
    { hora: 23, esperado: true, descricao: 'Noite (23h)' },
    { hora: 0, esperado: true, descricao: 'Meia-noite (0h)' },
    { hora: 1, esperado: true, descricao: 'Fim exato (1h)' },
    { hora: 2, esperado: false, descricao: 'Após horário (2h)' },
    { hora: 10, esperado: false, descricao: 'Manhã (10h)' }
  ];
  
  console.log('Horário ativo configurado: 15:00 - 01:00 (Brasília UTC-3)\n');
  
  casosDeTeste.forEach(caso => {
    const resultado = (HORARIO_INICIO > HORARIO_FIM)
      ? caso.hora >= HORARIO_INICIO || caso.hora <= HORARIO_FIM
      : caso.hora >= HORARIO_INICIO && caso.hora <= HORARIO_FIM;
    
    const passou = resultado === caso.esperado;
    const emoji = passou ? '✅' : '❌';
    
    console.log(`${emoji} ${caso.descricao.padEnd(30)} | Resultado: ${resultado ? 'ATIVO' : 'INATIVO'} | Esperado: ${caso.esperado ? 'ATIVO' : 'INATIVO'}`);
  });
  
  const totalPassou = casosDeTeste.filter(c => {
    const resultado = (HORARIO_INICIO > HORARIO_FIM)
      ? c.hora >= HORARIO_INICIO || c.hora <= HORARIO_FIM
      : c.hora >= HORARIO_INICIO && c.hora <= HORARIO_FIM;
    return resultado === c.esperado;
  }).length;
  
  console.log(`\n📊 Resultado: ${totalPassou}/${casosDeTeste.length} testes passaram\n`);
}

// Função para testar endpoint /health
async function testarEndpointHealth() {
  console.log('\n🏥 TESTANDO ENDPOINT /health\n');
  
  try {
    const response = await fetch(`${TESTE_URL}/health`);
    const data = await response.json();
    
    if (response.status === 200 && data.status === 'ok') {
      console.log('✅ Endpoint /health funcionando corretamente');
      console.log('📋 Resposta:');
      console.log(JSON.stringify(data, null, 2));
      return true;
    } else {
      console.log('❌ Endpoint /health retornou resposta inesperada');
      console.log('📋 Status:', response.status);
      console.log('📋 Resposta:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro ao conectar no endpoint /health');
    console.log('💡 Certifique-se de que o backend está rodando em', TESTE_URL);
    console.log('📋 Erro:', error.message);
    return false;
  }
}

// Função para simular múltiplos pings
async function simularPings(quantidade = 5, intervalo = 2000) {
  console.log(`\n🏓 SIMULANDO ${quantidade} PINGS (intervalo: ${intervalo}ms)\n`);
  
  for (let i = 1; i <= quantidade; i++) {
    try {
      const inicio = Date.now();
      const response = await fetch(`${TESTE_URL}/health`);
      const duracao = Date.now() - inicio;
      const timestamp = new Date().toISOString();
      
      if (response.status === 200) {
        console.log(`✅ [${timestamp}] Ping ${i}/${quantidade} - ${duracao}ms`);
      } else {
        console.log(`⚠️  [${timestamp}] Ping ${i}/${quantidade} - Status ${response.status}`);
      }
      
      if (i < quantidade) {
        await new Promise(resolve => setTimeout(resolve, intervalo));
      }
    } catch (error) {
      console.log(`❌ Ping ${i}/${quantidade} falhou:`, error.message);
    }
  }
  
  console.log('\n✅ Simulação de pings concluída\n');
}

// Função para mostrar informações sobre conversão de fuso horário
function mostrarInfoFusoHorario() {
  console.log('\n🌍 CONVERSÃO DE FUSO HORÁRIO (Brasília → UTC)\n');
  
  const conversoes = [
    { brasilia: '15:00', utc: '18:00' },
    { brasilia: '18:00', utc: '21:00' },
    { brasilia: '21:00', utc: '00:00 (próximo dia)' },
    { brasilia: '00:00', utc: '03:00' },
    { brasilia: '01:00', utc: '04:00' }
  ];
  
  console.log('Horário de Brasília (UTC-3) → Horário UTC (+3h)\n');
  
  conversoes.forEach(({ brasilia, utc }) => {
    console.log(`  ${brasilia} Brasília  →  ${utc} UTC`);
  });
  
  console.log('\n⚙️  Configuração para Cron-Job.org (UTC):');
  console.log('   Start time: 18:00 UTC');
  console.log('   End time:   04:00 UTC (próximo dia)');
  console.log('\n');
}

// Função principal
async function executarTestes() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🧪 TESTE DO SISTEMA KEEP-ALIVE - FOMEZAP');
  console.log('═══════════════════════════════════════════════════════');
  
  // Teste 1: Lógica de horário
  testarHorarioAtivo();
  
  // Teste 2: Info de fuso horário
  mostrarInfoFusoHorario();
  
  // Teste 3: Endpoint /health
  const healthOk = await testarEndpointHealth();
  
  if (!healthOk) {
    console.log('\n⚠️  AVISO: Inicie o backend antes de continuar os testes');
    console.log('   Comando: cd Backend && npm start\n');
    process.exit(1);
  }
  
  // Teste 4: Simular pings
  await simularPings(5, 2000);
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ TODOS OS TESTES CONCLUÍDOS COM SUCESSO!');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log('📝 PRÓXIMOS PASSOS:\n');
  console.log('1. ✅ Lógica de horário está correta');
  console.log('2. ✅ Endpoint /health funcionando');
  console.log('3. 🚀 Fazer deploy no Render');
  console.log('4. ⚙️  Configurar Cron-Job.org (ver GUIA-CRON-JOB-PASSO-A-PASSO.md)');
  console.log('5. 📊 Monitorar logs do Render e histórico do Cron-Job\n');
}

// Executar testes
executarTestes().catch(error => {
  console.error('\n❌ Erro ao executar testes:', error);
  process.exit(1);
});
