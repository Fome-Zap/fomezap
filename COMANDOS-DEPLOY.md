# 🚀 Comandos para Deploy e Configuração

## 📦 PASSO 1: Fazer Commit e Push das Mudanças

### Backend
```powershell
# Navegue para a pasta Backend
cd "C:\Users\Thiago Figueredo\Documents\DSMIIII\ToDo\Backend"

# Adicione todos os arquivos
git add .

# Faça commit com mensagem descritiva
git commit -m "feat: Implementar validação de domínio e isolamento de super-admin

- Add: Middleware validarDominio.js para validar manager.fomezap.com
- Add: Validação de domínio na rota /api/super-admin
- Update: CORS para aceitar manager.fomezap.com
- Security: Super-admin isolado em manager.fomezap.com apenas"

# Envie para o repositório
git push origin main
```

**Status esperado**: Render fará deploy automático (3-5 minutos)

---

### Frontend
```powershell
# Navegue para a pasta Frontend
cd "C:\Users\Thiago Figueredo\Documents\DSMIIII\ToDo\Frontend"

# Adicione todos os arquivos
git add .

# Faça commit
git commit -m "feat: Implementar detecção automática de tenant por subdomínio

- Add: Funções detectAccessType, getCurrentTenant em config/api.js
- Update: ProtectedRoute com validação de domínio para super-admin
- Update: FomeZapExact, Checkout, PedidoConfirmado para usar subdomínio
- Remove: Necessidade de ?tenant= nas URLs
- Security: Super-admin bloqueado fora de manager.fomezap.com"

# Envie para o repositório
git push origin main
```

**Status esperado**: Vercel fará deploy automático (2-3 minutos)

---

## 🌐 PASSO 2: Configurar DNS no Cloudflare

### 2.1 Acessar Cloudflare
1. Abra: https://dash.cloudflare.com
2. Login com sua conta
3. Selecione o domínio: **fomezap.com**
4. Vá em: **DNS** > **Records**

### 2.2 Criar CNAME para Manager
Clique em **Add record** e preencha:
```
Type: CNAME
Name: manager
Target: fomezap.vercel.app
Proxy status: DNS only (ícone CINZA - desativado)
TTL: Auto
```
Clique em **Save**

### 2.3 Criar CNAME para Tenant bkjau (exemplo)
Clique em **Add record** e preencha:
```
Type: CNAME
Name: bkjau
Target: fomezap.vercel.app
Proxy status: DNS only (ícone CINZA - desativado)
TTL: Auto
```
Clique em **Save**

**Repita para cada tenant que criar!**

---

## ☁️ PASSO 3: Adicionar Domínios na Vercel

### 3.1 Acessar Vercel
1. Abra: https://vercel.com/dashboard
2. Login com sua conta
3. Selecione o projeto: **FomeZap Frontend**
4. Vá em: **Settings** > **Domains**

### 3.2 Adicionar Manager
1. Clique em **Add Domain**
2. Digite: `manager.fomezap.com`
3. Clique em **Add**
4. Aguarde verificação (automática se DNS correto)

### 3.3 Adicionar Tenant bkjau
1. Clique em **Add Domain**
2. Digite: `bkjau.fomezap.com`
3. Clique em **Add**
4. Aguarde verificação

**Repita para cada tenant!**

---

## 🧪 PASSO 4: Verificar DNS (Aguarde 5-10 minutos após criar CNAME)

### PowerShell - Verificar se DNS propagou
```powershell
# Verificar manager
nslookup manager.fomezap.com

# Verificar tenant
nslookup bkjau.fomezap.com

# Se necessário, limpar cache DNS
Clear-DnsClientCache
```

**Resultado esperado**:
```
Name: manager.fomezap.com
CNAME: fomezap.vercel.app
Address: [IP da Vercel]
```

---

## ✅ PASSO 5: Testar Tudo

### 5.1 Testar Manager (Super Admin)
```powershell
# Testar conexão
Test-NetConnection manager.fomezap.com -Port 443

# Ou abra no navegador:
# https://manager.fomezap.com/login
```

**Checklist**:
- [ ] Login carrega corretamente
- [ ] Login com super-admin funciona
- [ ] Redireciona para `/super-admin` após login
- [ ] Painel de tenants carrega

### 5.2 Testar Tenant (Cardápio)
```powershell
# Abra no navegador:
# https://bkjau.fomezap.com
```

**Checklist**:
- [ ] Cardápio carrega automaticamente (sem ?tenant=)
- [ ] Produtos aparecem
- [ ] Adicionar ao carrinho funciona
- [ ] Checkout funciona

### 5.3 Testar Segurança (CRÍTICO)
```powershell
# Abra no navegador:
# https://bkjau.fomezap.com/login
```

1. Faça login com **credenciais de super-admin**
2. Tente acessar: `https://bkjau.fomezap.com/super-admin`

**Resultado esperado**: 
- ❌ Deve mostrar tela de "Acesso Negado"
- ✅ Só deve funcionar em manager.fomezap.com

### 5.4 Testar Sites Existentes (NÃO DEVEM MUDAR)
```powershell
# Abra no navegador:
# https://fomezap.com
# https://lanchoneteemfamilia.fomezap.com
```

**Checklist**:
- [ ] fomezap.com continua funcionando
- [ ] lanchoneteemfamilia.fomezap.com continua funcionando

---

## 🔄 PASSO 6: Criar Novo Tenant (Processo Completo)

### 6.1 Criar no Painel Super-Admin
1. Acesse: `https://manager.fomezap.com/super-admin/tenants`
2. Clique em **+ Criar Novo Tenant**
3. Preencha:
   ```
   Nome: Lanches da Maria
   Slug: lanches-maria
   Email: admin@lanchesmaria.com
   Senha: [gere senha segura]
   Telefone: (11) 99999-9999
   ```
4. Clique em **Criar**

### 6.2 Configurar DNS (Cloudflare)
```
Type: CNAME
Name: lanches-maria
Target: fomezap.vercel.app
Proxy: DNS only (cinza)
```

### 6.3 Adicionar Domínio (Vercel)
```
Add Domain: lanches-maria.fomezap.com
```

### 6.4 Aguardar Propagação
```powershell
# Testar DNS
nslookup lanches-maria.fomezap.com
```

### 6.5 Testar e Enviar ao Cliente
```
URL Cardápio: https://lanches-maria.fomezap.com
URL Admin: https://lanches-maria.fomezap.com/login
Email: admin@lanchesmaria.com
Senha: [senha gerada]
```

---

## 📊 PASSO 7: Monitorar Logs

### Backend (Render)
1. Acesse: https://dashboard.render.com
2. Selecione o serviço: **FomeZap Backend**
3. Vá em: **Logs**
4. Procure por:
   ```
   ✅ Domínio manager validado
   🚫 ACESSO NEGADO: Tentativa de acessar super-admin
   ```

### Frontend (Vercel)
1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto: **FomeZap Frontend**
3. Vá em: **Deployments**
4. Verifique se o último deploy foi bem-sucedido

---

## 🐛 Troubleshooting Rápido

### DNS não resolve
```powershell
# Limpar cache
Clear-DnsClientCache

# Verificar DNS
nslookup manager.fomezap.com

# Aguardar propagação (até 48h)
```

### Super-admin acessa tenant
```powershell
# Verificar se backend foi deployado
# Abra: https://fomezap-api.onrender.com/health

# Limpar cache do navegador
# Chrome: Ctrl+Shift+Delete > Limpar cache
```

### Tenant não carrega cardápio
```powershell
# Verificar se tenant existe
# F12 > Console > Ver logs

# Verificar backend
# https://fomezap-api.onrender.com/health
```

---

## 📞 Suporte

Se algo não funcionar:
1. Verifique os logs (F12 no navegador)
2. Verifique backend: `https://fomezap-api.onrender.com/health`
3. Consulte: `GUIA-SUBDOMINIOS-COMPLETO.md`
4. Consulte: `RESUMO-IMPLEMENTACAO.md`

---

**Checklist Final**:
- [ ] Backend deployado (Render)
- [ ] Frontend deployado (Vercel)
- [ ] DNS manager configurado (Cloudflare)
- [ ] DNS tenants configurados (Cloudflare)
- [ ] Domínios adicionados (Vercel)
- [ ] Manager testado e funcionando
- [ ] Tenants testados e funcionando
- [ ] Segurança testada (super-admin isolado)
- [ ] Sites existentes intocados

**Última atualização**: Novembro 2025
