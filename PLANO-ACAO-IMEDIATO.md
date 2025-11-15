# 🚨 PLANO DE AÇÃO IMEDIATO - DEPLOY PRODUÇÃO

## ✅ CONCLUÍDO

- [x] Código atualizado com middleware detectarTenant
- [x] CORS configurado para aceitar subdomínios
- [x] Rotas públicas suportam detecção automática
- [x] Scripts de correção criados
- [x] Documentação completa gerada
- [x] Commits realizados no Git
- [x] Branch: deploy-vercel atualizada

---

## 🔴 AÇÕES URGENTES (FAZER AGORA)

### **1. ATUALIZAR CORS NO RENDER** ⏱️ 2 minutos
```
1. Acessar: https://dashboard.render.com
2. Seu serviço Backend → Environment
3. Editar: CORS_ORIGINS
4. Novo valor:
   http://localhost:5173,http://localhost:80,http://localhost,https://fomezap.netlify.app,https://demo.fomezap.com,https://familia.fomezap.com,https://thi-burg.fomezap.com
5. Save
6. Aguardar redeploy (~2 min)
```

**❗ SEM ISSO O FRONTEND NÃO FUNCIONA**

---

### **2. FAZER PUSH DO CÓDIGO ATUALIZADO** ⏱️ 1 minuto
```bash
git push origin deploy-vercel
```

**O que vai acontecer:**
- Render detecta push automático
- Faz redeploy com novo código
- Middleware detectarTenant fica ativo
- Backend passa a detectar tenant por subdomínio

---

### **3. CORRIGIR SLUG DO TENANT FAMILIA NO BANCO** ⏱️ 2 minutos

**Problema identificado:**
```
Banco de produção (MongoDB Atlas):
tenantId: "familia"
slug: "lanchonete-em-familia"  ❌ ERRADO

Subdomínio configurado:
familia.fomezap.com  ← Busca slug "familia"

Resultado: Não encontra tenant!
```

**Solução:**

#### **Opção A: Via Script (Recomendado)**
```bash
# Configurar .env com MongoDB de produção
MONGODB_URI=mongodb+srv://tffjauds_db_user:SuaSenha@fomezap-prod.wwj0swg.mongodb.net/fomezap

# Rodar script
cd Backend
node corrigirSlugFamilia.js
```

#### **Opção B: Via MongoDB Atlas (Manual)**
```
1. Acessar: https://cloud.mongodb.com
2. Cluster fomezap-prod → Browse Collections
3. Database: fomezap → Collection: tenants
4. Buscar: tenantId = "familia"
5. Editar campo slug:
   De: "lanchonete-em-familia"
   Para: "familia"
6. Save
```

---

### **4. VERIFICAR SUBDOMÍNIOS NO VERCEL** ⏱️ 1 minuto

Confirmar que todos estão adicionados:

```
✅ demo.fomezap.com
✅ familia.fomezap.com
✅ thi-burg.fomezap.com
```

**Se algum não estiver:**
```
Vercel Dashboard → Seu projeto → Settings → Domains → Add Domain
```

---

## 🧪 TESTES PÓS-DEPLOY

### **Teste 1: Verificar CORS**
```bash
# Deve retornar 200 OK (não erro CORS)
curl https://seu-backend.onrender.com/api/cardapio/categorias \
  -H "Origin: https://familia.fomezap.com" \
  -v
```

### **Teste 2: Acessar Subdomínios**
```
https://demo.fomezap.com
https://familia.fomezap.com
https://thi-burg.fomezap.com
```

**O que DEVE acontecer:**
- ✅ Carrega página React
- ✅ Mostra categorias/produtos do tenant correto
- ✅ Não mostra erro de CORS no console
- ✅ Login funciona

### **Teste 3: Verificar Isolamento de Dados**
```
1. Acessar demo.fomezap.com
   → Deve mostrar "Lanches do João"
   
2. Acessar familia.fomezap.com
   → Deve mostrar "Lanchonete em Família"
   
3. Acessar thi-burg.fomezap.com
   → Deve mostrar "Thi Burg"
```

### **Teste 4: Login Admin**
```
demo.fomezap.com/login
Email: admin@demo.com
(senha conforme banco)

familia.fomezap.com/login
Email: tffjau@gmail.com
(senha conforme banco)

thi-burg.fomezap.com/login
Email: tffjauds@gmail.com
(senha conforme banco)
```

---

## 📊 MAPEAMENTO ATUAL DOS TENANTS

| Subdomínio | TenantId | Slug (Banco) | Slug (Esperado) | Status | Admin Email |
|------------|----------|--------------|-----------------|--------|-------------|
| demo.fomezap.com | demo | demo | demo | ✅ OK | admin@demo.com |
| familia.fomezap.com | familia | lanchonete-em-familia | familia | ❌ CORRIGIR | tffjau@gmail.com |
| thi-burg.fomezap.com | thi-burg | thi-burg | thi-burg | ✅ OK | tffjauds@gmail.com |

---

## 🐛 TROUBLESHOOTING RÁPIDO

### **Erro: "Tenant não encontrado"**
```
Causa: Slug no banco diferente do subdomínio
Solução: Corrigir slug no banco (Ação #3)
```

### **Erro: CORS blocked**
```
Causa: CORS_ORIGINS não tem o subdomínio
Solução: Atualizar CORS no Render (Ação #1)
Verificar: Render fez redeploy completo
```

### **Erro: 404 nas rotas**
```
Causa: Código antigo ainda rodando
Solução: Fazer push e aguardar redeploy (Ação #2)
```

### **Carrega dados de outro tenant**
```
Causa: detectarTenant não está ativo
Solução: Verificar logs do Render:
  "🌐 Tenant detectado por subdomínio: familia"
```

---

## 📋 CHECKLIST FINAL

```
□ 1. Atualizar CORS_ORIGINS no Render
□ 2. git push origin deploy-vercel
□ 3. Aguardar redeploy do Render (~2 min)
□ 4. Corrigir slug do tenant familia no banco
□ 5. Acessar familia.fomezap.com e verificar
□ 6. Fazer login admin em cada subdomínio
□ 7. Testar criação de pedido
□ 8. Verificar isolamento de dados entre tenants
□ 9. Monitorar logs do Render por 10 minutos
□ 10. Comemorar 🎉
```

---

## 🎯 RESULTADO ESPERADO

Após completar todas as ações:

```
✅ familia.fomezap.com carrega cardápio correto
✅ demo.fomezap.com carrega cardápio correto
✅ thi-burg.fomezap.com carrega cardápio correto
✅ Cada tenant vê apenas seus dados
✅ Login admin funciona em cada subdomínio
✅ Sem erros de CORS
✅ Backend detecta tenant automaticamente
✅ Logs mostram detecção correta
```

---

## 📞 SE ALGO DER ERRADO

### **Rollback Rápido:**
```bash
# Voltar para commit anterior
git revert HEAD
git push origin deploy-vercel

# Render faz redeploy automático
```

### **Logs para Debug:**
```
Render: Dashboard → Logs
Vercel: Dashboard → Deployments → Function Logs
MongoDB: Compass → Conectar e verificar dados
Browser: F12 → Console + Network
```

---

## 🚀 PRÓXIMOS PASSOS (APÓS FUNCIONAR)

1. **Monitoramento:**
   - Configurar alertas no Render
   - Adicionar analytics no Vercel
   - Monitorar uso do MongoDB Atlas

2. **Melhorias:**
   - Adicionar cache Redis
   - Implementar rate limiting
   - Adicionar logging estruturado (Winston)

3. **Documentação:**
   - Criar manual do admin
   - Documentar processo de onboarding de novo cliente
   - Criar vídeo tutorial

4. **Novos Tenants:**
   - Usar script criarNovoTenant.js
   - Adicionar DNS no Cloudflare
   - Adicionar domínio no Vercel
   - Atualizar CORS no Render

---

**⏰ TEMPO TOTAL ESTIMADO: 10-15 minutos**

**🎯 PRIORIDADE: MÁXIMA**

**📅 DATA: 15 de Novembro de 2025**

---

**Dúvidas? Consulte:**
- `EXPLICACAO-DETECCAO-TENANT.md` - Entender como funciona
- `ACOES-RENDER.md` - Detalhes de configuração do Render
- `GUIA-DEPLOY-PRODUCAO.md` - Guia completo de deploy
