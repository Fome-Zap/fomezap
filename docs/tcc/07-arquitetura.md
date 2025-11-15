# 7. Arquitetura do Sistema

## 7.1 Visão Geral

O FomeZap foi projetado como uma plataforma SaaS multi-tenant que serve vários clientes (restaurantes) a partir de uma única base de código. A detecção de tenant é feita por host/subdomínio ou por parâmetro em desenvolvimento. Para cada tenant, os dados (produtos, categorias, pedidos) são isolados por `tenantId` (FOWLER, 2002; AMAZON WEB SERVICES, 2020).

Arquitetura em camadas:
- Apresentação (Frontend React)
- API (Backend Express)
- Persistência (MongoDB)

## 7.2 Componentes Principais

- Frontend (React + Vite) (REACT, 2024)
  - `src/pages/FomeZapExact.jsx` — cardápio público e lógica de carregamento por tenant
  - `src/components/*` — componentes reutilizáveis (cards, filtros, modal de extras)
  - `contexts/TenantContext.jsx` — provê dados do tenant a toda a aplicação

- Backend (Node.js + Express) (NODE.JS, 2024)
  - `index.js` — ponto de entrada, configuração de CORS, rotas e health check
  - `Routes/*` — rotas públicas, admin, autenticação e tenant
  - `Controllers/*` — lógica de negócio por recurso
  - `Models/*` — modelos Mongoose (Tenant, Categoria, Produto, Extra, Pedido)
  - `db/conn.js` — conexão com MongoDB

-- Armazenamento de arquivos
  - Diretório `uploads/` exposto como recurso estático (`/uploads`) e processamento com `sharp`

-- Infraestrutura
  - Deploy frontend: Vercel (configuração para subdomínios e wildcard)
  - Backend: container Docker com `docker-compose` (Nginx reverso, MongoDB, Redis opcional) (MONGODB, 2024)

## 7.3 Multi-Tenancy

- Detecção: pelo hostname (`<tenant>.fomezap.com`) ou query param (`?tenant=demo`) em desenvolvimento.
- Isolamento de dados: todos os documentos no banco possuem campo `tenantId` e índices compostos para garantir consultas eficientes e separação lógica.
- Segurança: middleware aplica verificação de token (JWT) para rotas admin; funções do backend filtram resultados por `tenantId`.

## 7.4 Diagrama arquitetural (texto)

Frontend (React) -> API (Express) -> MongoDB
                      ↑
                 Uploads/Assets

- Requests públicos para `/api/*` retornam dados filtrados por tenant
- Rotas admin em `/api/admin/*` requerem JWT e verificações de tenant-admin

## 7.5 Considerações de escalabilidade

- Servir assets e imagens via CDN (ex.: Cloudflare) para reduzir latência
- Separar serviços em containers / microservices quando o número de tenants crescer
- Utilizar índices apropriados no MongoDB e cache (Redis) para leituras frequentes

---

Se desejar, gero também diagramas visuais (UML/ER) em formato SVG/PNG e adiciono em `docs/tcc/diagrams/`.