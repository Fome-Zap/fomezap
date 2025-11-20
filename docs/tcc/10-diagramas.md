# 10. Diagramas e Modelo de Dados (DER)

## 10.1 Visão Geral do Modelo
O modelo de dados do FomeZap segue uma estrutura multi-tenant: todas as coleções possuem `tenantId` para garantir isolamento lógico entre clientes (restaurantes) (FOWLER, 2002). As principais coleções/entidades são: `Tenant`, `Categoria`, `Produto`, `Extra`, `Pedido` (MONGODB, 2024).

## 10.2 Entidades e Atributos (resumo extraído de `Backend/Models/TenantModels.js`)

- Tenant
  - tenantId (string, único)
  - nome (string)
  - slug (string, único)
  - logo (string)
  - telefone, endereco
  - horarioFuncionamento: abertura, fechamento, diasSemana
  - tema: corPrimaria, corSecundaria, corBotao
  - configuracoes: mostarPrecos, permitirExtras, taxaEntrega, pedidoMinimo, formasPagamento, mensagemWhatsApp
  - status, plano, proprietario

- Categoria
  - tenantId
  - nome
  - icone
  - imagemPadrao
  - ordem
  - ativa

- Produto
  - tenantId
  - codigo
  - nome
  - descricao
  - preco
  - categoria (ObjectId -> Categoria)
  - emoji
  - imagem
  - disponivel
  - destaque
  - extras [array de extra IDs]
  - tags

- Extra
  - tenantId
  - nome
  - preco
  - disponivel

- Pedido
  - tenantId
  - numeroPedido
  - cliente: { nome, telefone, email }
  - itens: [ { produtoId (ObjectId), nome, preco, quantidade, extras: [{nome, preco}], observacoes, subtotal } ]
  - entrega: { tipo (retirada|delivery), endereco, taxa }
  - subtotal, taxaEntrega, valorTotal
  - pagamento: { forma, status }
  - status (recebido, preparando, pronto, saiu_entrega, entregue, cancelado)
  - observacoes

## 10.3 Diagrama Entidade-Relacionamento (texto + ASCII)

Tenant (1) --- (N) Categoria
Tenant (1) --- (N) Produto
Tenant (1) --- (N) Extra
Tenant (1) --- (N) Pedido
Categoria (1) --- (N) Produto
Produto (N) --- (N) Extra (representado por array de IDs em `Produto.extras`)
Pedido (1) --- (N) Itens (cada item referencia Produto por `produtoId`)

ASCII DER simplificado:

[Tenant]
  tenantId PK
  nome
  slug
  ...
      |
      |1..N
      |
[CATEGORY]
  _id PK
  tenantId FK
  nome
  ...
      |
      |1..N
      |
[PRODUCT]
  _id PK
  tenantId FK
  categoria FK -> CATEGORY._id
  nome
  preco
  extras -> [Extra._id]

[EXTRA]
  _id PK
  tenantId FK
  nome
  preco

[ORDER]
  _id PK
  tenantId FK
  numeroPedido
  cliente
  itens -> [{ produtoId -> PRODUCT._id, quantidade, extras: [{nome, preco}] }]

## 10.4 Observações de Modelagem
- A modelagem prioriza a simplicidade para consultas de leitura (frontend). Produtos embutem referência a extras por IDs para reduzir `join`-like operations no NoSQL.
- Índices estão configurados para `tenantId` e campos frequentemente consultados (categoria, disponivel, status) para performance.
- Se o sistema escalar para muitos tenants, considerar particionamento por tenant em bancos separados ou shard keys no MongoDB.

## 10.5 Próximos passos (opcionais)
- Gerar diagramas visuais (PNG/SVG) a partir do modelo acima: posso criar SVGs do DER e do diagrama de classes e salvar em `docs/tcc/diagrams/`.
- Gerar diagrama de sequência para o fluxo de pedido (Navegar → Adicionar ao carrinho → Checkout → Salvar pedido → Enviar WhatsApp).

Quer que eu desenhe e salve os diagramas visuais agora (SVG) ou prefere primeiro revisar o texto/modelo? Se sim, indico onde os arquivos ficarão (`docs/tcc/diagrams/der.svg`, `docs/tcc/diagrams/sequence_order.svg`).