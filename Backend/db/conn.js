import 'dotenv/config';
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/FomeZap";

console.log('🔗 Conectando ao MongoDB...');
console.log('📍 URI:', MONGODB_URI.replace(/:([^:@]+)@/, ':****@')); // Oculta senha no log

async function main(){
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Conectou ao MongoDB!");
}
main().catch((err)=>{
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
    console.log(err);
});

export default mongoose;