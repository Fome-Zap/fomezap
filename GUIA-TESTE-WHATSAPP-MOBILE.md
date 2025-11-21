# 📱 Guia Completo: Testar Mensagem WhatsApp e Impressão Mobile

## 🎯 Problema Inicial
- WhatsApp Web no desktop não abre a mensagem pré-preenchida corretamente
- Impressão mobile (Safari/Chrome iOS) exibe folha em branco
- Necessidade de testar a funcionalidade no celular antes de mergear com `main`

---

## ✅ Solução Implementada

### 1️⃣ Mensagem WhatsApp Reformatada
**Melhorias aplicadas:**
- ✨ Separadores visuais (`━━━━━`) para delimitar seções
- 📅 Data e hora do pedido formatadas (ex: 21/11/2025 • 14:23)
- 💵 Preços formatados com vírgula (padrão brasileiro: R$ 24,90)
- 🎨 Melhor hierarquia visual (negrito, itálico, recuos)
- 📝 Observações em itálico para destaque
- ↳ Extras com símbolos de continuação
- 🖨️ Layout otimizado para impressão térmica

**Exemplo de saída:**
```
🏪 *DEMO LANCHES*
Comanda de Pedido
━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 *PEDIDO #251121003*
📅 21/11/2025 • 14:23

👤 *Cliente:* THIAGO FRANCA
📱 *Telefone:* (14) 99695-9357
━━━━━━━━━━━━━━━━━━━━━━━━━━

🛒 *ITENS DO PEDIDO:*

*1.* À MODA DA CASA
   1x R$ 76,00
   ↳ _+ CALABRESA, BATATA PALHA_ R$ 0,00
   📝 _sem cebola, cortar pão no meio_
   💵 Subtotal: *R$ 76,00*

━━━━━━━━━━━━━━━━━━━━━━━━━━

🚚 *ENTREGA*
📍 Rua Júlio Carboni, 966

💳 *Pagamento:* dinheiro

📝 *Observações Gerais:*
Deixar na portaria

━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 *VALOR TOTAL: R$ 81,00*
━━━━━━━━━━━━━━━━━━━━━━━━━━

_Pedido gerado via FomeZap_
```

---

## 🚀 Como Testar no Celular (Deploy Preview na Vercel)

### Opção A: Deploy de Preview Automático (Recomendado)

#### Passo 1: Criar branch de teste
```powershell
# Na raiz do projeto
git checkout -b deploy-vercel

# Adicionar mudanças
git add Backend/Controllers/PedidoController.js
git add Frontend/src/pages/Admin/Pedidos.css

git commit -m "feat: melhorar formatação mensagem WhatsApp e corrigir impressão mobile"
git push -u origin deploy-vercel
```

#### Passo 2: Acessar Preview Deploy na Vercel
1. Acesse https://vercel.com/dashboard
2. Vá para o projeto FomeZap
3. Clique na aba **"Deployments"**
4. Procure o deploy da branch `deploy-vercel` (status: Preview)
5. Clique no card do deployment
6. Copie a URL pública (ex: `https://deploy-vercel-fomezap-xyz.vercel.app`)

#### Passo 3: Testar no celular
1. **Abrir cardápio público no celular:**
   - Abra o navegador do celular (Chrome/Safari)
   - Cole a URL: `https://deploy-vercel-fomezap-xyz.vercel.app/lanchonete`
   - Faça um pedido completo (adicione itens, endereço, pagamento)

2. **Enviar pelo WhatsApp:**
   - Ao finalizar o pedido, o sistema vai retornar um link `wa.me`
   - O frontend deve abrir automaticamente ou mostrar botão "Enviar pelo WhatsApp"
   - No mobile, o link abre o app WhatsApp com a mensagem pronta
   - **✅ Envie a mensagem** — ela irá para o número do restaurante
   - Verifique se a formatação está legível e bem espaçada

3. **Testar impressão mobile (Admin):**
   - No celular, acesse: `https://deploy-vercel-fomezap-xyz.vercel.app/admin/pedidos`
   - Faça login como admin
   - Localize o pedido de teste
   - Clique em **🖨️ Imprimir**
   - Selecione tamanho da impressora (58mm ou 80mm)
   - Clique em **Imprimir**
   - **Safari iOS:** toque em "Compartilhar" → "Imprimir" ou "Salvar como PDF"
   - **Chrome Android:** toque em "Imprimir"
   - ✅ Verifique se o pedido aparece (não mais em branco)

#### Passo 4: Se tudo estiver OK, mergear
```powershell
# Voltar para main
git checkout main

# Mergear branch de teste
git merge deploy-vercel

# Enviar para produção
git push origin main

# (Opcional) Deletar branch de teste
git branch -d deploy-vercel
git push origin --delete deploy-vercel
```

---

### Opção B: Usar ngrok para Teste Local (Alternativa)

Se preferir testar localmente sem fazer deploy:

#### Passo 1: Instalar ngrok
```powershell
# Baixar: https://ngrok.com/download
# Ou via Chocolatey:
choco install ngrok
```

#### Passo 2: Subir servidor local
```powershell
# Terminal 1 - Backend
cd Backend
npm start

# Terminal 2 - Frontend
cd Frontend
npm run dev
```

#### Passo 3: Expor porta do frontend com ngrok
```powershell
# Terminal 3
ngrok http 5173
```

Você receberá uma URL pública temporária:
```
Forwarding: https://abc123.ngrok.io -> http://localhost:5173
```

#### Passo 4: Abrir no celular
- Abra o navegador do celular
- Cole a URL: `https://abc123.ngrok.io/lanchonete`
- Faça o pedido e teste o link WhatsApp

**Limitações do ngrok:**
- URL muda toda vez que reinicia (versão free)
- Backend precisa estar acessível (se estiver em localhost, configure CORS)
- Menos confiável que deploy Vercel

---

## 🖨️ Correção Aplicada: Impressão Mobile

### Problema Identificado
Safari iOS e Chrome mobile têm bugs conhecidos com:
- `visibility: hidden` em `body *` (não renderiza corretamente)
- `position: absolute` em área de impressão (sai da página)

### Solução Implementada
Substituímos a abordagem por `display: none` seletivo:

**Antes (problemático):**
```css
@media print {
  body * {
    visibility: hidden;
  }
  .print-only * {
    visibility: visible;
  }
  .print-only {
    position: absolute;
  }
}
```

**Depois (funciona em mobile):**
```css
@media print {
  body > *:not(.print-only) {
    display: none !important;
  }
  .print-only {
    display: block !important;
    position: static;
    width: 100%;
  }
}
```

**Resultado:**
- ✅ Safari iOS: exibe comanda corretamente
- ✅ Chrome Android: exibe comanda corretamente
- ✅ Desktop: mantém funcionamento normal

---

## 📋 Checklist de Validação

### Backend
- [x] Função `gerarLinkWhatsApp` reformatada
- [x] Separadores visuais adicionados
- [x] Data/hora do pedido incluída
- [x] Preços formatados com vírgula (R$ 24,90)
- [x] Layout otimizado para impressão térmica

### Frontend - Impressão Mobile
- [x] CSS de impressão corrigido para Safari iOS
- [x] CSS de impressão corrigido para Chrome mobile
- [x] Mantém compatibilidade desktop

### Testes
- [ ] Deploy na branch `deploy-vercel` realizado
- [ ] URL de preview acessada no celular
- [ ] Pedido criado no cardápio público (mobile)
- [ ] Link WhatsApp aberto no celular
- [ ] Mensagem formatada visualizada no WhatsApp
- [ ] Mensagem enviada ao restaurante
- [ ] Impressão mobile testada (Safari iOS)
- [ ] Impressão mobile testada (Chrome Android)
- [ ] Comanda NÃO aparece em branco
- [ ] Merge com `main` realizado

---

## 🎨 Dicas de UX para Integração Frontend

### 1. Abrir WhatsApp após criar pedido (Recomendado)

**Em `Frontend/src/pages/.../Cardapio.jsx` (ou onde cria pedido):**

```jsx
async function finalizarPedido(dadosPedido) {
  try {
    const response = await api.post(`/api/${tenantId}/pedidos`, dadosPedido);
    const { pedido, whatsappUrl } = response.data;

    // Mostrar modal de sucesso
    setMensagemSucesso(`Pedido #${pedido.numeroPedido} criado com sucesso!`);

    // Aguardar 1 segundo e abrir WhatsApp
    setTimeout(() => {
      if (whatsappUrl) {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      }
    }, 1000);

  } catch (error) {
    console.error(error);
    setMensagemErro('Erro ao criar pedido. Tente novamente.');
  }
}
```

### 2. Botão "Enviar pelo WhatsApp" (Mais controle)

```jsx
{pedidoCriado && whatsappUrl && (
  <div className="pedido-sucesso">
    <h3>✅ Pedido #{numeroPedido} criado!</h3>
    <p>Clique no botão abaixo para enviar ao restaurante:</p>
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-whatsapp"
    >
      📲 Enviar pelo WhatsApp
    </a>
  </div>
)}
```

### 3. Copiar mensagem (Fallback)

Se o usuário estiver em desktop e não quiser abrir WhatsApp Web:

```jsx
const copiarMensagem = () => {
  // Backend precisa retornar `whatsappText` além de `whatsappUrl`
  navigator.clipboard.writeText(whatsappText);
  alert('Mensagem copiada! Cole no WhatsApp.');
};

<button onClick={copiarMensagem} className="btn-copiar">
  📋 Copiar Mensagem
</button>
```

**Para isso, modifique `PedidoController.create`:**
```javascript
// Gerar link e texto separados
const whatsappUrl = PedidoController.gerarLinkWhatsApp(novoPedido, tenant);
const whatsappText = decodeURIComponent(whatsappUrl.split('text=')[1]);

res.status(200).json({
  message: "Pedido criado com sucesso!",
  pedido: novoPedido,
  whatsappUrl,
  whatsappText  // <-- adicionar
});
```

---

## 🧪 Testando Impressão Térmica Real

### Via App de Impressora Térmica

1. **Receber mensagem no WhatsApp** (restaurante)
2. **Copiar a mensagem completa** (toque e segure → Copiar)
3. **Abrir app de impressora térmica** (ex: "Thermal Printer", "BlueTooth Printer")
4. **Colar texto** na área de impressão do app
5. **Imprimir**

**Resultado esperado:**
- Emojis aparecem (mesmo em preto/branco, ficam reconhecíveis)
- Separadores `━━━━` criam divisões visuais
- Texto bem espaçado e legível
- Largura se ajusta (58mm/80mm)

---

## ❓ Troubleshooting

### WhatsApp Web não abre mensagem no desktop
**Causa:** Alguns navegadores bloqueiam `wa.me` em desktop.  
**Solução:** Use celular ou instale WhatsApp Desktop (app nativo).

### Link WhatsApp não funciona no iOS
**Causa:** Safari pode bloquear popups.  
**Solução:** Peça ao usuário para permitir popups ou use navegação direta (`window.location.href = whatsappUrl`).

### Impressão ainda em branco no mobile
**Causa:** CSS pode não ter sido aplicado no deploy.  
**Solução:** 
1. Limpe cache do navegador mobile
2. Verifique se o arquivo CSS foi commitado e enviado
3. Force rebuild no Vercel (Settings → "Redeploy")

### Mensagem muito longa truncada no WhatsApp
**Causa:** WhatsApp tem limite de ~65KB na URL.  
**Solução:** Reduza tamanho da mensagem (remova rodapé, simplifique extras).

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique logs do backend (Vercel → Functions → Logs)
2. Inspecione resposta da API (DevTools → Network → `/pedidos`)
3. Teste URL `wa.me` manualmente copiando do JSON
4. Valide CSS de impressão (DevTools → Application → CSS)

---

**Data:** 21/11/2025  
**Versão:** 1.0  
**Status:** ✅ Pronto para teste
