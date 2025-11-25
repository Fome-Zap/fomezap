# Script de Deploy FomeZap no Kubernetes
# Autor: Thiago Figueredo
# Data: 24/11/2025

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  FomeZap - Deploy Kubernetes Local" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Kubernetes está rodando
Write-Host "1. Verificando Kubernetes..." -ForegroundColor Yellow
kubectl cluster-info 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Kubernetes não está rodando!" -ForegroundColor Red
    Write-Host "Abra Docker Desktop > Settings > Kubernetes > Enable Kubernetes" -ForegroundColor Red
    exit 1
}
Write-Host "OK: Kubernetes está rodando!" -ForegroundColor Green
Write-Host ""

# Build Backend
Write-Host "2. Buildando imagem do Backend..." -ForegroundColor Yellow
cd Backend
docker build -t fomezap-backend:latest .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO ao buildar backend!" -ForegroundColor Red
    exit 1
}
Write-Host "OK: Backend buildado!" -ForegroundColor Green
Write-Host ""

# Build Frontend
Write-Host "3. Buildando imagem do Frontend..." -ForegroundColor Yellow
cd ..\Frontend
docker build -t fomezap-frontend:latest .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO ao buildar frontend!" -ForegroundColor Red
    exit 1
}
Write-Host "OK: Frontend buildado!" -ForegroundColor Green
Write-Host ""

# Deploy MongoDB
Write-Host "4. Deploy do MongoDB no Kubernetes..." -ForegroundColor Yellow
cd ..\k8s
kubectl apply -f mongodb-deployment.yaml
Write-Host "OK: MongoDB deployado!" -ForegroundColor Green
Write-Host ""

# Aguardar MongoDB ficar pronto
Write-Host "5. Aguardando MongoDB ficar pronto..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Deploy Backend
Write-Host "6. Deploy do Backend no Kubernetes..." -ForegroundColor Yellow
kubectl apply -f backend-deployment.yaml
Write-Host "OK: Backend deployado!" -ForegroundColor Green
Write-Host ""

# Deploy Frontend
Write-Host "7. Deploy do Frontend no Kubernetes..." -ForegroundColor Yellow
kubectl apply -f frontend-deployment.yaml
Write-Host "OK: Frontend deployado!" -ForegroundColor Green
Write-Host ""

# Aguardar pods ficarem prontos
Write-Host "8. Aguardando pods ficarem prontos..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Mostrar status
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  STATUS DO CLUSTER" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "PODS:" -ForegroundColor Yellow
kubectl get pods
Write-Host ""

Write-Host "SERVICES:" -ForegroundColor Yellow
kubectl get services
Write-Host ""

Write-Host "DEPLOYMENTS:" -ForegroundColor Yellow
kubectl get deployments
Write-Host ""

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  DEPLOY CONCLUÍDO!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Acesse a aplicação em: http://localhost:30080" -ForegroundColor Green
Write-Host ""
Write-Host "Comandos úteis:" -ForegroundColor Yellow
Write-Host "  kubectl get pods              - Ver pods" -ForegroundColor White
Write-Host "  kubectl logs <pod-name>       - Ver logs" -ForegroundColor White
Write-Host "  kubectl describe pod <name>   - Detalhes do pod" -ForegroundColor White
Write-Host "  kubectl delete -f k8s/        - Deletar tudo" -ForegroundColor White
Write-Host ""
