# 🎨 Arquitetura Visual do Sistema Multi-Tenant FomeZap

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DOMÍNIO: fomezap.com                           │
│                         DNS GERENCIADO: Cloudflare                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
         ┌──────────▼──────────┐       ┌───────────▼────────────┐
         │   SITES EXISTENTES  │       │   SISTEMA SAAS NOVO    │
         │   (HostGator)       │       │   (Vercel + Render)    │
         │   NÃO ALTERAR! ✅   │       │   Multi-Tenant 🚀      │
         └─────────────────────┘       └────────────────────────┘
                  │                                 │
          ┌───────┴────────┐         ┌─────────────┴──────────────┐
          │                │         │                            │
    ┌─────▼─────┐  ┌──────▼──────┐  │    ┌──────────────────┐   │
    │           │  │             │  │    │  Manager Domain  │   │
    │ fomezap   │  │ lanchonete  │  │    │ (Super Admin)    │   │
    │   .com    │  │ emfamilia   │  │    └──────────────────┘   │
    │           │  │ .fomezap    │  │             │              │
    │  (HTML)   │  │   .com      │  │    ┌────────▼────────┐    │
    │           │  │  (HTML)     │  │    │ manager.fomezap │    │
    └───────────┘  └─────────────┘  │    │     .com        │    │
                                     │    │                 │    │
    Site            Cliente          │    │  🔒 ISOLADO     │    │
    Institucional   Família          │    │  Validação de   │    │
                                     │    │  Domínio        │    │
                                     │    └─────────────────┘    │
                                     │                            │
                                     │    ┌──────────────────┐   │
                                     │    │  Tenant Domains  │   │
                                     │    │  (Cardápios)     │   │
                                     │    └──────────────────┘   │
                                     │             │              │
                                     │    ┌────────┴────────┐    │
                                     │    │                 │    │
                                     │  ┌─▼──┐  ┌──▼─┐  ┌──▼──┐ │
                                     │  │bkjau│ │ ln2 │ │ ln3 │ │
                                     │  │.fome│ │.fome│ │.fome│ │
                                     │  │zap  │ │ zap │ │ zap │ │
                                     │  │.com │ │.com │ │.com │ │
                                     │  └─────┘ └─────┘ └─────┘ │
                                     │    ▲       ▲       ▲     │
                                     │    │       │       │     │
                                     └────┼───────┼───────┼─────┘
                                          │       │       │
                                     Cada tenant tem
                                     seu subdomínio
                                     Detecção automática
                                     URLs amigáveis
```

---

## 🔄 Fluxo de Requisição

### 1️⃣ Acesso ao Manager (Super Admin)
```
👤 Usuário
   │
   │ https://manager.fomezap.com/login
   ▼
🌐 Cloudflare DNS
   │ CNAME: manager → fomezap.vercel.app
   ▼
☁️ Vercel (Frontend)
   │ Detecta: isManagerDomain() = true
   │ Carrega: Página de Login
   ▼
👤 Login com super-admin
   │
   │ POST /api/auth/login
   ▼
🔧 Render (Backend)
   │ Valida credenciais
   │ Retorna JWT com role: 'super_admin'
   ▼
☁️ Vercel (Frontend)
   │ Salva token
   │ Redireciona: /super-admin
   ▼
🔒 ProtectedRoute
   │ Verifica: isManagerDomain() = true ✅
   │ Verifica: user.role = 'super_admin' ✅
   │ Permite acesso
   ▼
📊 Dashboard Super Admin
   │ Lista tenants
   │ Cria tenants
   │ Gerencia sistema
```

### 2️⃣ Acesso ao Tenant (Cardápio)
```
🍔 Cliente
   │
   │ https://bkjau.fomezap.com
   ▼
🌐 Cloudflare DNS
   │ CNAME: bkjau → fomezap.vercel.app
   ▼
☁️ Vercel (Frontend)
   │ Detecta: getCurrentTenant() = 'bkjau'
   │ Carrega: FomeZapExact
   ▼
📡 Requisição ao Backend
   │ GET /api/bkjau/cardapio/produtos
   ▼
🔧 Render (Backend)
   │ Middleware: detectarTenant
   │ Detecta: tenantId = 'bkjau'
   │ Busca produtos do tenant
   ▼
📦 MongoDB Atlas
   │ Filtra por: tenantId = 'bkjau'
   │ Retorna produtos
   ▼
☁️ Vercel (Frontend)
   │ Renderiza cardápio
   │ Cliente pode adicionar ao carrinho
   │ Finalizar pedido
```

### 3️⃣ Tentativa de Acesso Indevido (BLOQUEADO)
```
😈 Usuário malicioso
   │
   │ https://bkjau.fomezap.com/login
   ▼
👤 Login com super-admin
   │ (credenciais válidas)
   ▼
🔧 Backend valida e retorna JWT
   │ role: 'super_admin'
   ▼
😈 Tenta acessar
   │ https://bkjau.fomezap.com/super-admin
   ▼
🔒 ProtectedRoute (Frontend)
   │ Verifica: isManagerDomain() = false ❌
   │ BLOQUEIA ACESSO
   ▼
🚫 Tela de Erro
   │ "Acesso Negado"
   │ "Super Admin só em manager.fomezap.com"
   │
   └─> Redireciona para manager.fomezap.com
```

---

## 🗄️ Estrutura de Dados MongoDB

### Collection: users
```json
{
  "_id": "...",
  "email": "admin@fomezap.com",
  "senha": "$argon2...", 
  "role": "super_admin",    // ← Define permissão
  "tenantId": null,         // ← null para super-admin
  "nome": "Super Admin"
}
```

### Collection: tenants
```json
{
  "_id": "...",
  "tenantId": "bkjau",
  "slug": "bkjau",           // ← Usado no subdomínio
  "nome": "Burger King AU",
  "email": "admin@bk.com",
  "telefone": "(11) 99999-9999",
  "status": "ativo"
}
```

### Collection: produtos
```json
{
  "_id": "...",
  "tenantId": "bkjau",       // ← Isolamento por tenant
  "nome": "Whopper",
  "preco": 25.90,
  "categoria": "...",
  "disponivel": true
}
```

---

## 🔐 Matriz de Permissões

| Usuário | Domínio | Rota | Acesso |
|---------|---------|------|--------|
| Super Admin | manager.fomezap.com | /super-admin | ✅ Permitido |
| Super Admin | bkjau.fomezap.com | /super-admin | ❌ BLOQUEADO |
| Super Admin | bkjau.fomezap.com | /admin | ✅ Permitido* |
| Tenant Admin | bkjau.fomezap.com | /admin | ✅ Permitido |
| Tenant Admin | lanches2.fomezap.com | /admin | ❌ BLOQUEADO |
| Tenant Admin | manager.fomezap.com | /super-admin | ❌ BLOQUEADO |
| Público | bkjau.fomezap.com | / (cardápio) | ✅ Permitido |

*Super Admin pode acessar admin de qualquer tenant

---

## 📊 Fluxo de Criação de Tenant

```
1. Super Admin acessa manager.fomezap.com
   │
   ▼
2. Cria tenant com slug "lanches-maria"
   │
   ├─> Backend: Cria registro na collection tenants
   ├─> Backend: Cria usuário admin do tenant
   └─> Backend: Retorna sucesso
   │
   ▼
3. Super Admin configura DNS (Cloudflare)
   │
   └─> CNAME: lanches-maria → fomezap.vercel.app
   │
   ▼
4. Super Admin adiciona domínio (Vercel)
   │
   └─> Add: lanches-maria.fomezap.com
   │
   ▼
5. Aguarda propagação DNS (5min - 48h)
   │
   ▼
6. Envia credenciais ao cliente
   │
   ├─> URL: https://lanches-maria.fomezap.com
   ├─> Email: admin@lanchesmaria.com
   └─> Senha: [gerada]
   │
   ▼
7. Cliente acessa e configura seu cardápio
   │
   └─> https://lanches-maria.fomezap.com/admin
```

---

## 🌍 DNS: Antes vs Depois

### ANTES (Sites Hardcoded)
```
fomezap.com
   │
   ├─> A Record → HostGator IP
   │   (Site institucional HTML/CSS/JS)
   │
   └─> lanchoneteemfamilia.fomezap.com
       └─> CNAME → HostGator
           (Site cliente HTML/CSS/JS)
```

### DEPOIS (Multi-Tenant SaaS)
```
fomezap.com
   │
   ├─> A Record → HostGator IP ✅ (NÃO MUDA)
   │   (Site institucional)
   │
   ├─> lanchoneteemfamilia.fomezap.com ✅ (NÃO MUDA)
   │   └─> CNAME → HostGator
   │
   ├─> manager.fomezap.com 🆕
   │   └─> CNAME → fomezap.vercel.app
   │       (Super Admin isolado)
   │
   ├─> bkjau.fomezap.com 🆕
   │   └─> CNAME → fomezap.vercel.app
   │       (Tenant 1)
   │
   ├─> lanches2.fomezap.com 🆕
   │   └─> CNAME → fomezap.vercel.app
   │       (Tenant 2)
   │
   └─> [novos tenants...] 🆕
       └─> CNAME → fomezap.vercel.app
```

---

## 🔒 Validações de Segurança

### Frontend (ProtectedRoute.jsx)
```javascript
// 1. Verificar se rota é /super-admin
const rotaSuperAdmin = location.pathname.startsWith('/super-admin');

if (rotaSuperAdmin) {
  // 2. Verificar domínio
  if (!isManagerDomain()) {
    return <TelaAcessoNegado />;
  }
  
  // 3. Verificar role
  if (user.role !== 'super_admin') {
    return <TelaAcessoNegado />;
  }
}

// Se passou todas as validações, permitir
return children;
```

### Backend (validarDominio.js)
```javascript
// Middleware aplicado em /api/super-admin
export const validarDominioManager = (req, res, next) => {
  const host = req.get('host');
  
  // Produção: DEVE ser manager.fomezap.com
  if (!host.includes('localhost') && 
      !host.includes('vercel.app') &&
      host !== 'manager.fomezap.com') {
    return res.status(403).json({ 
      mensagem: 'Acesso negado. Super-admin só em manager.fomezap.com'
    });
  }
  
  next();
};
```

---

## 📱 URLs Organizadas por Função

### 🔒 Super Admin (Manager)
```
Login:        https://manager.fomezap.com/login
Dashboard:    https://manager.fomezap.com/super-admin
Tenants:      https://manager.fomezap.com/super-admin/tenants
```

### 🍔 Tenant (Cardápio Público)
```
Cardápio:     https://[slug].fomezap.com
Checkout:     https://[slug].fomezap.com/checkout
Confirmação:  https://[slug].fomezap.com/pedido-confirmado
```

### 👤 Tenant (Admin do Restaurante)
```
Login:        https://[slug].fomezap.com/login
Dashboard:    https://[slug].fomezap.com/admin
Produtos:     https://[slug].fomezap.com/admin/produtos
Categorias:   https://[slug].fomezap.com/admin/categorias
Pedidos:      https://[slug].fomezap.com/admin/pedidos
Config:       https://[slug].fomezap.com/admin/configuracoes
```

### 🌐 Sites Existentes (NÃO MUDAM)
```
Institucional: https://fomezap.com
Cliente:       https://lanchoneteemfamilia.fomezap.com
```

---

**Esta arquitetura garante**:
- ✅ Isolamento total de super-admin
- ✅ URLs amigáveis sem query parameters
- ✅ Segurança em múltiplas camadas
- ✅ Sites existentes intocados
- ✅ Escalabilidade ilimitada de tenants
