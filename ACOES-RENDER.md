# ⚙️ CONFIGURAÇÃO RENDER - AÇÕES NECESSÁRIAS

## 🔴 PROBLEMA ATUAL

**CORS_ORIGINS no Render está desatualizado:**
```env
# ATUAL (INCORRETO):
CORS_ORIGINS=http://localhost:5173,http://localhost:80,http://localhost,https://fomezap.netlify.app

# NECESSÁRIO (CORRETO):
CORS_ORIGINS=http://localhost:5173,http://localhost:80,http://localhost,https://fomezap.netlify.app,https://demo.fomezap.com,https://familia.fomezap.com,https://thi-burg.fomezap.com
```

---

## ✅ PASSO A PASSO - ATUALIZAR RENDER

### **1. Acessar Painel Render**
```
https://dashboard.render.com
Login → Seu serviço Backend
```

### **2. Ir para Environment Variables**
```
Dashboard → Seu serviço → Environment
```

### **3. Editar CORS_ORIGINS**

**Encontrar variável:**
```
CORS_ORIGINS
```

**Substituir valor por:**
```
http://localhost:5173,http://localhost:80,http://localhost,https://fomezap.netlify.app,https://demo.fomezap.com,https://familia.fomezap.com,https://thi-burg.fomezap.com
```

### **4. Salvar e Aguardar Redeploy**
- Render faz redeploy automático
- Aguardar ~2-3 minutos
- Verificar status: "Live"

---

## 📋 VARIÁVEIS DE AMBIENTE COMPLETAS (VERIFICAÇÃO)

Verifique se todas estão configuradas:

```env
# MongoDB Atlas (já configurado ✅)
MONGODB_URI=mongodb+srv://tffjauds_db_user:SuaSenhaSegura@fomezap-prod.wwj0swg.mongodb.net/fomezap?retryWrites=true&w=majority&appName=fomezap-prod

# JWT Secret (já configurado ✅)
JWT_SECRET=sua-chave-jwt-super-secreta-aqui

# Node Environment (já configurado ✅)
NODE_ENV=production

# Porta (já configurado ✅)
PORT=5000

# CORS Origins (ATUALIZAR ❌)
CORS_ORIGINS=http://localhost:5173,http://localhost:80,http://localhost,https://fomezap.netlify.app,https://demo.fomezap.com,https://familia.fomezap.com,https://thi-burg.fomezap.com
```

---

## 🔄 FAZER REDEPLOY MANUAL (OPCIONAL)

Se quiser forçar redeploy após alterar CORS:

### **Opção 1: Pelo Dashboard**
```
Dashboard → Seu serviço → Manual Deploy → Deploy latest commit
```

### **Opção 2: Pelo Git (Recomendado)**
```bash
# Fazer push do código atualizado
git add .
git commit -m "fix: Atualiza CORS e integra middleware detectarTenant"
git push origin deploy-vercel

# Render detecta push e faz redeploy automático
```

---

## ✅ VERIFICAR LOGS APÓS DEPLOY

### **Acessar Logs:**
```
Dashboard → Seu serviço → Logs
```

### **Logs que você DEVE ver:**
```
✅ Conectou ao MongoDB!
📍 URI: mongodb+srv://...
🌐 Servidor rodando na porta 5000
```

### **Testar detecção de tenant:**
```bash
# Fazer requisição para API
curl https://seu-backend.onrender.com/api/cardapio/categorias \
  -H "Host: familia.fomezap.com" \
  -H "Origin: https://familia.fomezap.com"
```

**Log esperado no Render:**
```
🌐 Tenant detectado por subdomínio: familia -> familia
✅ Categorias encontradas: 3
```

---

## 🐛 TROUBLESHOOTING

### **Problema: CORS error persiste após atualizar**
**Solução:**
1. Verificar se variável foi salva corretamente
2. Aguardar redeploy completar (status "Live")
3. Limpar cache do navegador (Ctrl+Shift+R)
4. Verificar logs do Render para confirmar

### **Problema: "Origin bloqueada pelo CORS" nos logs**
**Solução:**
```javascript
// Verificar no código se origin está na lista
console.warn('⚠️  Origin bloqueada pelo CORS:', origin);

// Se aparecer, adicionar ao CORS_ORIGINS
```

### **Problema: Backend não reinicia após alterar variável**
**Solução:**
1. Forçar redeploy manual
2. Ou fazer push de commit vazio:
```bash
git commit --allow-empty -m "chore: Força redeploy"
git push origin deploy-vercel
```

---

## 📊 ORDEM DE EXECUÇÃO NO BACKEND

Após aplicar alterações, o backend executará:

```
1. ✅ Conectar MongoDB Atlas
2. ✅ Carregar variáveis de ambiente
3. ✅ Inicializar Express
4. ✅ Configurar CORS (com novos domínios)
5. ✅ Registrar middleware detectarTenant
6. ✅ Registrar rotas públicas
7. ✅ Iniciar servidor na porta 5000
```

---

## 🎯 PRÓXIMOS PASSOS APÓS ATUALIZAR RENDER

1. ✅ **Atualizar CORS_ORIGINS** (esta tarefa)
2. ⏭️ **Fazer push do código atualizado** (index.js com detectarTenant)
3. ⏭️ **Corrigir slug do tenant familia** (rodar script)
4. ⏭️ **Testar familia.fomezap.com** (deve carregar dados corretos)
5. ⏭️ **Testar login admin** em cada subdomínio
6. ⏭️ **Validar isolamento de dados** entre tenants

---

## 📝 TEMPLATE PARA ADICIONAR NOVOS TENANTS

Sempre que criar novo tenant, adicionar ao CORS:

**Antes:**
```env
CORS_ORIGINS=...,https://thi-burg.fomezap.com
```

**Depois (novo tenant "novo-slug"):**
```env
CORS_ORIGINS=...,https://thi-burg.fomezap.com,https://novo-slug.fomezap.com
```

**Dica:** Use vírgula sem espaços!

---

## 🔐 SEGURANÇA

### **Por que não usar wildcard `*.fomezap.com`?**

❌ **NÃO funciona com credentials:**
```javascript
// CORS não suporta wildcard quando credentials: true
origin: '*.fomezap.com' // ❌ ERRO
```

✅ **Solução atual (regex):**
```javascript
// Regex permite qualquer subdomínio
/^https?:\/\/[a-z0-9-]+\.fomezap\.com$/.test(origin)
```

⚠️ **Mas por segurança, listamos explicitamente:**
- Evita subdomínios não autorizados
- Melhor controle de acesso
- Logs mostram tentativas bloqueadas

---

## 📞 SUPORTE RENDER

**Documentação oficial:**
- https://render.com/docs/environment-variables
- https://render.com/docs/deploys

**Status do serviço:**
- https://status.render.com

---

**Data:** 15 de Novembro de 2025  
**Tarefa:** Atualizar CORS_ORIGINS para incluir subdomínios de produção  
**Prioridade:** 🔴 ALTA - Sem isso, frontend não consegue comunicar com backend
