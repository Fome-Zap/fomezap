// Teste direto de conexão Mongoose
import 'dotenv/config';
import mongoose from 'mongoose';

const URI = process.env.MONGODB_URI;
console.log('🔗 Testando conexão direta com Mongoose...');
console.log('📍 URI:', URI.replace(/:([^:@]+)@/, ':****@'));

try {
  await mongoose.connect(URI);
  console.log('✅ Conexão bem-sucedida!');
  console.log('📊 Databases:', await mongoose.connection.db.admin().listDatabases());
  await mongoose.disconnect();
  console.log('👋 Desconectado');
  process.exit(0);
} catch (erro) {
  console.error('❌ Erro:', erro.message);
  process.exit(1);
}
