# 🔧 Guia: Configurar manager.fomezap.com (Painel SuperAdmin)

## 📋 Objetivo

Criar subdomínio dedicado `manager.fomezap.com` para acesso exclusivo do SuperAdmin, separado dos tenants.

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────┐
│ ESTRUTURA DE SUBDOMÍNIOS                             │
├─────────────────────────────────────────────────────┤
│                                                      │
│ 📍 manager.fomezap.com                               │
│    └─> SuperAdmin (você - gerenciar todos tenants)  │
│                                                      │
│ 📍 loja1.fomezap.com                                 │
│    └─> Cardápio da Loja 1                           │
│    └─> /admin → Painel Admin da Loja 1              │
│                                                      │
│ 📍 loja2.fomezap.com                                 │
│    └─> Cardápio da Loja 2                           │
│    └─> /admin → Painel Admin da Loja 2              │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 PASSO A PASSO COMPLETO

### **1️⃣ DNS (Provedor de Domínio)**

Se você tiver domínio próprio (`fomezap.com`):

#### A. Adicionar Registro CNAME

```
No seu provedor de DNS (GoDaddy, Cloudflare, etc.):

┌────────────────────────────────────────┐
│ Tipo: CNAME                            │
│ Nome: manager                          │
│ Valor: cname.vercel-dns.com            │
│ TTL: 3600 (ou Auto)                    │
└────────────────────────────────────────┘

Isso cria: manager.fomezap.com → Vercel
```

#### B. Verificar Wildcard (se ainda não fez)

```
Para permitir subdomínios dos tenants:

┌────────────────────────────────────────┐
│ Tipo: CNAME                            │
│ Nome: *                                │
│ Valor: cname.vercel-dns.com            │
│ TTL: 3600                              │
└────────────────────────────────────────┘

Isso permite: loja1.fomezap.com, loja2.fomezap.com, etc.
```

---

### **2️⃣ Vercel (Frontend)**

#### A. Adicionar Domínios na Vercel

```bash
1. Acesse: https://vercel.com/seu-projeto/settings/domains

2. Adicione (um por vez):
   ┌────────────────────────────────┐
   │ fomezap.com                    │  ← Domínio principal
   │ www.fomezap.com                │  ← Alias
   │ manager.fomezap.com            │  ← SuperAdmin
   │ *.fomezap.com                  │  ← Wildcard para tenants
   └────────────────────────────────┘

3. Para cada um, aguarde verificação DNS (pode levar até 24h)
```

#### B. Configurar Redirects (Opcional)

```json
// vercel.json
{
  "redirects": [
    {
      "source": "/",
      "destination": "/login",
      "permanent": false,
      "has": [
        {
          "type": "host",
          "value": "manager.fomezap.com"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

### **3️⃣ Frontend (Código)**

#### A. Detectar manager.fomezap.com

Atualize `src/config/api.js` ou crie lógica específica:

```javascript
// src/config/api.js

const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

// Detectar ambiente
const isManager = hostname === 'manager.fomezap.com' || hostname === 'localhost';
const isProduction = import.meta.env.PROD;

// URL base da API
export const API_BASE_URL = isProduction
  ? 'https://fomezap-api.onrender.com'
  : 'http://localhost:5000';

export const API_URL = `${API_BASE_URL}/api`;

// Tipo de acesso
export const ACCESS_TYPE = isManager ? 'SUPERADMIN' : 'TENANT';

// Log
if (import.meta.env.DEV) {
  console.log('🔧 Configuração:', {
    hostname,
    isManager,
    ACCESS_TYPE,
    API_URL
  });
}
```

#### B. Router Condicional

Atualize `src/App.jsx` para redirecionar baseado no hostname:

```javascript
// src/App.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const hostname = window.location.hostname;
    
    // Se for manager.fomezap.com, redirecionar para login superadmin
    if (hostname === 'manager.fomezap.com') {
      navigate('/login'); // ou '/super-admin/login' se tiver rota específica
    }
  }, [navigate]);
  
  return (
    <Routes>
      <Route path="/login" element={<LoginModerno />} />
      <Route path="/super-admin/*" element={<SuperAdminRoutes />} />
      {/* Outras rotas */}
    </Routes>
  );
}
```

---

### **4️⃣ Backend (Middleware)**

O backend já está preparado! O middleware `detectarTenant` automaticamente **NÃO** detecta tenant para:
- `/api/super-admin/*` (rotas exclusivas do SuperAdmin)
- `/api/auth/*` (login/registro)

```javascript
// Backend/Middlewares/detectarTenant.js (JÁ ESTÁ ASSIM!)
const rotasExcluidas = [
  '/api/super-admin',
  '/api/auth',
  '/health'
];

if (rotasExcluidas.some(rota => req.path.startsWith(rota))) {
  return next(); // Pula detecção de tenant
}
```

---

## 🧪 TESTAR LOCALMENTE

### Simulando manager.fomezap.com no localhost

#### A. Editar hosts (Windows)

```bash
1. Abrir Bloco de Notas como Administrador
2. Abrir arquivo:
   C:\Windows\System32\drivers\etc\hosts
3. Adicionar linha:
   127.0.0.1 manager.localhost
4. Salvar
```

#### B. Iniciar Frontend na porta 80

```bash
cd Frontend
npm run dev -- --host 0.0.0.0 --port 80
```

#### C. Acessar

```
http://manager.localhost
```

Ou usar diretamente `localhost` com query parameter:

```
http://localhost:5173?manager=true
```

---

## 📱 FLUXO COMPLETO

### Produção com Domínio

```
1. Usuário acessa: https://manager.fomezap.com
2. Frontend detecta hostname === 'manager.fomezap.com'
3. Redireciona para /login
4. Usuário loga com tffjauds@gmail.com
5. Token JWT com role=super_admin
6. Frontend redireciona para /super-admin/dashboard
7. API aceita chamadas para /api/super-admin/* (protegidas)
```

### Produção SEM Domínio Próprio

Se não tiver domínio customizado, use a URL da Vercel:

```
https://fomezap.vercel.app/super-admin
```

E adicione lógica no frontend:

```javascript
// src/App.jsx
useEffect(() => {
  const path = window.location.pathname;
  
  if (path.startsWith('/super-admin')) {
    // Renderizar interface SuperAdmin
    setIsSuperAdmin(true);
  }
}, []);
```

---

## 🔐 SEGURANÇA

### Proteger Rotas SuperAdmin

```javascript
// src/components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function PrivateRouteSuperAdmin({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  
  if (!user || user.role !== 'super_admin') {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Uso:
<Route path="/super-admin/*" element={
  <PrivateRouteSuperAdmin>
    <SuperAdminLayout />
  </PrivateRouteSuperAdmin>
} />
```

---

## 📊 CHECKLIST COMPLETO

### Sem Domínio Próprio (Mais Simples)

- [ ] SuperAdmin criado no banco (`node scripts/criarSuperAdmin.js`)
- [ ] Login funciona em `https://fomezap.vercel.app/login`
- [ ] Rota `/super-admin/*` protegida por autenticação
- [ ] Interface SuperAdmin renderiza corretamente

**Acesso:**
```
https://fomezap.vercel.app/super-admin
```

### Com Domínio Próprio (Profissional)

- [ ] DNS configurado:
  - [ ] `manager` CNAME → `cname.vercel-dns.com`
  - [ ] `*` CNAME → `cname.vercel-dns.com` (wildcard)
- [ ] Domínios adicionados na Vercel:
  - [ ] `fomezap.com`
  - [ ] `manager.fomezap.com`
  - [ ] `*.fomezap.com`
- [ ] DNS propagado (verificar: `nslookup manager.fomezap.com`)
- [ ] Frontend detecta hostname `manager.fomezap.com`
- [ ] SuperAdmin criado e login funciona

**Acesso:**
```
https://manager.fomezap.com
```

---

## 🎯 DECISÃO RÁPIDA

### Você TEM domínio próprio?

**✅ SIM** → Seguir passos 1-4 (DNS + Vercel + Código)  
**❌ NÃO** → Usar rota `/super-admin` na URL da Vercel

---

## 🔧 Exemplo Mínimo (Sem Domínio)

### 1. Verificar se SuperAdmin existe

```bash
cd Backend
node scripts/checkMongoDB.js  # Garantir que está em PRODUÇÃO
node scripts/criarSuperAdmin.js
```

### 2. Fazer login na Vercel

```
https://fomezap.vercel.app/login
Email: tffjauds@gmail.com
Senha: !@qwasZX
```

### 3. Após login, será redirecionado para:

```
https://fomezap.vercel.app/super-admin/dashboard
```

**PRONTO!** Funcionando sem precisar configurar DNS.

---

## 📚 Próximos Passos

1. **Primeiro**: Testar login em produção (`fomezap.vercel.app/login`)
2. **Depois**: Se quiser subdomínio customizado, configurar DNS
3. **Por último**: Adicionar domínios na Vercel e aguardar propagação

---

## 🆘 Troubleshooting

### ❌ manager.fomezap.com não resolve

**Causa:** DNS não propagado

**Solução:**
```bash
# Verificar DNS
nslookup manager.fomezap.com

# Se não resolver:
1. Aguardar propagação (até 24h)
2. Limpar cache DNS:
   ipconfig /flushdns  # Windows
3. Usar 8.8.8.8 (DNS Google) temporariamente
```

### ❌ SSL Certificate Error

**Causa:** Vercel ainda não emitiu certificado

**Solução:**
```
1. Aguardar alguns minutos
2. Vercel emite certificado automaticamente via Let's Encrypt
3. Verificar em: Vercel → Domains → Status
```

### ❌ Frontend não detecta manager

**Causa:** Lógica de detecção não implementada

**Solução:**
```javascript
// Adicionar log para debug
console.log('Hostname:', window.location.hostname);

if (window.location.hostname === 'manager.fomezap.com') {
  console.log('✅ Manager detectado!');
}
```

---

**RESUMO:** Para começar rápido, use `/super-admin` na URL da Vercel. Configure domínio customizado depois se necessário. 🚀
