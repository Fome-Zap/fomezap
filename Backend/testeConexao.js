// Teste simples de conexão
console.log('1. Script iniciado');

import mongoose from './db/conn.js';

console.log('2. Import executado');
console.log('3. Estado da conexão:', mongoose.connection.readyState);

setTimeout(() => {
  console.log('4. Após 2 segundos - Estado:', mongoose.connection.readyState);
  process.exit(0);
}, 2000);
