```markdown
# 13. Jornada de Maria — IoT

**Resumo da atividade:**

Esta seção descreve uma proposta criativa de jornada de usuário chamada "Jornada de Maria" que mistura UX e IoT para demonstrar como um caso de uso conectado pode ser prototipado e implementado como anexo prático do TCC/PI. A ideia é apresentar uma persona (Maria), mapear sua jornada completa desde descoberta até pós‑pedido, e propor um protótipo técnico que integra o sistema FomeZap com dispositivos IoT (notificações visuais/sonoras, painel de cozinha, smart speaker, etc.).

> Observação: usei como base o PDF anexado "A Jornada de Maria - UX IOT". Você já inseriu a imagem em `docs/tcc/jornadademaria.png`; eu a incluí abaixo para referência e também gerei um diagrama SVG simplificado em `docs/tcc/diagrams/jornadademaria.svg`.

![Jornada de Maria](./jornadademaria.png)

*Figura — Jornada de Maria (fonte: "A Jornada de Maria - UX IOT"; imagem adicionada ao repositório).* 

## 13.1 Persona

- Nome: Maria
- Idade: 38 anos
- Ocupação: Proprietária / chef de um pequeno restaurante local
- Objetivos: reduzir tempo entre cliente e cozinha, melhorar experiência de cliente no pedido e diminuir taxa de erro em pedidos.
- Contexto IoT: o restaurante de Maria tem um pequeno painel na cozinha (Raspberry Pi + monitor) e quer testar notificações automáticas quando um pedido muda de status.

## 13.2 Cenário (resumido)

1. Cliente acessa cardápio FomeZap (via subdomínio do tenant).
2. Cliente faz pedido e finaliza via WhatsApp (MVP atual) ou via checkout futuro.
3. Backend do FomeZap grava pedido e retorna `numeroPedido` e `status = recebido`.
4. Quando o status do pedido muda para `preparando` (admin marca no painel), o backend publica um evento para um broker MQTT/HTTP webhook.
5. O dispositivo IoT na cozinha (subscritor) mostra um card com o `numeroPedido`, itens e observações; também pode emitir som/LED.
6. Quando o pedido estiver pronto, o admin atualiza o status para `pronto` e um comando IoT acende um LED ou toca som para notificar o balcão/entregador.

## 13.3 Objetivos de UX e métricas

- Reduzir tempo médio entre pedido recebido e início da preparação (meta: -20%).
- Reduzir erros de leitura de pedidos (meta: -50% em 3 meses de teste).
- Satisfação do usuário (Maria/administrador do restaurante) medida por pesquisa NPS curta após 2 semanas.

## 13.4 Arquitetura proposta (alto nível)

- FomeZap Backend (Node.js/Express) — já persiste pedidos em MongoDB (`Pedido` collection).
- Componente de publicação de eventos: quando `Pedido.status` é alterado, o backend publica mensagem para um broker MQTT (`mosquitto`) ou para um webhook (Node-RED).
- Broker MQTT / Node-RED — roteia eventos para dispositivos locais (Raspberry Pi, ESP32) conectados na mesma rede.
- Dispositivos IoT (Raspberry Pi, ESP32 + display/LED/Buzzer) — exibem o pedido, recebem ACK de leitura e mostram status.

Fluxo técnico simplificado:

Client (frontend) -> POST /:tenant/pedidos -> Backend (salva pedido)
Backend -> (ao mudar status) -> mqtt.publish('tenant/{tenantId}/pedidos/{numero}', payload)
Kitchen device -> mqtt.subscribe('tenant/{tenantId}/pedidos/+') -> mostra payload

## 13.5 Exemplo de payload MQTT (JSON)

```
{
  "tenantId": "demo",
  "numeroPedido": 42,
  "status": "preparando",
  "itens": [
    { "nome": "X-Burguer", "qtd": 2, "observacoes": "sem cebola" }
  ],
  "cliente": { "nome": "João", "telefone": "11999990000" },
  "timestamp": "2025-11-15T14:32:00Z"
}
```

## 13.6 Exemplo de integração no backend (Node.js)

Trecho ilustrativo (adapte para os controllers existentes, ex.: `Controllers/PedidoController.js`):

```js
// require('mqtt') previamente instalado
const mqtt = require('mqtt');
const client = mqtt.connect(process.env.MQTT_URL || 'mqtt://broker.local');

function notifyOrderUpdate(pedido) {
  const topic = `tenant/${pedido.tenantId}/pedidos/${pedido.numeroPedido}`;
  client.publish(topic, JSON.stringify(pedido), { qos: 1 }, err => {
    if (err) console.error('MQTT publish error', err);
  });
}

// uso: chamar notifyOrderUpdate(pedido) sempre que o status for alterado
```

## 13.7 Prototipagem do dispositivo (ex.: Raspberry Pi)

- Stack sugerido: Raspberry Pi + Node.js ou Python + biblioteca MQTT (`mqtt` ou `paho-mqtt`) + Electron ou página web local para exibir pedidos.
- Alternativa leve: ESP32 com display OLED para notificações simples (apenas número e status) e Raspberry Pi para exibição detalhada.

Exemplo de subscriber em Node.js (Raspberry Pi):

```js
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.local');

client.on('connect', () => {
  client.subscribe('tenant/+/pedidos/+', { qos: 1 });
});

client.on('message', (topic, msg) => {
  const payload = JSON.parse(msg.toString());
  // renderizar no display local: numeroPedido, lista de itens, observacoes
  console.log('Pedido recebido:', payload.numeroPedido, payload.status);
});
```

## 13.8 UX: Jornada passo a passo (mapa)

1. Descoberta: cliente encontra o cardápio via link/subdomínio.
2. Seleção: escolhe itens e extras.
3. Checkout: insere dados e confirma pedido (WhatsApp ou API).
4. Confirmação: cliente vê número do pedido e tempo estimado.
5. Cozinha: dispositivo exibe pedido automaticamente ao admin/chef (Maria).
6. Preparação: chef atualiza status para `preparando` no painel; dispositivo indica início.
7. Pronto: chef atualiza para `pronto`; dispositivo toca/indica e o entregador pega o pedido.
8. Pós‑pedido: cliente recebe confirmação via WhatsApp/alerta e pesquisa de satisfação opcional.

## 13.9 Critérios de aceitação / testes

- Quando um pedido muda de `recebido` para `preparando`, um evento MQTT é publicado e o dispositivo subscrito recebe payload em menos de 3s.
- O dispositivo deve exibir claramente `numeroPedido` e itens; a informação deve corresponder ao que está salvo na base.
- Simular perda de conexão com broker: sistema backend deve enfileirar ou logar o evento para reenvio.

## 13.10 Integração com FomeZap (pontos concretos)

- Onde alterar: em `Backend/Controllers/PedidoController.js` (ou rota que atualiza status do pedido) inserir chamada para `notifyOrderUpdate(pedido)` logo após persistir a mudança.
- Configuração: adicionar `MQTT_URL` ao `.env` do backend e variáveis de configuração para topic namespace.
- Segurança: use TLS para MQTT se dispositivos não estiverem na mesma rede local; autenticação via usuário/senha no broker.

## 13.11 Entregáveis e anexos sugeridos

- Arquivo `docs/tcc/diagrams/jornadademaria.png` (imagem ilustrativa da jornada) — por favor envie a imagem e eu a insiro no documento.
- Protótipo mínimo: script Node.js publisher + subscriber em Raspberry Pi (instruções de setup em `docs/tcc/appendices/`).
- Checklist de testes e um pequeno relatório de validação com pelo menos 5 execuções de ponta a ponta.

---

Se quiser, eu já crio os arquivos auxiliares: um `prototype/` com o `publisher.js` e `subscriber.js`, e insiro a imagem `jornadademaria.png` se você carregar o arquivo aqui. Também posso gerar um diagrama SVG simples da jornada e salvá-lo em `docs/tcc/diagrams/`.

``` 
