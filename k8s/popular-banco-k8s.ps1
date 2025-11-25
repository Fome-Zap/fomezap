# Script para popular banco de dados no Kubernetes
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Popular Banco MongoDB (Kubernetes)" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Pegar nome do pod do backend
Write-Host "1. Encontrando pod do backend..." -ForegroundColor Yellow
$backendPod = kubectl get pods -l app=fomezap-backend -o jsonpath='{.items[0].metadata.name}' 2>$null

if (-not $backendPod) {
    Write-Host "ERRO: Nenhum pod do backend encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "Pod encontrado: $backendPod" -ForegroundColor Green
Write-Host ""

# Copiar script para o pod
Write-Host "2. Copiando script para o pod..." -ForegroundColor Yellow
kubectl cp k8s/seed-database.js ${backendPod}:/app/seed-database.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO ao copiar script!" -ForegroundColor Red
    exit 1
}

Write-Host "OK: Script copiado!" -ForegroundColor Green
Write-Host ""

# Executar script dentro do pod
Write-Host "3. Executando script no pod..." -ForegroundColor Yellow
Write-Host ""
kubectl exec $backendPod -- node /app/seed-database.js

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERRO ao executar script!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  CONCLUÍDO!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Credenciais de Login:" -ForegroundColor Yellow
Write-Host "  Email: tffjauds@gmail.com" -ForegroundColor White
Write-Host "  Senha: admin123" -ForegroundColor White
Write-Host "  URL: http://localhost:30080" -ForegroundColor White
Write-Host ""
