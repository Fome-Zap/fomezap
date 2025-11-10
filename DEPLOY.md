# 🚀 Guia de Deploy - FomeZap

Deploy do sistema usando **Vercel (Frontend)** + **Railway (Backend)**

## 📋 Pré-requisitos

- [ ] Conta no GitHub (gratuita)
- [ ] Conta no Vercel (gratuita) - https://vercel.com
- [ ] Conta no Railway (gratuita) - https://railway.app
- [ ] Domínio fomezap.com com DNS no Cloudflare

---

## 🎯 Arquitetura Final

```
Cloudflare DNS (fomezap.com)
    ↓
├── *.fomezap.com          → Vercel (Frontend - Wildcard)
├── loja1.fomezap.com      → Vercel (Cardápio Loja 1)
├── loja2.fomezap.com      → Vercel (Cardápio Loja 2)
├── admin.fomezap.com      → Vercel (Painel Admin)
└── api.fomezap.com        → Railway (Backend + MongoDB)
```

---

## 📦 PARTE 1: Deploy do Backend (Railway)

### 1.1. Criar conta no Railway

1. Acesse https://railway.app
2. Clique em "Login with GitHub"
3. Autorize Railway a acessar seus repositórios

### 1.2. Criar novo projeto

1. Clique em "New Project"
2. Selecione "Deploy from GitHub repo"
3. Escolha o repositório `FomeZap` (ou como você nomeou)
4. Railway detectará automaticamente o Backend

### 1.3. Adicionar MongoDB

1. No dashboard do projeto, clique em "+ New"
2. Selecione "Database" → "MongoDB"
3. Railway criará automaticamente a variável `MONGODB_URI`

### 1.4. Configurar Variáveis de Ambiente

No Railway, vá em seu serviço Backend → "Variables":

```bash
# Adicione estas variáveis:
PORT=5000
NODE_ENV=production
JWT_SECRET=<GERE_UMA_SENHA_FORTE_AQUI>
CORS_ORIGINS=https://*.fomezap.com,https://fomezap.com,https://admin.fomezap.com
FRONTEND_URL=https://fomezap.com

# MONGODB_URI é gerado automaticamente pelo Railway
```

**Como gerar JWT_SECRET forte:**
```bash
# No PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Ou use: https://generate-secret.vercel.app/32
```

### 1.5. Deploy

1. Railway fará deploy automaticamente
2. Aguarde 2-3 minutos
3. Copie a URL gerada (ex: `seu-backend.up.railway.app`)

### 1.6. Adicionar Domínio Customizado

1. No Railway, vá em seu Backend → "Settings" → "Domains"
2. Clique em "Custom Domain"
3. Digite: `api.fomezap.com`
4. Railway mostrará um registro CNAME

---

## 🎨 PARTE 2: Deploy do Frontend (Vercel)

### 2.1. Criar conta no Vercel

1. Acesse https://vercel.com
2. Clique em "Sign Up with GitHub"
3. Autorize Vercel a acessar seus repositórios

### 2.2. Importar Projeto

1. No dashboard, clique em "Add New..." → "Project"
2. Selecione seu repositório `FomeZap`
3. Vercel detectará automaticamente o framework Vite

### 2.3. Configurar Build

```
Framework Preset: Vite
Root Directory: Frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 2.4. Configurar Variáveis de Ambiente

Antes de fazer deploy, adicione em "Environment Variables":

```
VITE_API_URL = https://api.fomezap.com/api
```

Marque para: **Production**, **Preview**, e **Development**

### 2.5. Deploy

1. Clique em "Deploy"
2. Aguarde 1-2 minutos
3. Vercel gerará uma URL (ex: `seu-projeto.vercel.app`)

### 2.6. Adicionar Domínio Wildcard

1. No Vercel, vá em "Settings" → "Domains"
2. Adicione os domínios:
   - `fomezap.com`
   - `*.fomezap.com` (wildcard)
   - `admin.fomezap.com`
3. Vercel mostrará os registros DNS necessários

---

## 🌐 PARTE 3: Configurar DNS no Cloudflare

### 3.1. Acessar Cloudflare

1. Faça login em https://dash.cloudflare.com
2. Selecione `fomezap.com`
3. Vá em "DNS" → "Records"

### 3.2. Adicionar Registros

Adicione os seguintes registros CNAME:

| Type | Name | Target | Proxy Status |
|------|------|--------|--------------|
| CNAME | `@` | `cname.vercel-dns.com` | DNS only |
| CNAME | `*` | `cname.vercel-dns.com` | DNS only |
| CNAME | `admin` | `cname.vercel-dns.com` | DNS only |
| CNAME | `api` | `seu-backend.up.railway.app` | DNS only |

**⚠️ IMPORTANTE:** Desative o proxy (nuvem laranja) do Cloudflare para que os certificados SSL da Vercel/Railway funcionem.

### 3.3. Aguardar Propagação

- DNS pode levar até 24h para propagar
- Normalmente leva 5-30 minutos
- Teste com: https://dnschecker.org

---

## ✅ PARTE 4: Verificar Deploy

### 4.1. Testar Backend

```bash
# PowerShell:
curl https://api.fomezap.com/api/health

# Deve retornar:
# { "status": "ok", "mongodb": "connected" }
```

### 4.2. Testar Frontend

1. Acesse: `https://fomezap.com`
2. Deve carregar o cardápio
3. Acesse: `https://admin.fomezap.com/login`
4. Teste login com credenciais demo

### 4.3. Testar Wildcard

1. Acesse: `https://loja1.fomezap.com?tenant=demo`
2. Deve carregar cardápio da loja demo
3. Acesse: `https://minhaloja.fomezap.com?tenant=minhaloja`
4. Deve funcionar para QUALQUER subdomínio

---

## 🔄 PARTE 5: Deploy Automático (CI/CD)

### 5.1. Deploy Automático já está funcionando!

**Vercel:**
- ✅ Cada push em `main` → Deploy automático
- ✅ Cada Pull Request → Preview automático
- ✅ Rollback com 1 clique

**Railway:**
- ✅ Cada push em `main` → Deploy automático
- ✅ Logs em tempo real
- ✅ Rollback com 1 clique

### 5.2. Criar Branch de Desenvolvimento (Opcional)

```bash
# Criar branch dev
git checkout -b dev
git push -u origin dev

# No Vercel: Configure preview para branch dev
# No Railway: Configure deploy apenas em main
```

---

## 📊 PARTE 6: Monitoramento

### 6.1. Vercel Dashboard

- Acesse: https://vercel.com/dashboard
- Monitore:
  - Deployments
  - Analytics (quantos acessos)
  - Logs de erros

### 6.2. Railway Dashboard

- Acesse: https://railway.app/dashboard
- Monitore:
  - Logs do backend
  - Uso de CPU/RAM
  - Uso de créditos

### 6.3. Configurar Alerts (Opcional)

**Vercel:**
- Settings → Notifications
- Ative alertas de deploy falho

**Railway:**
- Project → Settings → Notifications
- Ative alertas de deploy falho

---

## 🐛 PARTE 7: Troubleshooting

### Problema: CORS Error

**Sintoma:** Frontend não consegue acessar backend

**Solução:**
1. Verifique variável `CORS_ORIGINS` no Railway
2. Deve incluir todos os domínios wildcard:
   ```
   https://*.fomezap.com,https://fomezap.com,https://admin.fomezap.com
   ```

### Problema: 404 em rotas do React

**Sintoma:** Página recarrega e dá 404

**Solução:**
1. Vercel já está configurado com `vercel.json`
2. Se persistir, verifique se `dist/index.html` existe após build

### Problema: Imagens não carregam

**Sintoma:** Upload funciona mas imagens não aparecem

**Solução:**
1. Verifique se pasta `uploads/` existe no Railway
2. Railway usa storage efêmero (imagens somem em restart)
3. **Solução permanente:** Use Cloudinary ou S3 (implementamos depois)

### Problema: MongoDB desconectado

**Sintoma:** Backend retorna erro de conexão

**Solução:**
1. Verifique se serviço MongoDB está ativo no Railway
2. Verifique variável `MONGODB_URI`
3. Restart o backend no Railway

---

## 💰 PARTE 8: Custos

### Período Gratuito (0-10 restaurantes)

| Serviço | Custo | Limite |
|---------|-------|--------|
| Vercel | $0/mês | 100GB bandwidth |
| Railway | $5 crédito inicial | 500h execução |
| **Total** | **$0** | Suficiente para MVP |

### Após Limite Gratuito (10-50 restaurantes)

| Serviço | Custo |
|---------|-------|
| Vercel | $0-20/mês |
| Railway | $5-15/mês |
| **Total** | **$5-35/mês** |

---

## 🎓 PARTE 9: Para o TCC

### Documentação para Apresentação

1. **Arquitetura:**
   - Frontend (Vercel) + Backend (Railway) + MongoDB
   - Multi-tenant com wildcard DNS
   - CI/CD automático

2. **Tecnologias:**
   - Docker (containerização)
   - GitHub (controle de versão)
   - Vercel (deploy frontend)
   - Railway (deploy backend)
   - Cloudflare (DNS + CDN)

3. **Demonstração:**
   - Mostre deploy automático (push → deploy)
   - Mostre preview de PR
   - Mostre logs em tempo real
   - Mostre wildcard funcionando

---

## 🚀 Próximos Passos (Melhorias)

Após deploy básico funcionando:

1. **GitHub Actions para CI/CD avançado**
   - Testes automáticos
   - Linting
   - Deploy condicional

2. **Storage permanente de imagens**
   - Cloudinary (grátis até 25GB)
   - AWS S3 (pago)

3. **Kubernetes local (Kind)**
   - Para demonstração no TCC
   - Orquestração de containers

4. **Monitoramento avançado**
   - Sentry (rastreamento de erros)
   - Google Analytics

---

## 📞 Suporte

Se tiver problemas:
1. Verifique logs no Railway/Vercel
2. Teste endpoints com curl
3. Verifique DNS com dnschecker.org
4. Me chame! 😊

---

## ✅ Checklist Final

- [ ] Backend deployado no Railway
- [ ] MongoDB funcionando
- [ ] Frontend deployado no Vercel
- [ ] DNS configurado no Cloudflare
- [ ] Wildcard funcionando (*.fomezap.com)
- [ ] Admin acessível (admin.fomezap.com)
- [ ] API respondendo (api.fomezap.com)
- [ ] CORS configurado
- [ ] SSL/HTTPS funcionando
- [ ] Teste completo de ponta a ponta

---

**Tempo estimado total:** 45-60 minutos
**Dificuldade:** ⭐⭐⭐ (Média)
**Custo inicial:** $0

Bora deployar? 🚀
