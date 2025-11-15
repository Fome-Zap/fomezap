# 🚀 GUIA DE DEPLOY - FOMEZAP PRODUÇÃO

## ✅ TENANT CRIADO

**Tenant:** Lanchonete em Família  
**TenantId:** `6918f6f9e50c9aa7fa2e0b62`  
**Slug:** `familia`  
**Subdomínio:** `familia.fomezap.com`

**Credenciais Admin:**
- Email: `admin@familia.com`
- Senha: `familia123`

---

## 📋 CHECKLIST DE DEPLOY

### ✅ FASE 1: PREPARAÇÃO (CONCLUÍDA)
- [x] Criar branch de backup
- [x] Commit de todas as alterações
- [x] Criar tenant "familia" no banco de dados
- [x] Gerar credenciais de admin

### 🔄 FASE 2: DNS CLOUDFLARE (PRÓXIMO PASSO)

1. **Acesse Cloudflare Dashboard**
   - Site: `fomezap.com`
   - Seção: DNS → Records

2. **Adicione registro CNAME:**
   ```
   Tipo: CNAME
   Nome: familia
   Destino: cname.vercel-dns.com
   Proxy status: DNS only (cinza, não laranja)
   TTL: Auto
   ```

3. **Salve e aguarde** (propagação: 5-10 minutos)

### 🌐 FASE 3: CONFIGURAR VERCEL

1. **Acesse projeto no Vercel**
   - Dashboard → Seu Projeto → Settings → Domains

2. **Adicione domínio customizado:**
   - Add Domain: `familia.fomezap.com`
   - Vercel vai verificar o DNS automaticamente

3. **Aguarde certificado SSL** (automático, ~5 min)

### 🔧 FASE 4: VARIÁVEIS DE AMBIENTE

#### **Backend (Render ou Railway):**
```env
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/fomezap
JWT_SECRET=gere-um-secret-super-seguro-aqui
NODE_ENV=production
PORT=5000
CORS_ORIGINS=https://familia.fomezap.com
```

**Gerar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### **Frontend (Vercel):**
```env
VITE_API_URL=https://seu-backend.onrender.com
```

### 🚀 FASE 5: DEPLOY

#### **Frontend (Vercel):**
```bash
# Fazer push para branch principal
git push origin deploy-vercel

# Vercel faz deploy automático
# Ou via CLI:
vercel --prod
```

#### **Backend (Render):**
1. Conectar repositório GitHub
2. Configurar:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node 18+
3. Deploy

### ✅ FASE 6: TESTES EM PRODUÇÃO

1. **Testar acesso ao subdomínio:**
   ```
   https://familia.fomezap.com
   ```

2. **Verificar detecção de tenant:**
   - Deve carregar dados da "Lanchonete em Família"
   - Logo, categorias, produtos devem aparecer

3. **Testar login admin:**
   - Email: `admin@familia.com`
   - Senha: `familia123`

4. **Verificar painel admin:**
   - Dashboard com pedidos
   - Editar categorias
   - Editar produtos
   - Configurações da loja

5. **Testar fluxo de pedido:**
   - Adicionar produto ao carrinho
   - Finalizar pedido
   - Verificar no painel admin

---

## 🔍 TROUBLESHOOTING

### Problema: "tenant não encontrado"
**Solução:** Verificar se middleware detectarTenant está ativo no backend

### Problema: CORS error
**Solução:** Adicionar `https://familia.fomezap.com` em `CORS_ORIGINS`

### Problema: 404 nas rotas do React
**Solução:** `vercel.json` já configurado com rewrites

### Problema: Backend não conecta ao MongoDB
**Solução:** Verificar MONGODB_URI e whitelist de IPs no MongoDB Atlas

---

## 📊 MONITORAMENTO PÓS-DEPLOY

### Logs Backend (Render):
```
Dashboard → Logs → View Logs
```

### Logs Frontend (Vercel):
```
Dashboard → Deployments → [último deploy] → View Function Logs
```

### Analytics (Vercel):
```
Dashboard → Analytics
```

---

## 🔄 ROLLBACK (SE NECESSÁRIO)

### Frontend:
```bash
# Vercel mantém histórico de deploys
# Dashboard → Deployments → Promote to Production
```

### Backend:
```bash
git revert HEAD
git push origin main
# Render faz redeploy automático
```

---

## 🎯 PRÓXIMOS TENANTS

Para adicionar novos tenants:

1. **Criar tenant:**
   ```bash
   # Editar criarNovoTenant.js com novos dados
   node criarNovoTenant.js
   ```

2. **Adicionar DNS:**
   ```
   CNAME: novo-slug.fomezap.com → cname.vercel-dns.com
   ```

3. **Adicionar domínio no Vercel:**
   ```
   Settings → Domains → Add: novo-slug.fomezap.com
   ```

4. **Atualizar CORS no backend:**
   ```
   CORS_ORIGINS=....,https://novo-slug.fomezap.com
   ```

---

## 📞 SUPORTE

- **Vercel Docs:** https://vercel.com/docs
- **Render Docs:** https://render.com/docs
- **Cloudflare DNS:** https://developers.cloudflare.com/dns/

---

**Data de criação:** 2025  
**Versão:** 1.0  
**Tenant inicial:** familia.fomezap.com
