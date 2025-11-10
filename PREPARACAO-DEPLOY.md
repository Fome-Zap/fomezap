# ✅ Preparação para Deploy - Completa!

## 📦 Arquivos Criados

### Backend (Railway)
- ✅ `Backend/Dockerfile` - Container Docker do backend
- ✅ `Backend/.dockerignore` - Arquivos ignorados no build
- ✅ `Backend/.env.example` - Exemplo de variáveis de ambiente
- ✅ `Backend/uploads/.gitkeep` - Mantém pasta no Git

### Frontend (Vercel)  
- ✅ `Frontend/Dockerfile` - Container Docker do frontend (backup)
- ✅ `Frontend/.dockerignore` - Arquivos ignorados no build
- ✅ `Frontend/.env.example` - Exemplo de variáveis de ambiente
- ✅ `Frontend/.env.local` - Variáveis locais (desenvolvimento)
- ✅ `Frontend/vercel.json` - Configuração Vercel
- ✅ `Frontend/nginx.conf` - Configuração Nginx (backup)
- ✅ `Frontend/src/config/api.js` - **NOVO** Configuração centralizada de APIs

### Documentação
- ✅ `DEPLOY.md` - **Guia completo de deploy** (passo a passo)
- ✅ Este arquivo (PREPARACAO-DEPLOY.md)

---

## 🔧 Mudanças no Código

### 1. Configuração API Centralizada
**Arquivo criado:** `Frontend/src/config/api.js`

```javascript
export const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
export const API_URL = `${API_BASE_URL}/api`;
export const getImageUrl = (imagePath) => { ... };
```

**Benefícios:**
- ✅ Um único lugar para mudar URLs
- ✅ Detecta automaticamente ambiente (dev/prod)
- ✅ Helper para URLs de imagens
- ✅ Logs apenas em desenvolvimento

### 2. Arquivos Atualizados

#### `FomeZapExact.jsx`
```diff
- const API_URL = 'http://localhost:5000/api';
+ import { API_URL, getImageUrl } from '../config/api';

- src={produto.imagem.startsWith('http') ? produto.imagem : `http://localhost:5000${produto.imagem}`}
+ src={getImageUrl(produto.imagem)}
```

#### `UploadFoto.jsx`
```diff
- const response = await fetch('http://localhost:5000/api/upload/foto', {
+ import { API_URL } from '../config/api';
+ const response = await fetch(`${API_URL}/upload/foto`, {
```

#### `SeletorImagemProduto.jsx`
```diff
- src={valor.startsWith('http') ? valor : `http://localhost:5000${valor}`}
+ import { getImageUrl } from '../config/api';
+ src={getImageUrl(valor)}
```

---

## 🚀 Como Funciona Agora

### Desenvolvimento Local (agora)
```bash
# Frontend lê .env.local:
VITE_API_URL=http://localhost:5000/api

# Backend usa conexão local:
MONGODB_URI=mongodb://127.0.0.1:27017/FomeZap
```

### Produção (após deploy)
```bash
# Frontend lê variável do Vercel:
VITE_API_URL=https://api.fomezap.com/api

# Backend lê variável do Railway:
MONGODB_URI=<gerado_automaticamente_pelo_railway>
JWT_SECRET=<sua_chave_segura>
CORS_ORIGINS=https://*.fomezap.com,https://fomezap.com
```

---

## 📝 Próximos Passos

### 1. Testar Localmente (5 minutos)
```bash
# Terminal 1 - Backend
cd Backend
npm start

# Terminal 2 - Frontend  
cd Frontend
npm run dev

# Verificar se tudo funciona igual
```

### 2. Fazer Deploy (45-60 minutos)
```bash
# Siga o guia DEPLOY.md passo a passo:
1. Deploy Backend no Railway
2. Deploy Frontend no Vercel
3. Configurar DNS no Cloudflare
4. Testar em produção
```

### 3. Verificar URLs (após deploy)
- ✅ `https://fomezap.com` → Cardápio geral
- ✅ `https://loja1.fomezap.com` → Cardápio loja1
- ✅ `https://admin.fomezap.com` → Painel admin
- ✅ `https://api.fomezap.com` → Backend API

---

## 🎓 Para o TCC

### Conceitos Demonstrados
1. **Containerização (Docker)**
   - Backend em container Node.js
   - Frontend em container Nginx
   - Isolamento de dependências

2. **Variáveis de Ambiente**
   - Separação dev/prod
   - Secrets seguros
   - Configuração flexível

3. **CI/CD Automático**
   - Push no GitHub → Deploy automático
   - Preview de PRs (Vercel)
   - Rollback fácil

4. **Multi-tenant com DNS**
   - Wildcard DNS (*.fomezap.com)
   - Subdomínios dinâmicos
   - SSL/TLS automático

### Documentação para Apresentação
- ✅ Arquitetura (Frontend/Backend separados)
- ✅ Fluxo de deploy (Git → CI/CD → Produção)
- ✅ Segurança (Variáveis de ambiente, HTTPS)
- ✅ Escalabilidade (Containers, CDN, Wildcard)

---

## 💰 Custos Estimados

### Fase 1: MVP Inicial (0-10 restaurantes)
- Vercel: **$0/mês** (plano gratuito)
- Railway: **$0/mês** ($5 crédito inicial)
- **Total: $0/mês**

### Fase 2: Crescimento (10-50 restaurantes)
- Vercel: **$0-20/mês**
- Railway: **$5-15/mês**
- **Total: $5-35/mês**

### Fase 3: Escala (50-100 restaurantes)
- Vercel: **$20/mês** (Pro plan)
- Railway: **$20-30/mês**
- **Total: $40-50/mês**

---

## ✅ Checklist de Preparação

- [x] ✅ Dockerfiles criados
- [x] ✅ Variáveis de ambiente configuradas
- [x] ✅ Código atualizado para prod/dev
- [x] ✅ Configuração API centralizada
- [x] ✅ .dockerignore configurado
- [x] ✅ .gitignore atualizado
- [x] ✅ Documentação completa (DEPLOY.md)
- [ ] ⏳ Testar localmente
- [ ] ⏳ Deploy no Railway
- [ ] ⏳ Deploy no Vercel
- [ ] ⏳ Configurar DNS
- [ ] ⏳ Testar em produção

---

## 🐛 Troubleshooting

### Problema: "VITE_API_URL is not defined"
**Solução:** Reinicie o servidor Vite após criar .env.local
```bash
# Pare o servidor (Ctrl+C) e inicie novamente:
npm run dev
```

### Problema: Imagens não carregam em produção
**Solução:** Railway usa storage efêmero
- Solução temporária: Imagens somem ao reiniciar
- Solução permanente: Implementar Cloudinary (próxima etapa)

### Problema: CORS error em produção
**Solução:** Adicione domínios no Railway
```bash
CORS_ORIGINS=https://*.fomezap.com,https://fomezap.com,https://admin.fomezap.com
```

---

## 📞 Suporte

Se precisar de ajuda:
1. Consulte `DEPLOY.md` (guia completo)
2. Verifique logs no Railway/Vercel
3. Teste com `curl` ou Postman
4. Me chame! 😊

---

**Preparação concluída! 🎉**
**Tempo investido:** ~30 minutos
**Pronto para deploy!** Siga o guia `DEPLOY.md`
