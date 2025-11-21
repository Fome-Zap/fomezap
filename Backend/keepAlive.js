// keepAlive.js - Self-ping para manter servidor ativo no Render
// Funciona apenas em PRODUÇÃO (Render) - não executa em LOCAL

import fetch from 'node-fetch';

const RENDER_URL = process.env.RENDER_EXTERNAL_URL || process.env.RENDER_URL;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Horário de funcionamento: 15:00 - 01:00 (horário de Brasília UTC-3)
const HORARIO_INICIO = 15; // 15:00
const HORARIO_FIM = 1;     // 01:00 (madrugada)

// Função para verificar se está no horário ativo
function estaNoHorarioAtivo() {
  const agora = new Date();
  
  // Converter para horário de Brasília (UTC-3)
  const horaAtualUTC = agora.getUTCHours();
  const horaBrasilia = (horaAtualUTC - 3 + 24) % 24;
  
  // Lógica: 15h até 01h (passa pela meia-noite)
  // 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1
  if (HORARIO_INICIO > HORARIO_FIM) {
    // Horário atravessa meia-noite
    return horaBrasilia >= HORARIO_INICIO || horaBrasilia <= HORARIO_FIM;
  } else {
    // Horário no mesmo dia
    return horaBrasilia >= HORARIO_INICIO && horaBrasilia <= HORARIO_FIM;
  }
}

// Função de self-ping
async function keepServerAlive() {
  // Só executar em produção (Render)
  if (NODE_ENV !== 'production' || !RENDER_URL) {
    console.log('⏸️  Keep-alive desabilitado (não está em produção/Render)');
    return;
  }

  console.log('🏓 Keep-Alive iniciado para:', RENDER_URL);
  console.log(`⏰ Horário ativo: ${HORARIO_INICIO}:00 - ${HORARIO_FIM}:00 (Brasília UTC-3)`);
  
  // Ping a cada 10 minutos (Render dorme após 15min de inatividade)
  setInterval(async () => {
    // Verificar se está no horário ativo
    if (!estaNoHorarioAtivo()) {
      const agora = new Date();
      const horaAtualUTC = agora.getUTCHours();
      const horaBrasilia = (horaAtualUTC - 3 + 24) % 24;
      console.log(`😴 Fora do horário ativo (atual: ${horaBrasilia}:00h) - servidor pode dormir`);
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      const response = await fetch(`${RENDER_URL}/health`);
      const data = await response.json();
      
      console.log(`✅ [${timestamp}] Self-ping bem-sucedido:`, data.status);
    } catch (error) {
      const timestamp = new Date().toISOString();
      console.error(`❌ [${timestamp}] Erro no self-ping:`, error.message);
    }
  }, 10 * 60 * 1000); // 10 minutos em milissegundos
}

export default keepServerAlive;
