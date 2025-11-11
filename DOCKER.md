# 🐳 Docker - FomeZap

## Teste Local com Docker Compose

### Pré-requisitos
- Docker Desktop instalado
- Docker Compose (já vem com Docker Desktop)

### 🚀 Como Rodar

```bash
# 1. Build das imagens (primeira vez)
docker-compose build

# 2. Subir os containers
docker-compose up

# 3. Acessar:
# - Frontend: http://localhost
# - Backend: http://localhost:5000
# - MongoDB: localhost:27017
```

### 📦 Comandos Úteis

```bash
# Rodar em background
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Parar containers
docker-compose down

# Parar e remover volumes (limpa banco de dados)
docker-compose down -v

# Rebuild após mudanças no código
docker-compose up --build

# Entrar no container
docker exec -it fomezap-backend sh
docker exec -it fomezap-frontend sh
docker exec -it fomezap-mongodb mongosh
```

### 🔧 Configuração

Edite as variáveis em `.env.docker` ou no `docker-compose.yml`:

- **MongoDB**: Usuário, senha, database
- **Backend**: Porta, JWT Secret, CORS
- **Frontend**: URL da API

### 📁 Volumes

Os dados persistem em volumes Docker:
- `mongodb_data`: Banco de dados MongoDB
- `./Backend/uploads`: Uploads de imagens (bind mount)

### 🌐 Portas

- **80**: Frontend (Nginx)
- **5000**: Backend (Node.js)
- **27017**: MongoDB

### 🧪 Testar Funcionamento

1. Abra http://localhost
2. Login: `admin@demo.com` / `123456`
3. Acesse o painel admin
4. Crie categorias e produtos
5. Visualize no cardápio

### 🐛 Troubleshooting

**Erro "port already in use":**
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 80).OwningProcess | Stop-Process
```

**Rebuild completo:**
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

**Ver IP dos containers:**
```bash
docker network inspect todo_fomezap-network
```

### 📱 Testar no Celular

1. Descubra seu IP local:
```bash
# Windows
ipconfig
# Procure por "IPv4 Address" (ex: 192.168.1.100)
```

2. No celular, acesse:
```
http://192.168.1.100
```

3. Ajuste CORS no `docker-compose.yml` se necessário:
```yaml
CORS_ORIGINS: http://localhost:3000,http://192.168.1.100
```

### 🚀 Depois do Teste Local

Se tudo funcionar, siga o **DEPLOY.md** para deploy em produção:
- Railway (Backend + MongoDB)
- Vercel (Frontend)
- Cloudflare (DNS)
