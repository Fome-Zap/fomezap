# Script para capturar prints e informações do Kubernetes
# Autor: Thiago Figueredo
# Data: 24/11/2025

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  FomeZap - Relatório Kubernetes" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Criar pasta para prints
$outputDir = "k8s-prints"
if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

Write-Host "Gerando relatório..." -ForegroundColor Yellow
Write-Host ""

# Informações do Cluster
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "CLUSTER INFO" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
kubectl cluster-info
Write-Host ""

# Todos os Pods
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "TODOS OS PODS (Total de Pods usados)" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
kubectl get pods -o wide
$podCount = (kubectl get pods --no-headers | Measure-Object).Count
Write-Host ""
Write-Host "TOTAL DE PODS: $podCount" -ForegroundColor Green
Write-Host ""

# Deployments
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENTS" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
kubectl get deployments
Write-Host ""

# Services
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "SERVICES" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
kubectl get services
Write-Host ""

# ReplicaSets
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "REPLICASETS" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
kubectl get replicasets
Write-Host ""

# Nodes
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "NODES" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
kubectl get nodes
Write-Host ""

# Detalhes dos Pods do MongoDB
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "DETALHES - MONGODB PODS" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
kubectl describe pods -l app=mongodb
Write-Host ""

# Detalhes dos Pods do Backend
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "DETALHES - BACKEND PODS" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
kubectl describe pods -l app=fomezap-backend
Write-Host ""

# Detalhes dos Pods do Frontend
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "DETALHES - FRONTEND PODS" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
kubectl describe pods -l app=fomezap-frontend
Write-Host ""

# Logs MongoDB
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "LOGS - MONGODB (últimas 30 linhas)" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
$mongodbPod = kubectl get pods -l app=mongodb -o jsonpath='{.items[0].metadata.name}'
if ($mongodbPod) {
    kubectl logs $mongodbPod --tail=30
}
Write-Host ""

# Logs (últimas 50 linhas)
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "LOGS - BACKEND (últimas 50 linhas)" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
$backendPod = kubectl get pods -l app=fomezap-backend -o jsonpath='{.items[0].metadata.name}'
if ($backendPod) {
    kubectl logs $backendPod --tail=50
}
Write-Host ""

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "LOGS - FRONTEND (últimas 50 linhas)" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
$frontendPod = kubectl get pods -l app=fomezap-frontend -o jsonpath='{.items[0].metadata.name}'
if ($frontendPod) {
    kubectl logs $frontendPod --tail=50
}
Write-Host ""

# Resumo Final
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "RESUMO FINAL" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Total de Pods: $podCount" -ForegroundColor Green
Write-Host "URL da Aplicação: http://localhost:30080" -ForegroundColor Green
Write-Host ""
Write-Host "INSTRUÇÕES PARA O TCC:" -ForegroundColor Yellow
Write-Host "1. Tire print desta tela completa" -ForegroundColor White
Write-Host "2. Tire print do navegador acessando http://localhost:30080" -ForegroundColor White
Write-Host "3. Grave vídeo da aplicação funcionando" -ForegroundColor White
Write-Host "4. Suba os arquivos k8s/ e Dockerfiles para o GitHub" -ForegroundColor White
Write-Host ""
Write-Host "Relatório salvo em: $outputDir" -ForegroundColor Green
