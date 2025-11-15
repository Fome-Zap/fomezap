# 🎯 COMO FUNCIONA A DETECÇÃO DE TENANT - FOMEZAP

## 📊 VISÃO GERAL DO FLUXO

```
Cliente acessa → Vercel (Frontend) → Render (Backend) → MongoDB Atlas
                    ↓
          Detecta subdomínio
                    ↓
          Carrega dados do tenant correto
```

---

## 🌐 CENÁRIOS DE ACESSO

### **1. PRODUÇÃO - Subdomínio (Recomendado)**

**Exemplo:** `https://familia.fomezap.com`

**Como funciona:**
1. Cliente acessa `familia.fomezap.com`
2. Cloudflare DNS resolve para Vercel
3. Vercel serve o React (mesmo código para todos os tenants)
4. React faz requisição para backend: `GET /api/cardapio/categorias`
5. Backend recebe request com `Host: familia.fomezap.com`
6. Middleware `detectarTenant` extrai subdomínio: `familia`
7. Busca no banco: `Tenant.findOne({ slug: 'familia' })`
8. Anexa `req.tenantId`, `req.tenant` ao request
9. Controller usa `req.tenantId` para buscar dados
10. Retorna categorias do tenant "familia"

**Código do middleware:**
```javascript
const host = req.get('host'); // familia.fomezap.com
const subdomain = host.split('.')[0]; // familia
tenant = await Tenant.findOne({ slug: subdomain });
```

---

### **2. DESENVOLVIMENTO - Query Parameter**

**Exemplo:** `http://localhost:5173/?tenant=familia`

**Como funciona:**
1. Frontend detecta `?tenant=familia` na URL
2. Armazena no contexto do React
3. Faz requisições com tenantId: `GET /api/familia/cardapio/categorias`
4. Backend usa parâmetro da rota: `req.params.tenantId`

**Alternativa (detecção automática):**
```
http://localhost:5173/?tenant=familia
Backend recebe: req.query.tenant = "familia"
Middleware detecta e anexa req.tenantId
```

---

### **3. API/MOBILE - Header Customizado**

**Exemplo:** Apps mobile ou integrações

**Como funciona:**
```javascript
fetch('https://api.fomezap.com/api/cardapio/categorias', {
  headers: {
    'X-Tenant-Id': 'familia'
  }
})
```

Backend lê: `req.headers['x-tenant-id']`

---

## 🔧 CONFIGURAÇÃO TÉCNICA

### **DNS (Cloudflare)**

Para cada tenant, criar registro CNAME:

```
Tipo: CNAME
Nome: familia
Destino: 6f18889eb016d06a.vercel-dns-017.com
Proxy: Desligado (DNS only)
TTL: Auto
```

**Por que o mesmo CNAME para todos os subdomínios?**
- Vercel usa CNAME único por projeto
- Não importa quantos subdomínios você adicione
- Todos apontam para o mesmo CNAME da Vercel
- Vercel roteia internamente baseado no `Host` header

---

### **Vercel (Frontend)**

**Adicionar domínios:**
1. Settings → Domains
2. Add Domain: `familia.fomezap.com`
3. Vercel valida DNS automaticamente
4. Emite certificado SSL (Let's Encrypt)

**Todos os subdomínios servem o MESMO código React!**
- Vercel não diferencia por subdomínio
- React detecta tenant no backend via API
- Carrega dados dinamicamente

---

### **Render (Backend)**

**Variáveis de ambiente:**
```env
CORS_ORIGINS=https://demo.fomezap.com,https://familia.fomezap.com,https://thi-burg.fomezap.com
```

**IMPORTANTE:** Adicionar CADA subdomínio ao CORS!

**Por que não usar wildcard `*.fomezap.com`?**
- CORS não suporta wildcard com credentials
- Regex no código funciona, mas é melhor listar explicitamente

---

### **MongoDB Atlas (Banco de Dados)**

**Estrutura de Tenant:**
```javascript
{
  tenantId: "familia",        // ID único (pode ser ObjectId ou string)
  slug: "familia",            // Usado no subdomínio (familia.fomezap.com)
  nome: "Lanchonete em Família",
  status: "ativo",
  // ... outros campos
}
```

**REGRA CRÍTICA:** 
- `slug` deve ser único
- `slug` deve ser lowercase, sem espaços, sem acentos
- `slug` é usado para detecção no subdomínio

---

## 🔍 ORDEM DE DETECÇÃO DO MIDDLEWARE

O middleware `detectarTenant` tenta 3 métodos na ordem:

```javascript
// 1. Subdomínio (PRODUÇÃO)
const subdomain = req.get('host').split('.')[0];
tenant = await Tenant.findOne({ slug: subdomain });

// 2. Query Parameter (DESENVOLVIMENTO)
if (!tenant && req.query.tenant) {
  tenant = await Tenant.findOne({ tenantId: req.query.tenant });
}

// 3. Header (API/MOBILE)
if (!tenant && req.headers['x-tenant-id']) {
  tenant = await Tenant.findOne({ tenantId: req.headers['x-tenant-id'] });
}
```

---

## 🚀 FLUXO COMPLETO DE REQUEST

### **Exemplo Real: Cliente acessa cardápio**

**1. Cliente digita:** `familia.fomezap.com`

**2. DNS (Cloudflare):**
```
familia.fomezap.com → CNAME → 6f18889eb016d06a.vercel-dns-017.com
```

**3. Vercel (Frontend):**
- Serve `index.html` + React bundle
- React carrega no navegador do cliente

**4. React faz requisição:**
```javascript
axios.get('/api/cardapio/categorias')
// Host header: familia.fomezap.com
```

**5. Backend (Render):**
```javascript
// Middleware detectarTenant
app.use(detectarTenant); // Executa PRIMEIRO

// Request chega:
req.get('host') = "familia.fomezap.com"

// Middleware extrai:
subdomain = "familia"

// Busca no banco:
tenant = await Tenant.findOne({ slug: "familia" })
// Encontra: { tenantId: "familia", nome: "Lanchonete em Família", ... }

// Anexa ao request:
req.tenant = tenant
req.tenantId = "familia"
req.tenantSlug = "familia"

// Passa para próximo middleware/rota
next()
```

**6. Rota Pública:**
```javascript
router.get("/cardapio/categorias", validarTenantPublico, AdminController.listarCategorias);

// validarTenantPublico usa req.tenantId já detectado
// Controller busca: Categoria.find({ tenantId: "familia" })
```

**7. Resposta:**
```json
[
  { "nome": "Lanches", "icone": "🍔", "tenantId": "familia" },
  { "nome": "Bebidas", "icone": "🥤", "tenantId": "familia" },
  { "nome": "Porções", "icone": "🍟", "tenantId": "familia" }
]
```

**8. React renderiza:**
- Mostra categorias da "Lanchonete em Família"
- Cliente vê apenas dados do seu tenant
- Isolamento total de dados

---

## 🛡️ SEGURANÇA E ISOLAMENTO

### **Como garantir que tenant A não veja dados do tenant B?**

**1. Detecção automática:**
```javascript
// Middleware detecta automaticamente pelo subdomínio
// Cliente não pode "mentir" o Host header
req.tenantId = detectadoAutomaticamente();
```

**2. Filtro em todas as queries:**
```javascript
// Toda busca no banco filtra por tenantId
Categoria.find({ tenantId: req.tenantId })
Produto.find({ tenantId: req.tenantId })
Pedido.find({ tenantId: req.tenantId })
```

**3. Validação de propriedade:**
```javascript
// Admin só edita dados do seu próprio tenant
if (user.tenantId !== req.tenantId) {
  return res.status(403).json({ error: 'Sem permissão' });
}
```

---

## 📋 CHECKLIST DE CONFIGURAÇÃO POR TENANT

Para adicionar novo tenant `novo-slug`:

- [ ] **MongoDB:** Criar tenant com `slug: "novo-slug"`
  ```bash
  node criarNovoTenant.js "Nome do Restaurante"
  ```

- [ ] **Cloudflare:** Adicionar DNS
  ```
  CNAME: novo-slug → 6f18889eb016d06a.vercel-dns-017.com
  ```

- [ ] **Vercel:** Adicionar domínio
  ```
  Settings → Domains → Add: novo-slug.fomezap.com
  ```

- [ ] **Render:** Atualizar CORS
  ```env
  CORS_ORIGINS=...,https://novo-slug.fomezap.com
  ```

- [ ] **Testar:** Acessar e verificar
  ```
  https://novo-slug.fomezap.com
  ```

---

## 🐛 TROUBLESHOOTING

### **Problema: "Tenant não encontrado"**
**Causa:** Slug no banco diferente do subdomínio
**Solução:** 
```javascript
// Verificar no banco:
db.tenants.find({ slug: "familia" })

// Corrigir se necessário:
db.tenants.updateOne(
  { tenantId: "familia" },
  { $set: { slug: "familia" } }
)
```

### **Problema: CORS error**
**Causa:** Subdomínio não está no CORS_ORIGINS
**Solução:** Adicionar no Render:
```env
CORS_ORIGINS=https://demo.fomezap.com,https://familia.fomezap.com
```

### **Problema: SSL certificate error**
**Causa:** Vercel ainda emitindo certificado
**Solução:** Aguardar 5-10 minutos após adicionar domínio

### **Problema: Carrega dados errados**
**Causa:** Middleware detectando tenant errado
**Solução:** Verificar logs do backend:
```javascript
console.log('🌐 Tenant detectado:', req.tenantSlug, '→', req.tenantId);
```

---

## 📊 TABELA DE MAPEAMENTO (SITUAÇÃO ATUAL)

| Subdomínio | Slug no Banco | TenantId | Status | Ação Necessária |
|------------|---------------|----------|--------|-----------------|
| `demo.fomezap.com` | `demo` | `demo` | ✅ OK | Nenhuma |
| `familia.fomezap.com` | `lanchonete-em-familia` | `familia` | ⚠️ ERRO | ❌ Corrigir slug para "familia" |
| `thi-burg.fomezap.com` | `thi-burg` | `thi-burg` | ✅ OK | Nenhuma |

**AÇÃO URGENTE:** Rodar script `corrigirSlugFamilia.js` para corrigir!

---

## 🎓 RESUMO CONCEITUAL

**Multi-tenant = Múltiplos clientes, 1 código, 1 banco**

- ✅ Cada cliente tem subdomínio próprio
- ✅ Vercel serve o MESMO React para todos
- ✅ Backend detecta tenant pelo subdomínio
- ✅ MongoDB filtra dados por tenantId
- ✅ Isolamento total de dados
- ✅ Escalável infinitamente (só criar DNS + tenant no banco)

**Por que funciona?**
- DNS aponta todos os subdomínios para Vercel
- Vercel não "sabe" de tenants, só serve React
- React pede dados ao backend
- Backend detecta tenant e filtra dados
- Cliente vê apenas seus próprios dados

---

**Data de criação:** 15 de Novembro de 2025  
**Versão:** 1.0  
**Autor:** Sistema FomeZap Multi-Tenant
