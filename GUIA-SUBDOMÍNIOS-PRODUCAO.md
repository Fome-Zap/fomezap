# 🌐 Guia Completo: Subdomínios e Multi-Tenant em Produção

## 📋 Índice
1. [Como Funciona o Sistema Multi-Tenant](#como-funciona)
2. [Configurando Subdomínios](#configurando-subdomínios)
3. [Criando Novos Tenants](#criando-tenants)
4. [Acesso Local vs Produção](#acesso-local-vs-produção)
5. [Troubleshooting](#troubleshooting)

---

## 🏗️ Como Funciona o Sistema Multi-Tenant {#como-funciona}

### Estrutura de URLs

```
📍 PRODUÇÃO (Subdomínios):
├── https://manager.fomezap.com          → SuperAdmin (criar/gerenciar tenants)
├── https://loja1.fomezap.com            → Cardápio do Tenant "loja1"
├── https://loja1.fomezap.com/admin      → Painel Admin do Tenant "loja1"
├── https://burguer-king.fomezap.com     → Cardápio do Tenant "burguer-king"
└── https://burguer-king.fomezap.com/admin → Painel Admin do Tenant "burguer-king"

📍 LOCAL (Query Parameters):
├── http://localhost:5173                → SuperAdmin
├── http://localhost:5173?tenant=loja1   → Cardápio do Tenant "loja1"
└── http://localhost:5173/admin?tenant=loja1 → Painel Admin do Tenant "loja1"
```

### Fluxo de Detecção de Tenant

```javascript
// Backend: detectarTenant.js
1. Verifica o subdomínio: loja1.fomezap.com → extrai "loja1"
2. Busca no MongoDB: Tenant.findOne({ slug: "loja1" })
3. Anexa ao request: req.tenant, req.tenantId
4. Rotas usam: req.tenant para filtrar dados
```

---

## 🔧 Configurando Subdomínios {#configurando-subdomínios}

### 1️⃣ Vercel (Frontend)

#### Passo 1: Adicionar Domínio Principal
```
1. Acesse: https://vercel.com/seu-projeto/settings/domains
2. Adicione: fomezap.com
3. Configure DNS:
   - Tipo: A
   - Nome: @
   - Valor: 76.76.21.21 (IP da Vercel)
   
   - Tipo: CNAME
   - Nome: www
   - Valor: cname.vercel-dns.com
```

#### Passo 2: Configurar Wildcard para Subdomínios
```
No seu provedor de DNS (GoDaddy, Cloudflare, etc.):

Tipo: CNAME
Nome: *
Valor: cname.vercel-dns.com
TTL: 3600

Isso permite: loja1.fomezap.com, loja2.fomezap.com, etc.
```

#### Passo 3: Adicionar Domínio Wildcard na Vercel
```
1. Vercel → Domains → Add
2. Digite: *.fomezap.com
3. Aguarde verificação DNS (pode levar até 24h)
```

### 2️⃣ Render (Backend)

#### Configurar CORS para Aceitar Subdomínios
```javascript
// Backend/index.js - JÁ ESTÁ CONFIGURADO!
cors({
  origin: function(origin, callback) {
    // Regex permite TODOS os subdomínios de fomezap.com
    if (/^https?:\/\/[a-z0-9-]+\.fomezap\.com$/.test(origin)) {
      callback(null, true);
    }
  }
})
```

#### Variáveis de Ambiente no Render
```env
MONGODB_URI=mongodb+srv://seu-usuario:senha@cluster.mongodb.net/FomeZap
JWT_SECRET=sua-chave-secreta
GMAIL_USER=tffjauds@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
NODE_ENV=production
PORT=5000
```

---

## 👥 Criando Novos Tenants {#criando-tenants}

### Opção 1: Via Interface SuperAdmin (Recomendado)

```
1. Acesse: https://manager.fomezap.com
   (ou http://localhost:5173 em dev)

2. Faça login:
   Email: tffjauds@gmail.com
   Senha: !@qwasZX

3. Clique em "Criar Novo Tenant"

4. Preencha:
   ┌────────────────────────────────────┐
   │ Nome: Burguer King Central         │
   │ Slug: burguer-king-central         │ ← Será o subdomínio
   │ Email Admin: admin@burguerking.com │
   │ Senha Admin: senha123              │
   │ Telefone: (11) 98888-8888          │
   │ Endereço: Rua Principal, 123       │
   └────────────────────────────────────┘

5. Salvar → Tenant criado!
```

### Opção 2: Via Script (Para Produção/Bulk)

Crie: `Backend/scripts/criarTenant.js`

```javascript
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { Tenant, Admin } from '../Models/TenantModels.js';

async function criarTenant() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Dados do tenant
  const tenant = await Tenant.create({
    nome: 'Lanchonete Família',
    slug: 'lanchonete-familia', // → lanchonete-familia.fomezap.com
    email: 'contato@lanchonetefamilia.com',
    telefone: '(11) 91234-5678',
    endereco: 'Av. Central, 456',
    ativo: true,
    plano: 'basico',
    configuracoes: {
      aceitaPedidos: true,
      tempoEntregaMin: 30,
      tempoEntregaMax: 45,
      taxaEntrega: 5.00,
      pedidoMinimo: 15.00
    }
  });

  // Criar admin do tenant
  const senhaHash = await bcrypt.hash('senha123', 10);
  await Admin.create({
    tenantId: tenant.tenantId,
    nome: 'João Silva',
    email: 'joao@lanchonetefamilia.com',
    senha: senhaHash,
    role: 'admin',
    ativo: true
  });

  console.log(`✅ Tenant criado: ${tenant.slug}`);
  console.log(`🌐 Acesso: https://${tenant.slug}.fomezap.com`);
  
  await mongoose.disconnect();
}

criarTenant();
```

Execute:
```bash
cd Backend
node scripts/criarTenant.js
```

### Opção 3: Via API (Para Integrações)

```javascript
// POST https://fomezap-api.onrender.com/api/super-admin/tenants
// Header: Authorization: Bearer <token-superadmin>

{
  "nome": "Pizza Express",
  "slug": "pizza-express",
  "email": "contato@pizzaexpress.com",
  "telefone": "(11) 92222-3333",
  "endereco": "Rua das Pizzas, 789",
  "adminNome": "Maria Santos",
  "adminEmail": "maria@pizzaexpress.com",
  "adminSenha": "senha123"
}
```

---

## 🔄 Acesso Local vs Produção {#acesso-local-vs-produção}

### 🏠 Desenvolvimento Local

```bash
# 1. Backend (Terminal 1)
cd Backend
npm start
# → http://localhost:5000

# 2. Frontend (Terminal 2)
cd Frontend
npm run dev
# → http://localhost:5173

# 3. Acessar Tenants:
http://localhost:5173?tenant=loja1
http://localhost:5173?tenant=burguer-king
http://localhost:5173/admin?tenant=loja1
```

### ☁️ Produção (Vercel + Render)

```
1. Tenants acessam automaticamente por subdomínio:
   https://loja1.fomezap.com
   https://burguer-king.fomezap.com

2. Backend detecta automaticamente o tenant pelo hostname

3. Dados isolados por tenant no MongoDB
```

### 🔗 Como o Frontend Detecta o Ambiente

```javascript
// src/config/api.js - JÁ ESTÁ CONFIGURADO!

const isProduction = import.meta.env.PROD;

const API_BASE_URL = isProduction
  ? 'https://fomezap-api.onrender.com'  // Produção
  : 'http://localhost:5000';             // Local
```

**Como o Vite define automaticamente:**
- `npm run dev` → `import.meta.env.PROD = false`
- `npm run build` (Vercel) → `import.meta.env.PROD = true`

---

## 🎯 Testando o Sistema Multi-Tenant

### 1️⃣ Criar 3 Tenants de Teste

```javascript
// Via SuperAdmin ou script
Tenant 1: slug = "loja-teste-1"
Tenant 2: slug = "loja-teste-2"
Tenant 3: slug = "demo"
```

### 2️⃣ Adicionar Produtos Diferentes em Cada

```
Loja 1: X-Burguer, Coca-Cola
Loja 2: Pizza Margherita, Suco Laranja
Loja 3: Hambúrguer Artesanal, Cerveja
```

### 3️⃣ Testar Isolamento

```bash
# Local
curl http://localhost:5000/api/produtos?tenant=loja-teste-1
# → Retorna apenas produtos da Loja 1

curl http://localhost:5000/api/produtos?tenant=loja-teste-2
# → Retorna apenas produtos da Loja 2

# Produção (automático)
https://loja-teste-1.fomezap.com/api/produtos
https://loja-teste-2.fomezap.com/api/produtos
```

---

## ⚠️ Troubleshooting {#troubleshooting}

### ❌ Problema: "Tenant não encontrado"

**Causa:** Slug incorreto ou tenant não existe

**Solução:**
```bash
# Verificar tenants no MongoDB
mongosh "mongodb+srv://seu-cluster" --eval "db.tenants.find({})"

# Listar slugs disponíveis
db.tenants.find({}, { slug: 1, nome: 1 })
```

### ❌ Problema: Subdomínio não funciona em produção

**Causa:** DNS não propagado ou não configurado

**Solução:**
```bash
# 1. Verificar DNS
nslookup loja1.fomezap.com

# 2. Aguardar propagação (até 24h)
# 3. Verificar Vercel Domains:
#    - *.fomezap.com deve estar listado e verificado
```

### ❌ Problema: CORS bloqueado

**Causa:** Subdomínio não permitido no backend

**Solução:**
```javascript
// Backend/index.js - Adicionar pattern ao CORS
/^https:\/\/[a-z0-9-]+\.fomezap\.com$/.test(origin)
```

### ❌ Problema: Imagens não carregam

**Causa:** Imagens em `Frontend/img` em vez de `Frontend/public/img`

**Solução:**
```bash
# Mover para public (já fizemos isso!)
mv Frontend/img/* Frontend/public/img/
```

### ❌ Problema: Login não funciona em produção

**Causa:** JWT_SECRET diferente ou não configurado

**Solução:**
```bash
# 1. Render → Environment → Adicionar:
JWT_SECRET=<mesma-chave-do-local>

# 2. Gerar nova chave se necessário:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📚 Documentação Adicional

- **Criar SuperAdmin:** `Backend/scripts/criarSuperAdmin.js`
- **Recuperação de Senha:** `GUIA-RECUPERACAO-SENHA.md`
- **Deploy Render:** `deploy-saas.md`
- **Arquitetura Multi-Tenant:** `arquitetura-saas.md`

---

## 🎉 Resumo Rápido

### Para criar um novo tenant:
1. Login SuperAdmin: `tffjauds@gmail.com` / `!@qwasZX`
2. Criar Tenant com slug único (ex: `minha-loja`)
3. Aguardar DNS (se primeira vez configurando wildcard)
4. Acessar: `https://minha-loja.fomezap.com`

### Para testar localmente:
1. `npm start` no Backend
2. `npm run dev` no Frontend
3. Acessar: `http://localhost:5173?tenant=minha-loja`

### Para conectar local com produção:
❌ **NÃO RECOMENDADO** - Use MongoDB local para testes
✅ Se necessário, configure `MONGODB_URI` no `.env` local
