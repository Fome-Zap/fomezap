# 🚀 SETUP FINAL - PRODUÇÃO (Vercel + Render)

## ✅ CHECKLIST COMPLETO

### 1️⃣ Render (Backend) - https://dashboard.render.com

```bash
# Adicionar Environment Variables:
┌──────────────────────────────────────────────────────────┐
│ MONGODB_URI          mongodb+srv://user:pass@...         │
│ JWT_SECRET           <sua-chave-secreta-jwt>             │
│ GMAIL_USER           tffjauds@gmail.com                  │
│ GMAIL_APP_PASSWORD   abcdefghijklmnop                   │
│ NODE_ENV             production                          │
│ PORT                 5000                                │
│ CORS_ORIGINS         https://vercel.app                  │
└──────────────────────────────────────────────────────────┘

# Após salvar, aguardar redeploy (~2 min)
```

**Como obter App Password:**
1. https://myaccount.google.com/security
2. Ativar "Verificação em 2 etapas"
3. https://myaccount.google.com/apppasswords
4. Criar App Password para "FomeZap Backend"
5. Copiar senha de 16 dígitos (sem espaços)

---

### 2️⃣ Vercel (Frontend) - https://vercel.com

#### A. Configurar Domínio (Opcional - para subdomínios)

```bash
# Se tiver domínio próprio:
1. Vercel → Settings → Domains
2. Add: fomezap.com
3. Configurar DNS:
   - Tipo: A → @ → 76.76.21.21
   - Tipo: CNAME → www → cname.vercel-dns.com
   - Tipo: CNAME → * → cname.vercel-dns.com  # Wildcard!

4. Aguardar propagação (até 24h)
```

#### B. Sem domínio próprio: Usar Vercel URL

```bash
# Seu deploy será:
https://seu-projeto.vercel.app

# Tenants acessam via query parameter:
https://seu-projeto.vercel.app?tenant=loja1
https://seu-projeto.vercel.app?tenant=demo
```

---

### 3️⃣ Criar SuperAdmin no Render

**Opção A: Via Shell do Render**
```bash
1. Render Dashboard → Web Service → Shell
2. Executar:
   node scripts/criarSuperAdmin.js
   
3. Verificar saída:
   ✅ SuperAdmin criado com sucesso!
   Email: tffjauds@gmail.com
   Senha: !@qwasZX
```

**Opção B: Via MongoDB Compass (Local)**
```javascript
// Conectar ao MongoDB Atlas e executar:
use FomeZap

db.superadmins.insertOne({
  nome: "Thiago Figueredo",
  email: "tffjauds@gmail.com",
  senha: "$2b$10$..." // Use bcrypt.hash('!@qwasZX', 10)
  role: "super-admin",
  ativo: true,
  criadoEm: new Date()
})
```

---

### 4️⃣ Testar Produção

#### Backend (Render)
```bash
# Health Check
curl https://fomezap-api.onrender.com/health

# Resposta esperada:
{
  "status": "ok",
  "service": "FomeZap API"
}
```

#### Frontend (Vercel)
```bash
# Abrir no navegador:
https://seu-projeto.vercel.app

# Fazer login:
Email: tffjauds@gmail.com
Senha: !@qwasZX
```

#### Criar Tenant de Teste
```bash
1. Login como SuperAdmin
2. Criar novo tenant:
   - Nome: Loja Teste
   - Slug: loja-teste
   - Email: admin@teste.com
   - Senha: senha123

3. Acessar cardápio:
   # Com domínio próprio:
   https://loja-teste.fomezap.com
   
   # Sem domínio:
   https://seu-projeto.vercel.app?tenant=loja-teste
```

---

## 🔧 COMANDOS ÚTEIS

### Local Development
```bash
# Backend
cd Backend
npm install
npm start
# → http://localhost:5000

# Frontend (outro terminal)
cd Frontend
npm install
npm run dev
# → http://localhost:5173

# Criar SuperAdmin local
cd Backend
node scripts/criarSuperAdmin.js

# Testar Gmail SMTP
node testarGmailSMTP.js
```

### Deploy Manual
```bash
# Commit e Push
git add -A
git commit -m "feat: Suas alterações"
git push origin main

# Vercel e Render fazem deploy automático! 🎉
```

---

## 🗂️ ESTRUTURA DE DADOS

### SuperAdmin (Colection: superadmins)
```javascript
{
  _id: ObjectId,
  nome: "Thiago Figueredo",
  email: "tffjauds@gmail.com",
  senha: "$2b$10$...",  // Hash bcrypt
  role: "super-admin",
  ativo: true,
  criadoEm: ISODate,
  ultimoAcesso: ISODate
}
```

### Tenant (Collection: tenants)
```javascript
{
  _id: ObjectId,
  tenantId: "tenant_673d92a3e...",
  nome: "Lanchonete Central",
  slug: "lanchonete-central",  // Subdomínio
  email: "contato@lanchonete.com",
  telefone: "(11) 91234-5678",
  endereco: "Rua Principal, 123",
  ativo: true,
  plano: "basico",
  criadoEm: ISODate,
  configuracoes: {
    aceitaPedidos: true,
    tempoEntregaMin: 30,
    tempoEntregaMax: 45,
    taxaEntrega: 5.00,
    pedidoMinimo: 15.00
  }
}
```

### Admin (Collection: admins)
```javascript
{
  _id: ObjectId,
  tenantId: "tenant_673d92a3e...",
  nome: "João Silva",
  email: "joao@lanchonete.com",
  senha: "$2b$10$...",
  role: "admin",
  ativo: true,
  criadoEm: ISODate
}
```

---

## 🌐 ACESSOS PRODUÇÃO

### URLs Principais

```
SuperAdmin Login:
└─ https://seu-projeto.vercel.app/login
   Email: tffjauds@gmail.com
   Senha: !@qwasZX

Backend API:
└─ https://fomezap-api.onrender.com

Tenant (com domínio):
├─ https://loja1.fomezap.com
├─ https://loja1.fomezap.com/admin
└─ https://loja2.fomezap.com

Tenant (sem domínio):
├─ https://seu-projeto.vercel.app?tenant=loja1
└─ https://seu-projeto.vercel.app/admin?tenant=loja1
```

---

## ⚠️ TROUBLESHOOTING RÁPIDO

### ❌ Login não funciona
```bash
# 1. Verificar se SuperAdmin existe no MongoDB
# 2. Verificar JWT_SECRET no Render
# 3. Verificar logs do Render
# 4. Limpar localStorage do navegador
```

### ❌ Imagens não aparecem
```bash
# ✅ JÁ RESOLVIDO!
# Imagens estão em: Frontend/public/img/
# Vite serve automaticamente arquivos em /public
```

### ❌ Email de recuperação não chega
```bash
# 1. Verificar GMAIL_APP_PASSWORD no Render
# 2. Verificar pasta Spam
# 3. Verificar logs do Render:
#    Render → Logs → Filter: "Email"
# 4. Testar localmente: node Backend/testarGmailSMTP.js
```

### ❌ CORS bloqueado
```bash
# Verificar origin permitido no Backend/index.js:
# Linha ~50: cors({ origin: ... })
# Adicionar URL da Vercel se necessário
```

### ❌ Tenant não encontrado
```bash
# 1. Verificar slug do tenant no MongoDB
# 2. Usar slug EXATO na URL:
#    ?tenant=lanchonete-central (correto)
#    ?tenant=Lanchonete Central (errado)
```

---

## 📚 DOCUMENTAÇÃO ADICIONAL

- **Subdomínios:** `GUIA-SUBDOMÍNIOS-PRODUCAO.md`
- **Recuperação de Senha:** `GUIA-RECUPERACAO-SENHA.md`
- **Arquitetura:** `arquitetura-saas.md`
- **Deploy Render:** `deploy-saas.md`

---

## 🎉 RESUMO EXECUTIVO

### O que está PRONTO:

✅ Backend (Render) - API funcionando
✅ Frontend (Vercel) - Interface deployada
✅ MongoDB Atlas - Banco de dados online
✅ Multi-tenant - Isolamento por subdomínio/query
✅ Autenticação - JWT + bcrypt
✅ Recuperação de senha - Gmail SMTP
✅ Imagens - Servidas corretamente
✅ CORS - Configurado para Vercel

### O que você PRECISA FAZER:

1. **Render:** Adicionar variáveis de ambiente (5 min)
2. **Gmail:** Gerar App Password (3 min)
3. **Render:** Executar script SuperAdmin (1 min)
4. **Testar:** Login + criar tenant (5 min)

**Total: ~15 minutos para produção 100% funcional! 🚀**

---

## 🆘 SUPORTE

### Precisa de ajuda?

1. **Logs do Render:**
   - Render Dashboard → Logs
   - Filtrar por: "error", "❌", "Email"

2. **Logs do Vercel:**
   - Vercel Dashboard → Deployments → View Logs
   - Procurar por erros de build

3. **MongoDB:**
   - MongoDB Atlas → Collections
   - Verificar se dados estão salvando

4. **Teste Local:**
   - Sempre teste localmente primeiro
   - `npm start` + `npm run dev`
   - Verificar console.log() no backend

---

**Última atualização:** 20/11/2025  
**Versão:** 1.0.0  
**Status:** ✅ Produção Ready
