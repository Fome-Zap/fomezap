# FomeZap - Kubernetes Deployment

## 🎯 Estrutura 100% Local

Este diretório contém os arquivos de configuração do Kubernetes para deploy **totalmente local** do FomeZap, incluindo MongoDB.

## 📦 Arquivos

### 1. `mongodb-deployment.yaml`
Deploy do MongoDB containerizado no Kubernetes.

**Recursos criados:**
- **Deployment:** 1 réplica do MongoDB 7.0
- **Service:** ClusterIP na porta 27017
- **Volume:** emptyDir para persistência durante a sessão

**Configuração:**
```yaml
Database: FomeZap
Port: 27017
Replicas: 1
Storage: emptyDir (temporário)
```

### 2. `backend-deployment.yaml`
Deploy da API Node.js + Express.

**Recursos criados:**
- **Deployment:** 2 réplicas do backend
- **Service:** ClusterIP na porta 5000

**Variáveis de Ambiente:**
- `NODE_ENV=production`
- `PORT=5000`
- `MONGODB_URI=mongodb://mongodb-service:27017/FomeZap` (conecta no MongoDB local)
- `JWT_SECRET=fomezap-jwt-secret-2025-k8s`

### 3. `frontend-deployment.yaml`

## Pré-requisitos

- Docker Desktop instalado
- Kubernetes habilitado no Docker Desktop (Settings → Kubernetes → Enable)
- PowerShell

## 🚀 Passo a Passo para Deploy

### Opção 1: Deploy Automático (RECOMENDADO)

```powershell
# Na raiz do projeto
.\deploy-k8s.ps1
```

Este script faz tudo automaticamente:
1. Build das imagens Docker
2. Deploy do MongoDB
3. Aguarda MongoDB ficar pronto
4. Deploy do Backend
5. Deploy do Frontend
6. Exibe status completo

**Tempo estimado: 15-20 minutos**

---

### Opção 2: Deploy Manual

#### 1. Build das Imagens Docker

```powershell
# Backend
cd Backend
docker build -t fomezap-backend:latest .

# Frontend
cd ..\Frontend
docker build -t fomezap-frontend:latest .
```

#### 2. Deploy no Kubernetes (NA ORDEM CORRETA)

```powershell
cd ..\k8s

# 1. Deploy MongoDB PRIMEIRO
kubectl apply -f mongodb-deployment.yaml

# 2. Aguarde MongoDB ficar pronto
Start-Sleep -Seconds 10

# 3. Deploy Backend
kubectl apply -f backend-deployment.yaml

# 4. Deploy Frontend
kubectl apply -f frontend-deployment.yaml
```

---

### 3. Verificar Status

```powershell
# Ver todos os pods (deve mostrar 5 pods)
kubectl get pods

# Exemplo de saída esperada:
# NAME                                    READY   STATUS
# mongodb-deployment-xxxxx                1/1     Running
# backend-deployment-xxxxx-1              1/1     Running
# backend-deployment-xxxxx-2              1/1     Running
# frontend-deployment-xxxxx-1             1/1     Running
# frontend-deployment-xxxxx-2             1/1     Running

# Ver services
kubectl get services

# Ver deployments
kubectl get deployments
```

### 4. Acessar Aplicação

- **Frontend:** http://localhost:30080
- **Backend:** Interno (ClusterIP) - acessível apenas pelos pods

---

## 📊 Recursos Criados

| Recurso | Quantidade | Descrição |
|---------|-----------|-----------|
| **Pods** | 5 | 1 MongoDB + 2 Backend + 2 Frontend |
| **Deployments** | 3 | mongodb, backend, frontend |
| **Services** | 3 | mongodb (ClusterIP), backend (ClusterIP), frontend (NodePort) |

**Total de Pods: 5 ✅**

---

## 🏗️ Arquitetura

```
┌─────────────────────────────┐
│   Navegador (localhost)     │
└─────────────┬───────────────┘
              │ :30080
              ▼
┌─────────────────────────────┐
│  frontend-service (NodePort)│
└─────────────┬───────────────┘
              │
       ┌──────┴──────┐
       ▼             ▼
  ┌─────────┐  ┌─────────┐
  │Frontend │  │Frontend │
  │  Pod 1  │  │  Pod 2  │
  └────┬────┘  └────┬────┘
       │            │
       └──────┬─────┘
              │ /api → :5000
              ▼
┌─────────────────────────────┐
│ backend-service (ClusterIP) │
└─────────────┬───────────────┘
              │
       ┌──────┴──────┐
       ▼             ▼
  ┌─────────┐  ┌─────────┐
  │Backend  │  │Backend  │
  │  Pod 1  │  │  Pod 2  │
  └────┬────┘  └────┬────┘
       │            │
       └──────┬─────┘
              │ :27017
              ▼
┌─────────────────────────────┐
│ mongodb-service (ClusterIP) │
└─────────────┬───────────────┘
              │
              ▼
        ┌─────────┐
        │MongoDB  │
        │   Pod   │
        └─────────┘
```

---

## 🔧 Comandos Úteis

```powershell
# Ver logs do MongoDB
kubectl logs -l app=mongodb

# Ver logs do Backend
kubectl logs -l app=fomezap-backend

# Ver logs do Frontend
kubectl logs -l app=fomezap-frontend

# Ver logs de um pod específico em tempo real
kubectl logs -f <nome-do-pod>

# Entrar dentro de um pod
kubectl exec -it <nome-do-pod> -- /bin/sh

# Reiniciar um deployment
kubectl rollout restart deployment backend-deployment

# Ver detalhes de um pod
kubectl describe pod <nome-do-pod>

# Deletar tudo
kubectl delete -f mongodb-deployment.yaml
kubectl delete -f backend-deployment.yaml
kubectl delete -f frontend-deployment.yaml

# Ou simplesmente
kubectl delete -f .
```

---

## 🆘 Troubleshooting

### Pods não iniciam (Pending)
```powershell
kubectl describe pod <nome-do-pod>
# Veja a seção "Events" para detalhes
```

### Backend não conecta no MongoDB
```powershell
# Verifique se MongoDB está rodando
kubectl get pods -l app=mongodb

# Veja os logs do MongoDB
kubectl logs -l app=mongodb

# Veja os logs do Backend
kubectl logs -l app=fomezap-backend
```

### Imagem não encontrada
Certifique-se de que:
1. As imagens foram buildadas localmente
2. Os deployments usam `imagePullPolicy: Never`

### Aplicação não carrega no navegador
```powershell
# Verifique o frontend
kubectl logs -l app=fomezap-frontend

# Teste direto
curl http://localhost:30080
```

---

## 🧹 Limpeza Completa

```powershell
# Deletar todos os recursos
kubectl delete -f .

# Verificar que tudo foi deletado
kubectl get all
```

---

## 📸 Para Capturar Prints (TCC)

Execute o script de relatório:

```powershell
.\k8s-relatorio.ps1
```

Este script gera:
- Lista de pods (mostrando 5 pods)
- Lista de services
- Lista de deployments
- Logs do MongoDB, Backend e Frontend
- Informações do cluster

**Tire print da tela completa do output!**

---

## 🎓 Pontos Importantes para Apresentação

✅ **5 pods rodando** (alta disponibilidade)
✅ **MongoDB containerizado** (não depende de cloud)
✅ **Escalabilidade configurada** (réplicas)
✅ **Arquitetura multi-camadas** (frontend → backend → database)
✅ **Services** (ClusterIP e NodePort)
✅ **Ambiente reproduzível** (qualquer pessoa pode rodar)

