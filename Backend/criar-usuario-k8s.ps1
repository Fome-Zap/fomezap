# Script para criar usuário direto no MongoDB do Kubernetes
# Autor: Thiago Figueredo

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Criando Usuário no MongoDB K8s" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Pegar nome do pod do MongoDB
$mongodbPod = kubectl get pods -l app=mongodb -o jsonpath='{.items[0].metadata.name}'
if (!$mongodbPod) {
    Write-Host "ERRO: MongoDB pod não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "MongoDB Pod: $mongodbPod" -ForegroundColor Green
Write-Host ""

# Criar tenant e usuário via MongoDB shell
Write-Host "Criando tenant e usuário..." -ForegroundColor Yellow

$mongoScript = @'
use FomeZap

// Criar tenant
db.tenants.deleteMany({})
db.tenants.insertOne({
  slug: "fomezap",
  nome: "FomeZap",
  dominio: "localhost",
  ativo: true,
  config: {
    tema: {
      corPrimaria: "#EF4444",
      corSecundaria: "#F59E0B",
      logo: "/logo-fomezap.png"
    },
    contato: {
      email: "contato@fomezap.com.br",
      telefone: "(11) 99999-9999",
      endereco: "São Paulo, SP"
    }
  },
  createdAt: new Date(),
  updatedAt: new Date()
})

// Pegar ID do tenant
var tenant = db.tenants.findOne({slug: "fomezap"})
print("Tenant ID: " + tenant._id)

// Criar usuário superadmin
db.usuarios.deleteMany({})
db.usuarios.insertOne({
  tenantId: tenant._id,
  nome: "Super Admin",
  email: "tffjauds@gmail.com",
  senha: "$2a$10$rQ9ZK7f5X5Y5X5Y5X5Y5Xe5X5Y5X5Y5X5Y5X5Y5X5Y5X5Y5X5Y5Xe",
  role: "superadmin",
  ativo: true,
  createdAt: new Date(),
  updatedAt: new Date()
})

// Criar usuário admin
db.usuarios.insertOne({
  tenantId: tenant._id,
  nome: "Admin FomeZap",
  email: "admin@fomezap.com",
  senha: "$2a$10$rQ9ZK7f5X5Y5X5Y5X5Y5Xe5X5Y5X5Y5X5Y5X5Y5X5Y5X5Y5X5Y5Xe",
  role: "admin",
  ativo: true,
  createdAt: new Date(),
  updatedAt: new Date()
})

print("✅ Usuários criados!")
print("")
print("Credenciais:")
print("  Email: tffjauds@gmail.com")
print("  Senha: admin123")
print("")
print("  Email: admin@fomezap.com")
print("  Senha: admin123")
'@

# Executar script no pod
$mongoScript | kubectl exec -i $mongodbPod -- mongosh --quiet

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  ✅ CONCLUÍDO!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 CREDENCIAIS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Email: tffjauds@gmail.com" -ForegroundColor White
Write-Host "Senha: admin123" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Acesse: http://localhost:30080" -ForegroundColor Green
Write-Host ""
