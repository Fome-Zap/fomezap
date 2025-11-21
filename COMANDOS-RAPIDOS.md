# ⚡ Comandos Rápidos - Deploy e Teste

## 🚀 Passo 1: Criar branch e fazer commit

```powershell
# Criar branch de teste
git checkout -b deploy-vercel

# Adicionar arquivos modificados
git add Backend/Controllers/PedidoController.js
git add Frontend/src/pages/Admin/Pedidos.css
git add GUIA-TESTE-WHATSAPP-MOBILE.md
git add COMANDOS-RAPIDOS.md

# Fazer commit
git commit -m "feat: melhorar formatação WhatsApp e corrigir impressão mobile iOS/Android"

# Enviar para GitHub
git push -u origin deploy-vercel
```

---

## 📱 Passo 2: Acessar Preview na Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione projeto **FomeZap**
3. Vá para aba **Deployments**
4. Localize deploy da branch `deploy-vercel`
5. Copie a URL (ex: `https://deploy-vercel-fomezap-abc123.vercel.app`)

---

## 🧪 Passo 3: Testar no Celular

### A) Testar Mensagem WhatsApp

1. **Abrir cardápio no celular:**
   - Cole no navegador: `https://deploy-vercel-fomezap-abc123.vercel.app/lanchonete`
   
2. **Fazer pedido de teste:**
   - Adicione itens ao carrinho
   - Preencha dados (nome, telefone, endereço)
   - Finalize o pedido
   
3. **Abrir WhatsApp:**
   - Sistema vai abrir link `wa.me` automaticamente
   - Ou clique no botão "Enviar pelo WhatsApp"
   - **✅ Envie a mensagem** para o número do restaurante
   
4. **Validar formatação:**
   - ✅ Separadores visuais (`━━━━`) aparecem?
   - ✅ Data e hora estão corretas?
   - ✅ Preços com vírgula (R$ 24,90)?
   - ✅ Espaçamento legível?
   - ✅ Emojis renderizando?

### B) Testar Impressão Mobile (Admin)

1. **Login no admin (celular):**
   - Cole no navegador: `https://deploy-vercel-fomezap-abc123.vercel.app/admin/pedidos`
   - Faça login com suas credenciais
   
2. **Abrir pedido de teste:**
   - Localize o pedido que você acabou de criar
   - Clique no card do pedido
   
3. **Imprimir:**
   - Toque em **🖨️ Imprimir**
   - Selecione tamanho (58mm ou 80mm)
   - Confirme impressão
   
4. **Safari iOS:**
   - Toque em "Compartilhar" → "Imprimir"
   - Ou toque em "Salvar como PDF"
   - **✅ Comanda DEVE aparecer** (não mais em branco)
   
5. **Chrome Android:**
   - Toque em "Imprimir"
   - **✅ Comanda DEVE aparecer** (não mais em branco)

---

## ✅ Passo 4: Se tudo OK, mergear para main

```powershell
# Voltar para main
git checkout main

# Mergear branch de teste
git merge deploy-vercel

# Enviar para produção
git push origin main
```

---

## 🗑️ Passo 5: Limpar branch de teste (opcional)

```powershell
# Deletar branch local
git branch -d deploy-vercel

# Deletar branch remota
git push origin --delete deploy-vercel
```

---

## 🔥 Alternativa: Testar Local com ngrok

Se preferir testar sem fazer deploy na Vercel:

### Terminal 1 - Backend
```powershell
cd Backend
npm start
```

### Terminal 2 - Frontend
```powershell
cd Frontend
npm run dev
```

### Terminal 3 - ngrok
```powershell
# Se não tiver ngrok instalado:
# choco install ngrok

ngrok http 5173
```

Copie a URL fornecida pelo ngrok (ex: `https://abc123.ngrok.io`) e acesse no celular.

---

## 📋 Checklist de Validação

### Mensagem WhatsApp
- [ ] Link abre WhatsApp no celular
- [ ] Mensagem está pré-preenchida
- [ ] Formatação legível (separadores, espaços)
- [ ] Data/hora corretas
- [ ] Preços com vírgula (R$ 24,90)
- [ ] Emojis renderizando
- [ ] Cliente consegue enviar ao restaurante

### Impressão Mobile (Admin)
- [ ] Safari iOS: comanda NÃO aparece em branco
- [ ] Chrome Android: comanda NÃO aparece em branco
- [ ] Layout está correto (nome restaurante, itens, total)
- [ ] Tamanho 58mm funciona
- [ ] Tamanho 80mm funciona

### Impressão Térmica Real (Opcional)
- [ ] Copiar mensagem do WhatsApp
- [ ] Colar em app de impressora térmica
- [ ] Imprimir
- [ ] Emojis visíveis (mesmo fracos em P&B)
- [ ] Separadores criando divisões visuais
- [ ] Texto legível e bem espaçado

---

## 🆘 Problemas Comuns

### "Não consigo acessar o preview na Vercel"
- Verifique se fez push da branch `deploy-vercel`
- Aguarde 1-2 minutos para build completar
- Refresh na página de Deployments

### "WhatsApp não abre no celular"
- Verifique se tem WhatsApp instalado
- Alguns navegadores bloqueiam `wa.me` — tente outro navegador
- Safari pode pedir permissão para abrir apps externos

### "Impressão ainda em branco no mobile"
- Limpe cache do navegador (Settings → Clear Data)
- Force rebuild no Vercel (Settings → Redeploy)
- Verifique se arquivo CSS foi commitado corretamente

### "Mensagem muito longa / truncada"
- WhatsApp tem limite de ~65KB na URL
- Considere remover rodapé ou simplificar observações
- Backend pode gerar versão compacta se necessário

---

## 📞 Próximos Passos

Após validar tudo:
1. Mergear `deploy-vercel` → `main`
2. Deletar branch de teste
3. Monitorar logs de produção
4. Coletar feedback de usuários reais

**Boa sorte! 🚀**
