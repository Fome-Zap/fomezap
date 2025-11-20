# 🌐 Guia Completo: Subdomínios Multi-Tenant FomeZap

## 📋 Visão Geral

Este guia detalha como configurar e usar o sistema de subdomínios do FomeZap, mantendo seus sites existentes (fomezap.com e lanchoneteemfamilia.fomezap.com) intocados no HostGator.

---

## 🎯 Arquitetura de Subdomínios

### Sites que PERMANECEM no HostGator (NÃO ALTERAR)
- ✅ **fomezap.com** - Site institucional (hardcoded HTML/CSS/JS)
- ✅ **lanchoneteemfamilia.fomezap.com** - Site de cliente existente (hardcoded HTML/CSS/JS)

### Novos Subdomínios do Sistema SaaS (Vercel)
- 🔒 **manager.fomezap.com** - Painel Super Admin (EXCLUSIVO)
- 🍔 **[slug].fomezap.com** - Cardápios dos tenants (ex: bkjau.fomezap.com)

---

## 🔐 Segurança Implementada

### 1. Isolamento do Super Admin
- ✅ Rota `/super-admin` **SOMENTE** acessível em `manager.fomezap.com`
- ✅ Validação de domínio no backend (middleware `validarDominioManager`)
- ✅ Validação de domínio no frontend (ProtectedRoute)
- ✅ Bloqueio de acesso com credenciais super-admin em outros subdomínios

### 2. Detecção Automática de Tenant
- ✅ Frontend detecta automaticamente o slug pelo subdomínio
- ✅ Não é mais necessário usar `?tenant=slug` na URL
- ✅ URLs amigáveis: `bkjau.fomezap.com` (não precisa `/bkjau?tenant=bkjau`)

### 3. Isolamento de Tenants
- ✅ Cada tenant tem seu próprio subdomínio
- ✅ Cardápios isolados por slug
- ✅ Painel admin isolado por autenticação JWT

---

## ⚙️ Configuração DNS no Cloudflare

### Passo 1: Acessar Cloudflare DNS
1. Login em [cloudflare.com](https://cloudflare.com)
2. Selecione o domínio `fomezap.com`
3. Vá em **DNS** > **Records**

### Passo 2: Criar Registro para Manager (Super Admin)
```
Tipo: CNAME
Nome: manager
Destino: fomezap.vercel.app
TTL: Auto
Proxy: ❌ Desativado (ícone cinza)
```

### Passo 3: Criar Registros para Tenants
Para cada tenant criado, adicione um CNAME:

**Exemplo: Tenant "bkjau"**
```
Tipo: CNAME
Nome: bkjau
Destino: fomezap.vercel.app
TTL: Auto
Proxy: ❌ Desativado (ícone cinza)
```

**Exemplo: Tenant "lanches-central"**
```
Tipo: CNAME
Nome: lanches-central
Destino: fomezap.vercel.app
TTL: Auto
Proxy: ❌ Desativado (ícone cinza)
```

### Passo 4: Verificar Registros Existentes (NÃO ALTERAR)
Certifique-se de que os registros abaixo permanecem intocados:
- `fomezap.com` → (A record para HostGator)
- `lanchoneteemfamilia` → (CNAME ou A record para HostGator)

---

## 🚀 Configuração na Vercel

### Passo 1: Adicionar Domínios ao Projeto
1. Acesse [vercel.com](https://vercel.com)
2. Vá no projeto **FomeZap Frontend**
3. Clique em **Settings** > **Domains**

### Passo 2: Adicionar Manager
1. Clique em **Add Domain**
2. Digite: `manager.fomezap.com`
3. Clique em **Add**
4. Vercel vai verificar automaticamente (se CNAME estiver correto no Cloudflare)

### Passo 3: Adicionar Subdomínios de Tenants
Para cada tenant, adicione o subdomínio:
1. Clique em **Add Domain**
2. Digite: `bkjau.fomezap.com` (exemplo)
3. Clique em **Add**
4. Vercel vai verificar automaticamente

### Passo 4: Aguardar Propagação
- Pode levar de 5 minutos até 48 horas
- Teste com: `https://manager.fomezap.com`
- Teste com: `https://bkjau.fomezap.com`

---

## 🧪 Testar Configuração

### 1. Verificar DNS (Local)
Abra o PowerShell e execute:
```powershell
nslookup manager.fomezap.com
nslookup bkjau.fomezap.com
```

**Resultado esperado:**
```
Name: manager.fomezap.com
Address: [IP da Vercel]
CNAME: fomezap.vercel.app
```

### 2. Testar Manager (Super Admin)
1. Acesse: `https://manager.fomezap.com/login`
2. Faça login com credenciais de super-admin
3. Acesse: `https://manager.fomezap.com/super-admin`
4. ✅ Deve abrir o painel de tenants

### 3. Testar Tenant
1. Acesse: `https://bkjau.fomezap.com`
2. ✅ Deve abrir o cardápio do Burger King automaticamente
3. ❌ NÃO deve precisar de `?tenant=bkjau`

### 4. Testar Segurança (Crítico)
1. Acesse: `https://bkjau.fomezap.com/login`
2. Faça login com credenciais de super-admin
3. Tente acessar: `https://bkjau.fomezap.com/super-admin`
4. ✅ Deve mostrar **"Acesso Negado"** (super-admin só funciona em manager.fomezap.com)

---

## 📊 Fluxo de Criação de Novo Tenant

### 1. Criar Tenant no Painel Super Admin
1. Acesse: `https://manager.fomezap.com/super-admin`
2. Vá em **Gerenciar Tenants**
3. Clique em **+ Criar Novo Tenant**
4. Preencha:
   - Nome: `Lanches da Maria`
   - Slug: `lanches-maria` (URL amigável)
   - Email do admin: `admin@lanchesmaria.com`
   - Senha: (gerar senha segura)
5. Clique em **Criar Tenant**

### 2. Configurar DNS no Cloudflare
1. Vá no Cloudflare DNS
2. Adicione CNAME:
   ```
   Nome: lanches-maria
   Destino: fomezap.vercel.app
   Proxy: Desativado
   ```

### 3. Adicionar Domínio na Vercel
1. Vá nas configurações do projeto Vercel
2. Adicione: `lanches-maria.fomezap.com`

### 4. Enviar Credenciais ao Cliente
Envie ao cliente:
- **URL do cardápio**: `https://lanches-maria.fomezap.com`
- **URL do painel admin**: `https://lanches-maria.fomezap.com/login`
- **Email**: `admin@lanchesmaria.com`
- **Senha**: [senha gerada]

---

## 🔧 Comandos Úteis

### Verificar DNS (PowerShell)
```powershell
# Verificar um subdomínio específico
nslookup manager.fomezap.com

# Verificar tenant
nslookup bkjau.fomezap.com

# Forçar limpeza de cache DNS
Clear-DnsClientCache
```

### Testar Conexão (PowerShell)
```powershell
# Testar se o domínio está acessível
Test-NetConnection manager.fomezap.com -Port 443

# Testar HTTP
Invoke-WebRequest -Uri https://manager.fomezap.com -UseBasicParsing
```

---

## 🐛 Troubleshooting

### Problema: "Não foi possível carregar o cardápio"
**Causa**: Tenant não encontrado ou backend offline

**Solução**:
1. Verifique se o tenant existe no banco de dados
2. Verifique se o backend está rodando: `https://fomezap-api.onrender.com/health`
3. Verifique os logs do console do navegador (F12)

### Problema: Super-admin consegue acessar /super-admin em outro subdomínio
**Causa**: Validação de domínio não está funcionando

**Solução**:
1. Verifique se o backend foi atualizado com o middleware `validarDominioManager`
2. Verifique se o frontend ProtectedRoute está validando o domínio
3. Faça um hard refresh (Ctrl+F5) no navegador

### Problema: Subdomínio não carrega (DNS_PROBE_FINISHED_NXDOMAIN)
**Causa**: DNS não propagou ou CNAME incorreto

**Solução**:
1. Verifique o CNAME no Cloudflare
2. Aguarde propagação (até 48h)
3. Limpe cache DNS: `Clear-DnsClientCache`
4. Teste com: `nslookup [subdominio].fomezap.com`

### Problema: SSL/HTTPS não funciona
**Causa**: Proxy do Cloudflare ativado ou certificado não emitido

**Solução**:
1. Desative o proxy no Cloudflare (ícone cinza)
2. Aguarde a Vercel emitir certificado SSL (até 24h)
3. Force HTTPS nas configurações da Vercel

---

## 📱 URLs Finais

### Super Admin
- **Login**: `https://manager.fomezap.com/login`
- **Dashboard**: `https://manager.fomezap.com/super-admin`
- **Gerenciar Tenants**: `https://manager.fomezap.com/super-admin/tenants`

### Tenants (Exemplo)
- **Cardápio**: `https://bkjau.fomezap.com`
- **Login Admin**: `https://bkjau.fomezap.com/login`
- **Painel Admin**: `https://bkjau.fomezap.com/admin`
- **Produtos**: `https://bkjau.fomezap.com/admin/produtos`

### Sites Existentes (NÃO ALTERAR)
- **Site Institucional**: `https://fomezap.com`
- **Cliente Família**: `https://lanchoneteemfamilia.fomezap.com`

---

## ✅ Checklist de Configuração

### Cloudflare DNS
- [ ] CNAME `manager` criado e apontando para `fomezap.vercel.app`
- [ ] Proxy desativado (ícone cinza) para `manager`
- [ ] CNAME criado para cada tenant
- [ ] Registros de `fomezap.com` e `lanchoneteemfamilia` intocados

### Vercel Domains
- [ ] `manager.fomezap.com` adicionado e verificado
- [ ] Subdomínio de cada tenant adicionado
- [ ] Certificado SSL emitido para todos os domínios

### Testes de Segurança
- [ ] Super-admin acessa `/super-admin` em `manager.fomezap.com` ✅
- [ ] Super-admin NÃO acessa `/super-admin` em tenants ❌
- [ ] Cada tenant acessa apenas seu próprio painel admin

### Testes de Funcionalidade
- [ ] Cardápios carregam automaticamente por subdomínio
- [ ] Não é necessário `?tenant=slug` na URL
- [ ] Login funciona corretamente em cada subdomínio
- [ ] Checkout e pedidos funcionam normalmente

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do console (F12 no navegador)
2. Verifique os logs do backend (Render)
3. Consulte este guia novamente
4. Entre em contato com o desenvolvedor

---

**Última atualização**: Novembro 2025
**Versão**: 2.0 - Multi-Tenant com Subdomínios
