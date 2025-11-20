# 🚀 Guia de Deploy - FomeZap

Deploy do sistema usando **Vercel (Frontend)** + **Render.com (Backend)** + **MongoDB Atlas (Banco)**

## 📋 Pré-requisitos

- [ ] Conta no GitHub (gratuita)
- [ ] Conta no Vercel (gratuita) - https://vercel.com
- [ ] Conta no Render.com (gratuita) - https://render.com
- [ ] Conta no MongoDB Atlas (gratuita) - https://mongodb.com/cloud/atlas

---

## 🎯 Arquitetura Final

```
Usuários
    ↓
├── seu-app.vercel.app     → Vercel (Frontend - React)
│   └── /api/*             → Proxy para Render.com
└── fomezap-api.onrender.com → Render.com (Backend - Node.js)
    └── MongoDB Atlas      → mongodb+srv://... (Database)
```

---

## 📦 PARTE 1: MongoDB Atlas (Banco de Dados)

### 1.1. Criar Conta no MongoDB Atlas

1. Acesse https://www.mongodb.com/cloud/atlas
2. Clique em "Try Free"
3. Crie conta com email ou Google

### 1.2. Criar Cluster Gratuito (M0)

1. Após login, clique em "Build a Database"
2. Escolha **M0 FREE** tier
3. **Provider:** AWS
4. **Region:** Escolha o mais próximo:
   - `us-east-1` (Virginia, EUA) - Recomendado
   - `sa-east-1` (São Paulo, BR) - Se disponível
5. **Cluster Name:** `fomezap-cluster`
6. Clique em "Create"

### 1.3. Configurar Acesso ao Banco

**Criar Usuário do Banco:**

1. MongoDB mostrará tela "Security Quickstart"
2. **Username:** `fomezap_user`
3. **Password:** Clique em "Autogenerate Secure Password"
4. **⚠️ COPIE A SENHA!** Você NÃO verá ela novamente
5. Clique em "Create User"

**Liberar Acesso de Qualquer IP:**

1. Na seção "Network Access"
2. Escolha "My Local Environment"
3. Clique em "Add My Current IP Address"
4. **⚠️ IMPORTANTE:** Clique em "Add IP Address" novamente
5. Digite: `0.0.0.0/0` (permite qualquer IP - necessário para Render)
6. Descrição: `Allow from anywhere`
7. Clique em "Add Entry"

### 1.4. Obter Connection String

1. Clique em "Connect" no cluster
2. Escolha "Connect your application"
3. **Driver:** Node.js
4. **Version:** 5.5 or later
5. Copie a connection string:

```
mongodb+srv://fomezap_user:<password>@fomezap-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

6. **⚠️ SUBSTITUA** `<password>` pela senha que você copiou
7. **⚠️ ADICIONE** o nome do banco antes do `?`:

```
mongodb+srv://fomezap_user:SUA_SENHA@fomezap-cluster.xxxxx.mongodb.net/fomezap?retryWrites=true&w=majority
```

**Guarde esta string! Você usará no Render.com**

---

## 🖥️ PARTE 2: Deploy do Backend (Render.com)

## 🖥️ PARTE 2: Deploy do Backend (Render.com)

### 2.1. Preparar Código para Git (SE AINDA NÃO FEZ)

```powershell
# No PowerShell, na pasta do projeto:
cd "C:\Users\Thiago Figueredo\Documents\DSMIIII\ToDo"

# Verificar status
git status

# Adicionar todos os arquivos
git add .

# Commitar
git commit -m "feat: production-ready multi-tenant system"

# Criar repositório no GitHub e fazer push
git remote add origin https://github.com/SEU_USUARIO/fomezap.git
git branch -M main
git push -u origin main
```

### 2.2. Criar Conta no Render.com

1. Acesse https://render.com
2. Clique em "Get Started for Free"
3. **Sign Up with GitHub** (conecta direto seus repos)
4. Autorize Render a acessar seus repositórios

### 2.3. Criar Web Service

1. No dashboard, clique em "New +" → "Web Service"
2. Conecte seu repositório GitHub (fomezap)
3. **Name:** `fomezap-api`
4. **Region:** Oregon (US West) - grátis
5. **Branch:** `main`
6. **Root Directory:** `Backend`
7. **Runtime:** Node
8. **Build Command:** `npm install`
9. **Start Command:** `npm start` (ou `node index.js`)
10. **Instance Type:** Free (750 horas/mês grátis)

### 2.4. Configurar Variáveis de Ambiente

Ainda na criação do serviço, role até "Environment Variables":

```bash
# OBRIGATÓRIAS:
MONGODB_URI=mongodb+srv://fomezap_user:SUA_SENHA@fomezap-cluster.xxxxx.mongodb.net/fomezap?retryWrites=true&w=majority
NODE_ENV=production
PORT=5000

# JWT_SECRET - Gerar senha forte:
JWT_SECRET=<GERE_UMA_SENHA_AQUI>

# CORS - Configurar depois que o Vercel gerar URL
CORS_ORIGINS=https://seu-app.vercel.app
```

**Como gerar JWT_SECRET forte no PowerShell:**
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copie o resultado (ex: `a1b2c3...`) e cole em `JWT_SECRET`

### 2.5. Deploy

1. Clique em "Create Web Service"
2. Render começará a fazer deploy automaticamente
3. Aguarde 3-5 minutos
4. Render gerará URL: `https://fomezap-api.onrender.com`

**⚠️ IMPORTANTE:** Serviços grátis do Render "dormem" após 15 min sem uso. Primeira requisição após isso demora ~30s.

### 2.6. Testar Backend

Após deploy completo (status "Live"):

```powershell
# Testar health check:
curl https://fomezap-api.onrender.com/health

# Deve retornar:
# { "status": "ok" }
```

Se der erro 404, verifique os logs no Render.

---

## 🎨 PARTE 3: Deploy do Frontend (Vercel)

### 3.1. Criar conta no Vercel

1. Acesse https://vercel.com
2. Clique em "Sign Up with GitHub"
3. Autorize Vercel a acessar seus repositórios

### 3.2. Importar Projeto

1. No dashboard, clique em "Add New..." → "Project"
2. Selecione seu repositório `fomezap` (ou o nome que você deu)
3. Vercel detectará automaticamente Vite

### 3.3. Configurar Build

```
Framework Preset: Vite
Root Directory: Frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**⚠️ SE** Vercel não detectar Vite, selecione manualmente.

### 3.4. Deploy

1. Clique em "Deploy" (pode pular env vars por enquanto)
2. Aguarde 1-2 minutos
3. Vercel gerará URL: `https://seu-app.vercel.app`

### 3.5. Testar Frontend

1. Acesse `https://seu-app.vercel.app`
2. Deve carregar a aplicação
3. **Porém** API vai dar erro (CORS) - vamos consertar

### 3.6. Configurar CORS no Backend

Agora que você tem a URL do Vercel:

1. Volte no **Render.com** → Seu serviço → "Environment"
2. Edite `CORS_ORIGINS`:

```bash
CORS_ORIGINS=https://seu-app.vercel.app,https://seu-app-*.vercel.app
```

3. Salve - Render fará redeploy automático (2-3 min)

### 3.7. Testar Integração

Após Render voltar online:

1. Acesse `https://seu-app.vercel.app` novamente
2. Tente criar um tenant ou fazer login
3. Deve funcionar! 🎉

---

## 🗄️ PARTE 4: Popular Banco de Dados

## 🗄️ PARTE 4: Popular Banco de Dados

### 4.1. Criar Super Admin (Primeiro Usuário)

Agora vamos criar o primeiro usuário super admin no banco de produção:

1. **Abra o terminal na pasta Backend:**

```powershell
cd "C:\Users\Thiago Figueredo\Documents\DSMIIII\ToDo\Backend"
```

2. **Edite o arquivo createSuperAdmin.js:**

Abra `createSuperAdmin.js` e cole sua **MONGODB_URI** do Atlas na linha 6:

```javascript
const MONGODB_URI = 'mongodb+srv://fomezap_user:SUA_SENHA@fomezap-cluster.xxxxx.mongodb.net/fomezap?retryWrites=true&w=majority';
```

3. **Execute o script:**

```powershell
node createSuperAdmin.js
```

4. **Resultado esperado:**

```
🔗 Conectando ao MongoDB Atlas...
✅ Conectado ao MongoDB!

👤 Criando super administrador...

✅ Super admin criado com sucesso!

📧 Email: admin@fomezap.com
🔑 Senha: Admin@2024!Strong

⚠️  IMPORTANTE: Após primeiro login, ALTERE A SENHA!

🌐 Acesse: https://seu-app.vercel.app/login
```

5. **Anote as credenciais:**
   - Email: `admin@fomezap.com`
   - Senha: `Admin@2024!Strong`

**⚠️ ALTERE A SENHA** após primeiro login!

### 4.2. Primeiro Login

1. Acesse: `https://seu-app.vercel.app/login`
2. Entre com `admin@fomezap.com` / `Admin@2024!Strong`
3. Você será redirecionado para painel Super Admin
4. **⚠️ ALTERE A SENHA** em configurações!

### 4.3. Criar Primeiro Tenant (Restaurante)

1. No painel Super Admin, clique em "Novo Tenant"
2. Preencha:
   - **Nome:** Nome do restaurante
   - **Email:** email@restaurante.com
   - **Slug:** nome-restaurante (usado na URL)
3. Clique em "Criar"
4. Sistema criará automaticamente:
   - Usuário admin do restaurante (role: `tenant_admin`)
   - 6 produtos padrão (burgers, bebidas, sobremesa)
   - Senha temporária será mostrada - **anote!**

### 4.4. Login como Admin do Restaurante

1. Faça logout (canto superior)
2. Entre com email do restaurante + senha temporária
3. Você verá o painel admin do restaurante
4. Configure:
   - Categorias
   - Produtos
   - Extras
   - Horários de funcionamento

---

## ✅ PARTE 5: Testar Sistema Completo

## ✅ PARTE 5: Testar Sistema Completo

### 5.1. Testar Backend

```powershell
# Teste health check:
curl https://fomezap-api.onrender.com/health

# Deve retornar: { "status": "ok" }
```

### 5.2. Testar Frontend + Backend Integrado

1. Acesse: `https://seu-app.vercel.app/login`
2. Faça login com super admin
3. Crie um tenant de teste
4. Logout e entre como admin do tenant
5. Crie produtos/categorias

### 5.3. Testar Cardápio Público

1. Acesse: `https://seu-app.vercel.app/?tenant=slug-do-restaurante`
2. Deve carregar cardápio público
3. Adicione produtos ao carrinho
4. Finalize pedido (checkout)
5. Volte ao admin → "Pedidos"
6. Pedido deve aparecer com status "recebido"

### 5.4. Verificar Logs (Se Der Erro)

**Render.com:**
- Dashboard → Seu serviço → "Logs"
- Veja erros em tempo real

**Vercel:**
- Dashboard → Seu projeto → "Deployments" → Clique no deploy → "Logs"

---

## 🔄 PARTE 6: Deploy Automático (CI/CD)

## 🔄 PARTE 6: Deploy Automático (CI/CD)

### 6.1. Deploy Automático já está funcionando!

**Vercel:**
- ✅ Cada push em `main` → Deploy automático
- ✅ Cada Pull Request → Preview automático
- ✅ Rollback com 1 clique

**Render.com:**
- ✅ Cada push em `main` → Deploy automático
- ✅ Logs em tempo real
- ✅ Rollback com 1 clique (Settings → Deploys)

### 6.2. Como Fazer Updates

```powershell
# 1. Faça suas alterações no código
# 2. Commit e push:
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# 3. Vercel e Render fazem deploy automaticamente!
# 4. Aguarde 2-3 minutos
# 5. Teste em produção
```

### 6.3. Criar Branch de Desenvolvimento (Opcional)

```powershell
# Criar branch dev
git checkout -b dev
git push -u origin dev

# No Vercel: Configure preview para branch dev
# No Render: Configure deploy apenas em main
```

---

## 📊 PARTE 7: Monitoramento

### 7.1. Vercel Dashboard

- Acesse: https://vercel.com/dashboard
- Monitore:
  - **Deployments:** Histórico de deploys
  - **Analytics:** Quantos acessos (no plano gratuito é limitado)
  - **Logs:** Erros do frontend

### 7.2. Render Dashboard

- Acesse: https://dashboard.render.com
- Monitore:
  - **Logs:** Logs do backend em tempo real
  - **Metrics:** CPU, memória, requisições
  - **Deploys:** Histórico de deploys

### 7.3. MongoDB Atlas Dashboard

- Acesse: https://cloud.mongodb.com
- Monitore:
  - **Metrics:** Operações, connections, storage
  - **Collections:** Visualize dados diretamente
  - **Performance Advisor:** Sugestões de índices

---

## 🐛 PARTE 8: Troubleshooting

### ❌ Problema: CORS Error

**Sintoma:** Frontend não consegue acessar backend

```
Access to XMLHttpRequest at 'https://fomezap-api.onrender.com/api/...' 
from origin 'https://seu-app.vercel.app' has been blocked by CORS policy
```

**Solução:**
1. Render.com → Seu serviço → "Environment"
2. Verifique `CORS_ORIGINS`:
   ```
   CORS_ORIGINS=https://seu-app.vercel.app,https://seu-app-*.vercel.app
   ```
3. Salve → Aguarde redeploy

### ❌ Problema: Backend demora 30s para responder

**Sintoma:** Primeira requisição após algum tempo demora muito

**Causa:** Plano Free do Render "dorme" após 15 min sem uso

**Soluções:**
1. **Aceitar a demora** (30s só na primeira requisição)
2. **Upgradar para plano pago** ($7/mês - instância sempre ativa)
3. **Criar "pinger"** - script que faz requisição a cada 10 min (cron-job.org)

### ❌ Problema: 404 em rotas do React (ex: /admin/pedidos)

**Sintoma:** Acessar rota diretamente ou dar F5 retorna 404

**Causa:** Vercel precisa redirecionar todas rotas para index.html

**Solução:**
1. Verifique se existe `Frontend/vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [{
    "source": "/assets/(.*)",
    "headers": [{ 
      "key": "Cache-Control", 
      "value": "public, max-age=31536000, immutable" 
    }]
  }]
}
```

2. Se não existir, crie
3. Commit e push → Vercel fará redeploy

### ❌ Problema: MongoDB connection error

**Sintoma:** Backend não conecta ao MongoDB

```
MongoServerError: bad auth : authentication failed
```

**Soluções:**
1. Verifique `MONGODB_URI` no Render:
   - Senha está correta? (sem `<` `>`)
   - Nome do banco está presente? (`/fomezap` antes do `?`)
2. No MongoDB Atlas:
   - Network Access → Verifique se `0.0.0.0/0` está liberado
   - Database Access → Usuário existe e tem permissão "readWrite"

### ❌ Problema: Imagens não carregam após upload

**Sintoma:** Upload funciona mas imagem não aparece depois

**Causa:** Render usa **ephemeral storage** (arquivos somem em restart/deploy)

**Solução (Temporária):**
- Aceite que imagens sumirão a cada deploy (OK para MVP)

**Solução (Produção):**
- Use serviço externo: **Cloudinary** (grátis 25GB) ou AWS S3

### ❌ Problema: Build falha no Vercel

**Sintoma:**
```
Error: Cannot find module 'vite'
```

**Solução:**
1. Vercel → Projeto → Settings → General
2. **Root Directory:** `Frontend`
3. **Build Command:** `npm run build`
4. Salve → Faça redeploy manual

---

## 💰 PARTE 9: Custos

### Plano Gratuito (MVP / Demonstração)

| Serviço | Custo | Limites |
|---------|-------|---------|
| **MongoDB Atlas** | $0/mês | 512MB storage, Cluster compartilhado |
| **Render.com** | $0/mês | 750h/mês, "dorme" após 15 min |
| **Vercel** | $0/mês | 100GB bandwidth, 100 builds/mês |
| **TOTAL** | **$0** | Suficiente para TCC/MVP |

### Plano Escalável (Produção com 10-50 restaurantes)

| Serviço | Custo | Benefícios |
|---------|-------|------------|
| **MongoDB Atlas** | $0-9/mês | M2 cluster (2GB), melhor performance |
| **Render.com** | $7/mês | Always-on, 512MB RAM, custom domain |
| **Vercel** | $0-20/mês | Pro: Analytics, mais bandwidth |
| **TOTAL** | **$7-36/mês** | Performance profissional |

**⚠️ Para TCC:** Plano gratuito é 100% suficiente!

---

## 🎓 PARTE 10: Para o TCC / Apresentação

## 🎓 PARTE 10: Para o TCC / Apresentação

### 10.1. Arquitetura para Documentar

**Infraestrutura:**
```
┌─────────────────────────────────────────────────────┐
│                     USUÁRIOS                        │
└────────────┬────────────────────────────────────────┘
             │
             ├─── Cardápio Público (React SPA)
             │    └─> Vercel CDN (Edge Network)
             │
             ├─── Admin Dashboard (React SPA)
             │    └─> Vercel CDN (Edge Network)
             │
             └─── API REST (Node.js + Express)
                  └─> Render.com (Containers)
                      └─> MongoDB Atlas (DBaaS)
```

**Tecnologias:**
- **Frontend:** React 19, Vite, Tailwind CSS, React Router
- **Backend:** Node.js 20, Express 5, JWT, Argon2
- **Database:** MongoDB Atlas (Cloud)
- **Deploy:** Vercel (Frontend), Render.com (Backend)
- **CI/CD:** GitHub Actions (automático em push)
- **Versionamento:** Git + GitHub

### 10.2. Pontos para Destacar na Apresentação

**1. Multi-tenancy (Isolamento de Dados):**
- Cada restaurante = 1 tenant
- Isolamento total no banco (campo `tenantId`)
- URL com slug: `?tenant=nome-restaurante`

**2. Deploy Automatizado:**
- Push no GitHub → Deploy automático
- Zero downtime deployment
- Rollback em 1 clique

**3. Escalabilidade:**
- Frontend servido por CDN global (Vercel)
- Backend containerizado (fácil escalar)
- Banco gerenciado (Atlas auto-scale)

**4. Segurança:**
- JWT authentication
- Argon2 password hashing (mais seguro que bcrypt)
- CORS configurado
- HTTPS em tudo

**5. Custos:**
- MVP: $0/mês (3 serviços gratuitos)
- Produção: $7-36/mês (100+ restaurantes)

### 10.3. Demonstração ao Vivo

**Roteiro de 5 minutos:**

1. **Criar Tenant (30s):**
   - Login super admin
   - Criar restaurante "Demo TCC"
   - Mostrar criação automática de produtos

2. **Configurar Cardápio (1 min):**
   - Login como admin do restaurante
   - Adicionar categoria "Promoções"
   - Adicionar produto com foto
   - Configurar horário de funcionamento

3. **Simular Cliente (1 min):**
   - Abrir cardápio público (`?tenant=demo-tcc`)
   - Adicionar produtos ao carrinho
   - Finalizar pedido

4. **Ver Pedido no Admin (30s):**
   - Voltar ao admin
   - Ver pedido em tempo real
   - Atualizar status

5. **Mostrar Deploy (1 min):**
   - Abrir GitHub → Commits
   - Mostrar Vercel dashboard → Deployments
   - Mostrar Render logs em tempo real

6. **Mostrar Escalabilidade (1 min):**
   - MongoDB Atlas → Metrics (operações/s)
   - Render → Metrics (CPU/RAM)
   - Explicar: "Se crescer, só upgradar plano"

### 10.4. Diferenciais para TCC

✅ **Sistema real em produção** (não é só localhost)
✅ **Multi-tenant** (escalável para múltiplos clientes)
✅ **Deploy automatizado** (CI/CD profissional)
✅ **Custos viáveis** ($0 para começar)
✅ **Tecnologias modernas** (React 19, Node 20)
✅ **Segurança** (JWT, Argon2, HTTPS)
✅ **Performance** (CDN, cache, otimizações)

---

## 🚀 PARTE 11: Próximos Passos (Melhorias Futuras)

Após deploy básico funcionando:

### Curto Prazo (1-2 semanas)

1. **⚠️ Alterar senha do super admin** (segurança!)
2. **Configurar domínio próprio** (ex: `meuapp.com`)
3. **Adicionar Google Analytics** (métricas de uso)
4. **Implementar upload de imagens** (Cloudinary - grátis 25GB)

### Médio Prazo (1 mês)

1. **Sistema de notificações** (email ao receber pedido)
2. **Integração WhatsApp** (enviar pedido pro WhatsApp)
3. **Dashboard com gráficos** (vendas, produtos populares)
4. **Sistema de cupons/descontos**

### Longo Prazo (2-3 meses)

1. **App Mobile** (React Native ou PWA)
2. **Pagamento online** (Stripe, Mercado Pago)
3. **Sistema de delivery** (rastreamento em tempo real)
4. **Multi-idioma** (i18n)

---

## 📞 Suporte & Recursos

### Documentação Oficial

- **Render:** https://render.com/docs
- **Vercel:** https://vercel.com/docs
- **MongoDB Atlas:** https://docs.atlas.mongodb.com

### Comunidades

- **Render Discord:** https://render.com/community
- **Vercel Discord:** https://vercel.com/discord
- **MongoDB Forum:** https://www.mongodb.com/community/forums

### Resolver Problemas

1. **Logs são seus amigos:**
   - Render → Logs (erros do backend)
   - Vercel → Deployments → Logs (erros do build)
   - Browser Console F12 (erros do frontend)

2. **Verifique variáveis de ambiente:**
   - Render → Environment
   - Vercel → Settings → Environment Variables

3. **Teste localmente primeiro:**
   ```powershell
   # Backend:
   cd Backend
   npm run dev
   
   # Frontend:
   cd Frontend
   npm run dev
   ```

---

## ✅ Checklist Final de Deploy

Antes de considerar o deploy completo, verifique:

### MongoDB Atlas
- [ ] Cluster M0 criado
- [ ] Usuário do banco criado
- [ ] Network Access: `0.0.0.0/0` liberado
- [ ] Connection string copiada e testada

### Render.com (Backend)
- [ ] Web Service criado
- [ ] Variáveis de ambiente configuradas:
  - [ ] `MONGODB_URI`
  - [ ] `JWT_SECRET`
  - [ ] `NODE_ENV=production`
  - [ ] `CORS_ORIGINS`
- [ ] Build concluído com sucesso
- [ ] Status: "Live" (verde)
- [ ] Health check responde: `/health`

### Vercel (Frontend)
- [ ] Projeto importado do GitHub
- [ ] Root Directory: `Frontend`
- [ ] Build concluído com sucesso
- [ ] Site acessível em `seu-app.vercel.app`
- [ ] Frontend conecta ao backend (sem CORS error)

### Banco de Dados
- [ ] Super admin criado (`createSuperAdmin.js`)
- [ ] Login com super admin funciona
- [ ] Criação de tenant funciona
- [ ] Login como tenant admin funciona

### Funcionalidades
- [ ] Criar categorias/produtos funciona
- [ ] Cardápio público carrega (`?tenant=slug`)
- [ ] Criar pedido funciona
- [ ] Ver pedidos no admin funciona
- [ ] Upload de imagens funciona (mesmo que temporário)

### Deploy Automático
- [ ] Push no GitHub → Vercel faz deploy
- [ ] Push no GitHub → Render faz deploy
- [ ] Rollback funciona (testado)

---

## 🎉 Parabéns!

Se todos os itens acima estão ✅, você tem um **sistema SaaS multi-tenant em produção**!

**Tempo estimado total:** 60-90 minutos (primeira vez)
**Dificuldade:** ⭐⭐⭐ (Média)
**Custo inicial:** $0

---

**💡 Dica final:** Documente tudo que você fez! Screenshots, diagramas, URLs. Isso vale muito no TCC.

Bora lá! 🚀🔥
