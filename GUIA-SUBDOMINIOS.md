# 🌐 Guia Completo: Subdomínios Multi-Tenant FomeZap

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Como Funciona](#como-funciona)
3. [Configuração Local (Desenvolvimento)](#configuração-local)
4. [Configuração Produção (Vercel/Render)](#configuração-produção)
5. [DNS e Domínio](#dns-e-domínio)

---

## 🎯 Visão Geral

### Modelo Atual (Query Parameter)
```
http://localhost:5173/?tenant=6918ee399a1d5b537b27b3bb
```

### Modelo com Subdomínio (Objetivo)
```
https://lanchonete-central-2.fomezap.com
https://burguer-king.fomezap.com
https://demo.fomezap.com
```

**Vantagens:**
- ✅ URLs mais limpas e profissionais
- ✅ Melhor SEO (cada tenant tem seu próprio domínio)
- ✅ Isolamento visual melhor
- ✅ Branding mais forte para cada cliente

---

## ⚙️ Como Funciona

### 1. **Tenant Model**
Cada tenant tem um `slug` único:
```javascript
{
  tenantId: "6918ee399a1d5b537b27b3bb",
  nome: "Lanchonete Central 2",
  slug: "lanchonete-central-2",  // ← usado como subdomínio
  // ...
}
```

### 2. **Detecção de Tenant (Backend)**
O middleware `detectarTenant.js` identifica o tenant por:
1. **Subdomínio** (produção): `lanchonete-central-2.fomezap.com` → busca tenant com `slug: "lanchonete-central-2"`
2. **Query Parameter** (desenvolvimento): `?tenant=6918ee399a1d5b537b27b3bb`
3. **Header** (API/mobile): `X-Tenant-Id: 6918ee399a1d5b537b27b3bb`

### 3. **Fluxo Completo**
```
Usuário acessa: lanchonete-central-2.fomezap.com
                        ↓
           Backend detecta subdomain: "lanchonete-central-2"
                        ↓
      Busca tenant com slug: "lanchonete-central-2"
                        ↓
          Retorna dados do tenant correto
```

---

## 🏠 Configuração Local (Desenvolvimento)

### Opção 1: Continuar usando Query Parameter (Mais Simples)
```
http://localhost:5173/?tenant=6918ee399a1d5b537b27b3bb
```
✅ Já funciona!
✅ Não precisa configurar nada

### Opção 2: Simular Subdomínios Localmente

#### A. Editar arquivo `hosts` (Windows)
```powershell
# Executar PowerShell como Administrador
notepad C:\Windows\System32\drivers\etc\hosts
```

Adicionar:
```
127.0.0.1    lanchonete-central-2.localhost
127.0.0.1    burguer-king.localhost
127.0.0.1    demo.localhost
```

#### B. Configurar CORS no Backend
```javascript
// Backend/.env
CORS_ORIGINS=http://localhost:5173,http://lanchonete-central-2.localhost:5173,http://demo.localhost:5173
```

#### C. Acessar
```
http://lanchonete-central-2.localhost:5173
http://demo.localhost:5173
```

---

## 🌍 Configuração Produção (Vercel/Render)

### 1. **Comprar Domínio**
Exemplo: `fomezap.com` (Registro.br, GoDaddy, Namecheap, etc)

### 2. **Configurar DNS (Wildcard)**

No painel do provedor DNS, adicionar registro **A** ou **CNAME**:

```
Tipo: CNAME
Nome: *
Valor: fomezap.vercel.app  (ou seu domínio Vercel)
TTL: 3600
```

Isso permite que **QUALQUER** subdomínio aponte para seu app:
- `lanchonete-central-2.fomezap.com` ✅
- `burguer-king.fomezap.com` ✅
- `qualquer-coisa.fomezap.com` ✅

### 3. **Configurar Vercel (Frontend)**

#### A. Adicionar Domínio Wildcard
```bash
# Via CLI
vercel domains add *.fomezap.com

# Ou no painel Vercel:
Settings → Domains → Add *.fomezap.com
```

#### B. Configurar `vercel.json`
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "wildcard": [
    {
      "domain": "*.fomezap.com",
      "value": "fomezap.vercel.app"
    }
  ]
}
```

### 4. **Configurar Render (Backend)**

#### A. Variáveis de Ambiente
```
CORS_ORIGINS=https://fomezap.com,https://*.fomezap.com,https://lanchonete-central-2.fomezap.com
```

#### B. Custom Domain
```
Settings → Custom Domains → Add api.fomezap.com
```

### 5. **Atualizar Frontend para usar subdomínio**

```javascript
// Frontend/src/config/api.js
const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://api.fomezap.com'  // Backend em subdomínio fixo
  : 'http://localhost:5000';
```

---

## 🔧 Estrutura de Domínios Recomendada

```
fomezap.com                          → Landing page / Site institucional
app.fomezap.com                      → Painel admin (login)
api.fomezap.com                      → API Backend

# Tenants (clientes):
lanchonete-central-2.fomezap.com     → Cardápio público do cliente
burguer-king.fomezap.com             → Cardápio público do cliente
demo.fomezap.com                     → Tenant de demonstração
```

---

## 📝 Checklist de Implementação

### Desenvolvimento (Local)
- [x] Middleware `detectarTenant.js` criado
- [x] Backend detecta tenant por query parameter
- [ ] (Opcional) Configurar hosts locais para subdomínios
- [ ] Testar com `?tenant=ID` funcionando

### Produção
- [ ] Comprar domínio `fomezap.com`
- [ ] Configurar DNS wildcard `*.fomezap.com`
- [ ] Adicionar domínio wildcard no Vercel
- [ ] Configurar `api.fomezap.com` no Render
- [ ] Atualizar CORS com domínios corretos
- [ ] Testar subdomínios em produção

---

## 🧪 Como Testar

### Teste 1: Query Parameter (Atual)
```
http://localhost:5173/?tenant=6918ee399a1d5b537b27b3bb
```

### Teste 2: Subdomínio Local (Opcional)
```
http://lanchonete-central-2.localhost:5173
```

### Teste 3: Produção (Após configurar DNS)
```
https://lanchonete-central-2.fomezap.com
```

---

## 💡 Recomendação

**Para agora (Desenvolvimento):**
✅ Continue usando query parameter: `?tenant=ID`
✅ Mais simples, rápido e funcional

**Para produção (Quando tiver domínio):**
✅ Implemente subdomínios
✅ URLs mais profissionais
✅ Melhor experiência para clientes

---

## 🆘 Troubleshooting

### Problema: "Tenant não encontrado"
- Verificar se o slug está correto no banco
- Verificar se o middleware está sendo chamado
- Checar logs do backend

### Problema: CORS error
- Adicionar o domínio completo em `CORS_ORIGINS`
- Incluir wildcard se necessário: `https://*.fomezap.com`

### Problema: Subdomínio não funciona localmente
- Verificar arquivo `hosts`
- Reiniciar navegador após editar hosts
- Testar com `ping lanchonete-central-2.localhost`

---

## 📚 Recursos Adicionais

- [Vercel Custom Domains](https://vercel.com/docs/concepts/projects/domains)
- [Wildcard DNS](https://en.wikipedia.org/wiki/Wildcard_DNS_record)
- [Multi-tenant Architecture](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

---

**Última atualização:** 15/11/2025
