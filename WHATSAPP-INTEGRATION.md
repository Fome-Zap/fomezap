# 📱 Integração WhatsApp - Notificações de Status

## 🎯 Objetivo
Enviar notificações automáticas via WhatsApp para clientes quando o status do pedido mudar.

## 📋 Status que Acionam Notificação
- **Preparando** → "Seu pedido #6704 está sendo preparado na cozinha! 🔥"
- **Pronto** → "Pedido pronto! Pode vir buscar 😊" (retirada) ou "Pedido pronto para entrega!" (delivery)
- **Saiu para Entrega** → "Motoboy saiu com seu pedido! Chegando em breve 🏍️"

## 🆓 Solução Recomendada: Evolution API

### Por que Evolution API?
- ✅ **100% Gratuito** e ilimitado
- ✅ Usa seu WhatsApp Business normal
- ✅ Fácil de instalar (Docker)
- ✅ Interface web para gerenciar
- ✅ Comunidade ativa brasileira

### Volume Seguro
- ✅ Até 500 msgs/dia = Seguro
- ⚠️ 500-1000/dia = OK, monitore
- ❌ +1000/dia = Risco de ban

**Seu caso:** 40 pedidos/dia × 3 notificações = 120 msgs/dia = **SUPER SEGURO**

---

## 🚀 Como Instalar Evolution API

### Opção 1: Railway (Recomendado - Grátis)
```bash
# 1. Criar conta no Railway: https://railway.app
# 2. New Project → Deploy from GitHub
# 3. Usar repo: https://github.com/EvolutionAPI/evolution-api
# 4. Adicionar variáveis de ambiente:
DATABASE_ENABLED=false
AUTHENTICATION_API_KEY=sua_chave_secreta_aqui
```

### Opção 2: Docker Local (Para testar)
```bash
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=sua_chave_secreta \
  atendai/evolution-api
```

---

## 🔧 Implementação Backend

### 1. Instalar Dependência
```bash
cd Backend
npm install axios
```

### 2. Criar Serviço WhatsApp
**Arquivo:** `Backend/services/WhatsAppService.js`

```javascript
const axios = require('axios');

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || 'sua_chave';
const INSTANCE_NAME = 'restaurante'; // Nome da instância

class WhatsAppService {
  // Enviar mensagem
  async enviarMensagem(telefone, mensagem) {
    try {
      // Remove caracteres especiais do telefone
      const telefoneFormatado = telefone.replace(/\D/g, '');
      
      await axios.post(
        `${EVOLUTION_API_URL}/message/sendText/${INSTANCE_NAME}`,
        {
          number: `55${telefoneFormatado}@s.whatsapp.net`,
          text: mensagem
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': EVOLUTION_API_KEY
          }
        }
      );
      
      console.log(`✅ WhatsApp enviado para ${telefone}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar WhatsApp:', error.message);
      return false;
    }
  }

  // Gerar mensagem baseada no status
  gerarMensagem(pedido, novoStatus) {
    const nomeRestaurante = pedido.tenantId; // Ou pegar do tenant
    const numeroPedido = pedido.numeroPedido;
    
    const mensagens = {
      preparando: `🔥 *Boa notícia!*\n\nSeu pedido #${numeroPedido} está sendo preparado na cozinha!\n\n_${nomeRestaurante}_`,
      
      pronto: pedido.entrega.tipo === 'retirada' 
        ? `✅ *Pedido Pronto!*\n\nSeu pedido #${numeroPedido} está pronto!\nPode vir buscar 😊\n\n_${nomeRestaurante}_`
        : `✅ *Pedido Pronto!*\n\nSeu pedido #${numeroPedido} está pronto para entrega!\n\n_${nomeRestaurante}_`,
      
      saiu_entrega: `🏍️ *Saiu para entrega!*\n\nMotoboy saiu com seu pedido #${numeroPedido}!\nChegando em breve 🚀\n\n_${nomeRestaurante}_`
    };
    
    return mensagens[novoStatus] || null;
  }

  // Notificar mudança de status
  async notificarMudancaStatus(pedido, novoStatus) {
    // Só notifica nos status específicos
    if (!['preparando', 'pronto', 'saiu_entrega'].includes(novoStatus)) {
      return false;
    }

    const mensagem = this.gerarMensagem(pedido, novoStatus);
    if (!mensagem) return false;

    const telefone = pedido.cliente.telefone;
    return await this.enviarMensagem(telefone, mensagem);
  }
}

module.exports = new WhatsAppService();
```

### 3. Integrar no Controller
**Arquivo:** `Backend/Controllers/PedidoController.js`

```javascript
const whatsappService = require('../services/WhatsAppService');

// Na função de alterar status:
exports.alterarStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status: novoStatus } = req.body;
    const tenantId = req.tenantId;

    const pedido = await Pedido.findOne({ _id: id, tenantId });
    if (!pedido) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    // Atualizar status
    pedido.status = novoStatus;
    await pedido.save();

    // 🔔 ENVIAR NOTIFICAÇÃO WHATSAPP
    try {
      await whatsappService.notificarMudancaStatus(pedido, novoStatus);
    } catch (error) {
      console.error('Erro ao enviar WhatsApp (continuando):', error);
      // Não falha a requisição se WhatsApp falhar
    }

    res.json({ sucesso: true, pedido });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};
```

### 4. Adicionar Variáveis de Ambiente
**Arquivo:** `Backend/.env`

```env
# WhatsApp Evolution API
EVOLUTION_API_URL=https://sua-evolution-api.railway.app
EVOLUTION_API_KEY=sua_chave_secreta_aqui
```

---

## 📱 Configuração Evolution API

### 1. Criar Instância
```bash
POST /instance/create
{
  "instanceName": "restaurante",
  "qrcode": true,
  "integration": "WHATSAPP-BAILEYS"
}
```

### 2. Conectar WhatsApp
1. Acesse: `http://sua-evolution-api.com/instance/qrcode/restaurante`
2. Escaneie o QR Code com WhatsApp Business
3. Pronto! Conectado

### 3. Testar Envio
```bash
POST /message/sendText/restaurante
{
  "number": "5511999999999@s.whatsapp.net",
  "text": "Teste de mensagem!"
}
```

---

## 🎨 Exemplo de Mensagens

### Preparando
```
🔥 *Boa notícia!*

Seu pedido #6704 está sendo preparado na cozinha!

_Lanches do João_
```

### Pronto (Retirada)
```
✅ *Pedido Pronto!*

Seu pedido #6704 está pronto!
Pode vir buscar 😊

_Lanches do João_
```

### Pronto (Delivery)
```
✅ *Pedido Pronto!*

Seu pedido #6704 está pronto para entrega!

_Lanches do João_
```

### Saiu para Entrega
```
🏍️ *Saiu para entrega!*

Motoboy saiu com seu pedido #6704!
Chegando em breve 🚀

_Lanches do João_
```

---

## 🔒 Segurança

### Boas Práticas
1. ✅ Sempre use HTTPS
2. ✅ Guarde API Key em variável de ambiente
3. ✅ Valide telefone antes de enviar
4. ✅ Log de mensagens enviadas
5. ✅ Rate limiting (max 10 msgs/min por cliente)

### Prevenir Ban
- ❌ Não envie spam
- ❌ Não envie em horários inadequados (22h-8h)
- ❌ Não ultrapasse 1000 msgs/dia
- ✅ Use mensagens personalizadas
- ✅ Respeite opt-out do cliente

---

## 📊 Monitoramento

### Logs Recomendados
```javascript
// Criar tabela de logs
{
  pedidoId: ObjectId,
  telefone: String,
  status: String,
  mensagem: String,
  enviado: Boolean,
  erro: String,
  dataEnvio: Date
}
```

### Dashboard
- Total de mensagens enviadas/dia
- Taxa de sucesso
- Erros mais comuns

---

## 💰 Custos

### Evolution API (Recomendado)
- **Hospedagem Railway:** Grátis (com limites)
- **Mensagens:** Ilimitadas e gratuitas
- **Total:** R$ 0/mês

### WhatsApp Business API (Oficial)
- **Primeiras 1000 conversas/mês:** Grátis
- **Após 1000:** R$ 0,20 - R$ 0,80 por conversa
- **Exemplo 40 pedidos/dia:** R$ 0 (dentro do limite grátis)

---

## 🚀 Próximos Passos

1. ✅ Criar conta no Railway
2. ✅ Fazer deploy da Evolution API
3. ✅ Conectar WhatsApp Business
4. ✅ Implementar código backend
5. ✅ Testar com pedido real
6. ✅ Monitorar por 1 semana
7. ✅ Ajustar mensagens conforme feedback

---

## 📚 Recursos

- Evolution API: https://doc.evolution-api.com
- GitHub: https://github.com/EvolutionAPI/evolution-api
- Comunidade: https://t.me/evolutionapi
- Railway: https://railway.app

---

## ⚠️ Importante

Este documento serve como guia para implementação futura. A funcionalidade está **preparada** mas precisa:
1. Evolution API configurada
2. Variáveis de ambiente adicionadas
3. Código backend implementado (seguir este guia)

**Status Atual:** ⏳ Aguardando infraestrutura
**Tempo de Implementação:** ~2 horas após Evolution API configurada
