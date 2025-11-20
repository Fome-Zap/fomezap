# 🔀 Guia: Alternando entre Local e Produção

## ⚠️ IMPORTANTE: Entenda ANTES de executar qualquer script!

Quando você executa scripts ou inicia o backend, ele **SEMPRE usa a URI que está ATIVA no `.env`**.

---

## 📋 Regras de Ouro

### ✅ DESENVOLVIMENTO (99% do tempo)
```env
# Backend/.env
MONGODB_URI=mongodb://127.0.0.1:27017/FomeZap
```
**Use para:**
- Desenvolvimento local
- Testes de funcionalidades
- Criar tenants de teste
- Testar recuperação de senha
- Adicionar produtos fictícios

### ☁️ PRODUÇÃO (apenas quando necessário)
```env
# Backend/.env
MONGODB_URI=mongodb+srv://tffjauds_db_user:senha@fomezap-prod.wwj0swg.mongodb.net/fomezap?retryWrites=true&w=majority&appName=fomezap-prod
```
**Use SOMENTE para:**
- Criar SuperAdmin inicial (UMA VEZ)
- Debug urgente em produção
- Verificar dados reais

---

## 🛠️ Como Alternar

### Método 1: Comentar/Descomentar (Recomendado)

```env
# ===================================
# ESCOLHA APENAS UMA URI ATIVA!
# ===================================

# 🏠 LOCAL (usar para desenvolvimento):
MONGODB_URI=mongodb://127.0.0.1:27017/FomeZap

# ☁️ PRODUÇÃO (comentar quando não usar):
# MONGODB_URI=mongodb+srv://tffjauds_db_user:senha@...
```

### Método 2: Variáveis Separadas (Profissional)

Crie: `Backend/.env.local` e `Backend/.env.production`

```bash
# .env.local
MONGODB_URI=mongodb://127.0.0.1:27017/FomeZap
JWT_SECRET=local-secret
NODE_ENV=development

# .env.production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=production-secret
NODE_ENV=production
```

**Uso:**
```bash
# Local
cp .env.local .env
npm start

# Produção
cp .env.production .env
node scripts/criarSuperAdmin.js
```

---

## 🚨 CHECKLIST ANTES DE EXECUTAR SCRIPTS

### ❓ Pergunte-se:

1. **O que vou fazer?**
   - Criar tenant de teste? → **Use LOCAL**
   - Criar SuperAdmin em produção? → **Use PRODUÇÃO**
   - Testar recuperação de senha? → **Use LOCAL**

2. **Qual .env está ativo?**
   ```bash
   # Verificar URI atual:
   cat Backend/.env | grep MONGODB_URI | grep -v "^#"
   ```

3. **Estou conectando onde?**
   - `127.0.0.1` ou `localhost` → LOCAL ✅
   - `mongodb+srv` ou `fomezap-prod` → PRODUÇÃO ⚠️

---

## 📝 Exemplos Práticos

### Exemplo 1: Criar SuperAdmin em PRODUÇÃO (primeira vez)

```bash
# 1. Editar .env para usar produção
# Backend/.env:
MONGODB_URI=mongodb+srv://tffjauds_db_user:senha@fomezap-prod...

# 2. Executar script
cd Backend
node scripts/criarSuperAdmin.js

# 3. IMEDIATAMENTE voltar para local:
# Backend/.env:
MONGODB_URI=mongodb://127.0.0.1:27017/FomeZap

# 4. Verificar:
cat .env | grep MONGODB_URI
```

### Exemplo 2: Criar Tenant de Teste (local)

```bash
# 1. Garantir que está em local
# Backend/.env:
MONGODB_URI=mongodb://127.0.0.1:27017/FomeZap

# 2. Iniciar backend
cd Backend
npm start

# 3. Frontend (outro terminal)
cd Frontend
npm run dev

# 4. Criar tenant via interface SuperAdmin
# http://localhost:5173
```

### Exemplo 3: Verificar Dados em Produção (MongoDB Compass)

```bash
# NÃO precisa alterar .env!
# Use MongoDB Compass:

1. New Connection
2. URI: mongodb+srv://tffjauds_db_user:senha@fomezap-prod...
3. Connect
4. Database: fomezap
5. Collections: superadmins, tenants, admins, etc.
```

---

## 🎯 Scripts Úteis

### Verificar qual MongoDB está ativo

Crie: `Backend/scripts/checkMongoDB.js`

```javascript
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;

console.log('\n🔍 MONGODB ATUAL:');
console.log('═══════════════════════════════════════');

if (uri.includes('127.0.0.1') || uri.includes('localhost')) {
  console.log('✅ LOCAL - Desenvolvimento');
  console.log(`   ${uri}`);
} else if (uri.includes('mongodb+srv')) {
  console.log('⚠️  PRODUÇÃO - MongoDB Atlas');
  console.log(`   ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
} else {
  console.log('❓ DESCONHECIDO');
  console.log(`   ${uri}`);
}

console.log('═══════════════════════════════════════\n');
```

**Uso:**
```bash
cd Backend
node scripts/checkMongoDB.js
```

---

## ⚠️ ERROS COMUNS

### Erro: "SuperAdmin já existe"

**Causa:** Tentou criar SuperAdmin novamente

**Solução:**
```bash
# Se foi criado em produção por engano:
1. MongoDB Compass → Conectar produção
2. Database: fomezap
3. Collection: superadmins
4. Deletar documento
5. Executar script novamente
```

### Erro: "Connection refused"

**Causa:** MongoDB local não está rodando

**Solução:**
```bash
# Windows:
1. Services → MongoDB → Start

# Ou via Docker (se configurado):
docker-compose up -d mongodb
```

### Erro: Script cria dados em produção sem querer

**Causa:** .env aponta para produção

**Solução:**
```bash
# 1. PARE o script imediatamente (Ctrl+C)
# 2. Verificar .env:
cat Backend/.env | grep MONGODB_URI

# 3. Corrigir para local:
MONGODB_URI=mongodb://127.0.0.1:27017/FomeZap

# 4. Deletar dados criados por engano:
# - Via MongoDB Compass
# - Ou via script de cleanup
```

---

## 🔐 Segurança

### ✅ NUNCA commitar senhas reais

```bash
# .gitignore JÁ INCLUI:
.env
.env.local
.env.production
Backend/.env

# Verificar:
git status
# → .env não deve aparecer!
```

### ✅ Use senhas diferentes

```env
# Local (pode ser simples)
JWT_SECRET=local-secret-123

# Produção (DEVE ser forte)
JWT_SECRET=kyRCP1tRDLtmOJ9u9e9TKJovEUQhxNjNatGi7nLoadI
```

---

## 📊 Resumo Visual

```
┌─────────────────────────────────────────────────┐
│ QUANDO USAR LOCAL vs PRODUÇÃO                   │
├─────────────────────────────────────────────────┤
│                                                 │
│ 🏠 LOCAL (127.0.0.1):                           │
│   ✅ Desenvolvimento diário                     │
│   ✅ Testes de funcionalidades                  │
│   ✅ Criar tenants de exemplo                   │
│   ✅ Testar recuperação de senha                │
│   ✅ Adicionar produtos fictícios               │
│   ✅ Debug de código                            │
│                                                 │
│ ☁️ PRODUÇÃO (MongoDB Atlas):                    │
│   ⚠️  Criar SuperAdmin (1ª vez)                 │
│   ⚠️  Debug urgente de dados reais              │
│   ⚠️  Verificar estado atual                    │
│   ❌ NUNCA para testes!                         │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Resposta à Sua Dúvida

> "É pra quando rodar o script ele já vai pro banco da produção online?"

**SIM**, se a URI no `.env` for a do MongoDB Atlas.

> "Posso deixar essa linha ou comentar quando não quiser enviar testes?"

**COMENTE** a URI de produção e deixe apenas a local ativa:

```env
# ✅ CORRETO para desenvolvimento:
MONGODB_URI=mongodb://127.0.0.1:27017/FomeZap
# MONGODB_URI=mongodb+srv://...produção...

# ❌ ERRADO (ambas ativas):
MONGODB_URI=mongodb://127.0.0.1:27017/FomeZap
MONGODB_URI=mongodb+srv://...produção...
# → Node.js usará a ÚLTIMA!
```

---

## 🚀 Workflow Recomendado

### Dia a Dia (99% do tempo)

```bash
# 1. .env configurado para LOCAL
# 2. Iniciar backend:
cd Backend && npm start

# 3. Iniciar frontend:
cd Frontend && npm run dev

# 4. Desenvolver/testar normalmente
# 5. Commit e push → Render/Vercel deployam automaticamente
```

### Deploy de SuperAdmin em Produção (1x)

```bash
# 1. BACKUP do .env local
cp Backend/.env Backend/.env.backup

# 2. Editar .env para produção
# MONGODB_URI=mongodb+srv://...

# 3. Executar script
cd Backend
node scripts/criarSuperAdmin.js

# 4. RESTAURAR .env local IMEDIATAMENTE
cp Backend/.env.backup Backend/.env

# 5. Verificar
cat .env | grep MONGODB_URI
# → Deve mostrar 127.0.0.1
```

---

**Lembre-se:** LOCAL para desenvolver, PRODUÇÃO apenas quando absolutamente necessário! 🎯
