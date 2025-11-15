```markdown
# 12. Testes e Validação

## 12.1 Objetivo

Documentar a estratégia de testes do projeto FomeZap, descrevendo casos de teste funcionais, de integração, desempenho e segurança, além do protocolo de execução e template de relatório de validação. Esta seção serve como anexo prático para a defesa do TCC e para guiar a etapa experimental do protótipo (ex.: Jornada de Maria — IoT).

## 12.2 Escopo

- Testes funcionais (frontend e backend): navegação, carrinho, checkout, gravação de pedido.
- Testes de integração: publicação/consumo de eventos (MQTT/webhook) entre backend e dispositivos IoT.
- Testes de segurança: isolamento por tenant, proteção de rotas admin (JWT), validação de inputs.
- Testes de desempenho: latência das principais rotas e capacidade do MVP sob carga reduzida (meta inicial 50–100 usuários simultâneos).
- Testes de conformidade (LGPD): fluxo de exclusão de dados, consentimento e armazenamento mínimo.

## 12.3 Critérios gerais de aceitação

- Todos os casos críticos (prioridade alta) devem passar em pelo menos 4 execuções consecutivas para considerar estabilidade.
- Para integração MQTT: payload publicado pelo backend é recebido pelo dispositivo subscrito em menos de 3 segundos em rede local.
- Para isolamento por tenant: dados de um tenant não devem ser visíveis para outro tenant em qualquer endpoint público ou admin.

## 12.4 Matriz de Casos de Teste (amostra)

- TC-01 — Carregar Cardápio (Frontend)
  - Objetivo: verificar que o cardápio do tenant carrega corretamente.
  - Pré-condições: tenant `demo` populado; servidor backend em execução.
  - Passos: abrir `https://localhost:5173/?tenant=demo` ou usar subdomínio; navegar entre categorias.
  - Resultado esperado: categorias/produtos aparecem com imagens (ou placeholder) e preços.
  - Critério de aceitação: carregamento em < 2s (rede local) e ausência de erro JS.

- TC-02 — Adicionar produto ao carrinho
  - Objetivo: validar adição, seleção de extras e persistência local.
  - Passos: selecionar produto com extras → escolher extras → adicionar → fechar e reabrir página.
  - Resultado esperado: item presente no `localStorage` (`carrinho_${tenantId}`) e mostragem correta no UI.

- TC-03 — Finalizar pedido e abrir WhatsApp
  - Objetivo: verificar que o fluxo de checkout salva pedido no backend e abre `wa.me` com mensagem.
  - Passos: preencher dados no checkout → confirmar → observar redirect/abrir WhatsApp.
  - Resultado esperado: backend retorna `numeroPedido` e pedido aparece em collection `pedidos`; WhatsApp abre com mensagem codificada.

- TC-04 — Gravação de pedido no backend (API)
  - Objetivo: checar consistência dos dados persistidos.
  - Passos: executar POST `/api/:tenant/pedidos` com payload de teste (via Postman/curl).
  - Resultado esperado: resposta 201 com `numeroPedido` e documento criado no MongoDB com `tenantId` correto.

- TC-05 — Atualização de status e publicação MQTT
  - Objetivo: verificar que alterações de `Pedido.status` acionam publicação de evento.
  - Passos: autenticar admin → atualizar status de pedido para `preparando` → observar broker MQTT ou webhook.
  - Resultado esperado: mensagem publicada no tópico `tenant/{tenantId}/pedidos/{numero}` com payload correspondente; tempo de entrega < 3s.

- TC-06 — Recebimento em dispositivo IoT
  - Objetivo: validar subscriber (Raspberry Pi) recebe e renderiza pedido.
  - Passos: colocar device subscrito no tópico → executar TC-05 → verificar exibição no device.
  - Resultado esperado: device mostra `numeroPedido`, itens e observações; som/LED acionam conforme configuração.

- TC-07 — Isolamento por tenant (segurança)
  - Objetivo: garantir que queries retornem apenas dados do tenant requisitado.
  - Passos: realizar consulta pública e admin com tenant A e B (dados distintos).
  - Resultado esperado: dados de A não aparecem para B; testes automatizados com scripts devem confirmar.

- TC-08 — Proteção de rotas admin (auth)
  - Objetivo: checar que rotas em `/api/admin/*` retornam 401 sem JWT.
  - Passos: chamar rota admin sem token; com token inválido; com token válido.
  - Resultado esperado: 401/403 quando não autorizado; 200 quando autorizado.

- TC-09 — Fluxo LGPD: exclusão de dados
  - Objetivo: validar processo de remoção/anonimização de dados de cliente mediante solicitação.
  - Passos: criar pedido com dados de cliente → executar rotina de exclusão (endpoint/adm) → verificar remoção/anonimização no DB.
  - Resultado esperado: dados pessoais removidos/anonimizados; logs de auditoria atualizados.

## 12.5 Procedimento de Teste Manual — exemplo completo (TC-05 + TC-06)

1. Preparar ambiente:
   - Iniciar MongoDB (local ou Atlas) e backend (`Backend`).
   - Iniciar broker MQTT local via Docker (PowerShell):

```powershell
docker run -d --name mosquitto -p 1883:1883 eclipse-mosquitto:2
```

2. Subscritor (Raspberry Pi) — instrução de teste rápida (no device):

```powershell
# instalar dependências no device (Node.js)
npm install mqtt
node subscriber.js
```

3. No backend, autenticar como admin e atualizar um pedido para `preparando` (via Postman/curl).

4. Verificar no subscriber (console/monitor) que o payload chegou e foi renderizado.

5. Registrar evidências: captura de tela do device, logs do broker e entrada no MongoDB.

## 12.6 Automação e Ferramentas sugeridas

- Testes de API/integração: Postman + Newman ou `supertest` + `jest` para testes automatizados Node.js.
- Testes de carga: `k6` para simular até 100 usuários e coletar latência/erros.
- Testes de integração MQTT: pequenos scripts Node.js (usar `mqtt` npm) para publisher/subscriber; criar `prototype/` com `publisher.js` e `subscriber.js` nos próximos passos.

Exemplo rápido (publisher via Node.js):

```js
// publisher-test.js
const mqtt = require('mqtt');
const client = mqtt.connect(process.env.MQTT_URL || 'mqtt://localhost:1883');
client.on('connect', () => {
  const payload = JSON.stringify({ tenantId: 'demo', numeroPedido: 999, status: 'preparando', itens: [] });
  client.publish('tenant/demo/pedidos/999', payload, { qos: 1 }, () => {
    console.log('published');
    client.end();
  });
});
```

## 12.7 Template de relatório de validação (a ser preenchido após execução)

- Teste: (TC-id)
- Executor: (nome)
- Data / Hora:
- Ambiente: (backend commit / frontend commit / DB / broker)
- Passos executados:
- Resultado esperado:
- Resultado obtido:
- Evidências: (caminho para screenshots / logs)
- Observações / defeitos encontrados:

## 12.8 Cronograma de execução e amostragem

- Execuções iniciais: 5 repetições de cada caso crítico (TC-01 a TC-06) em ambiente local com rede Wi‑Fi do restaurante.
- Coleta de métricas: latência (ms) de publicação MQTT, tempo de resposta da API (ms), taxa de sucesso (%).

---

Próximos passos sugeridos (após revisão desta seção):
- Gerar o `prototype/publisher.js` e `prototype/subscriber.js` para automatizar TC-05/TC-06. Posso criar esses arquivos e instruções agora.
- Preparar um conjunto de scripts `npm` para rodar suítes de teste básicas (Postman/Newman ou jest + supertest).

``` 
