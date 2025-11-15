# 9. Casos de Uso — FomeZap

## 9.1 Visão Geral
Este documento descreve os casos de uso principais do sistema FomeZap, adaptados ao formato acadêmico do TCC e baseados nas funcionalidades implementadas no repositório (`Frontend/src/pages/FomeZapExact.jsx`, `Backend/Models/TenantModels.js`).

Atores principais:
- Cliente (usuário final) — pessoa que acessa o cardápio, adiciona ao carrinho e finaliza pedido.
- Administrador do Tenant (restaurante) — usuário com acesso ao painel administrativo do tenant, gerencia produtos, categorias e pedidos.
- Plataforma (Operador/Administrador FomeZap) — responsável por manutenção global, provisionamento de tenants e configurações do SaaS.

## 9.2 Casos de Uso Principais

1. Navegar Cardápio (Cliente)
- Descrição: O cliente acessa o site do restaurante (subdomínio ou slug) e visualiza categorias e produtos.
- Fluxo principal: detectar tenant → carregar categorias/produtos/extras → filtrar por categoria → exibir produto.
- Critérios de aceitação: categorias e produtos carregam corretamente; placeholders aparecem se imagens ausentes.

2. Adicionar Produto ao Carrinho (Cliente)
- Descrição: O cliente adiciona um produto ao carrinho. Se o produto possuir extras, abre modal para selecionar extras.
- Fluxo: clicar "Adicionar" → validar horário (aberto/fechado) → se possuir extras abrir modal → confirmar extras → persistir no `localStorage` com chave `carrinho_${tenantId}`.
- Exceções: restaurante fechado → mostrar modal informando horário.

3. Gerenciar Carrinho (Cliente)
- Descrição: visualizar itens, alterar quantidades, adicionar observações, remover itens.
- Fluxo: abrir sidebar do carrinho → alterar quantidade / editar observação / remover → total recalculado.

4. Finalizar Pedido e Enviar via WhatsApp (Cliente)
-- Descrição: o cliente informa dados de entrega/pagamento e envia pedido para o restaurante via WhatsApp (WHATSAPP, 2025); o pedido também é gravado na API (MONGODB, 2024).
-- Fluxo: checkout → preencher dados → salvar pedido no backend (`POST /:tenant/pedidos`) → construir mensagem formatada → abrir `https://wa.me/...` com texto codificado (WHATSAPP, 2025).
- Critérios de aceitação: pedido salvo com `numeroPedido`, valores calculados corretamente e WhatsApp aberto com mensagem adequada.

5. Painel Administrativo — Gerenciar Produtos/Categorias/Extras (Administrador Tenant)
- Descrição: o administrador realiza CRUD de categorias, produtos e extras, gerencia imagens e disponibilidades.
- Fluxo: autenticar → acessar `/api/admin/*` → criar/editar/excluir recursos → validação de `tenantId` em cada operação.
- Critérios de aceitação: operações persistem no MongoDB e são visíveis no front publicamente após publicação.

6. Painel Administrativo — Gerenciar Pedidos (Administrador Tenant)
- Descrição: visualizar pedidos recebidos, atualizar status (preparando, pronto, entregue), e confirmar pagamento.
- Fluxo: listar pedidos filtrados por tenant → clicar em pedido → alterar status → salvar.

7. Multi-Tenant Provisioning / Setup Demo (Plataforma)
- Descrição: criar tenant `demo` para demonstrações com dados pré-populados; endpoint `/setup-demo` usado para povoar DB.
- Fluxo: executar endpoint → API cria Tenant, categorias, produtos e extras → endpoint retorna testUrl.
	(Padrões de provisionamento consideram trade-offs de isolamento e custo — FOWLER, 2002; AMAZON WEB SERVICES, 2020)

8. Upload e Gerenciamento de Imagens (Administrador Tenant)
- Descrição: upload de fotos com compressão (sharp), criação de thumbnails e armazenamento em `uploads/`.
- Fluxo: enviar arquivo via formulário → multer recebe → sharp processa → salvar caminho no modelo.

## 9.3 Casos de Uso de Suporte
- Health Check (Plataforma): `GET /health` — valida status da API.
- Detect Tenant (Debug): `GET /detect-tenant` — ferramenta para detectar tenant via `host` ou query param.

## 9.4 Diagramas de Casos de Uso (descrição)
- Diagrama 1: Cliente interage com a UI (navegação → adicionar ao carrinho → checkout → WhatsApp).
- Diagrama 2: Administrador interage com painel (autenticação → CRUD produtos/categorias/extras → gerenciar pedidos).

(Se desejar, eu gero imagens SVG/PNG dos diagramas e registro em `docs/tcc/diagrams/`.)
