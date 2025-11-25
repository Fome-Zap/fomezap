# ✅ CHECKLIST DE ENTREGA - FomeZap Kubernetes

## 📋 ANTES DE EXECUTAR

- [ ] Docker Desktop aberto e rodando
- [ ] Kubernetes habilitado no Docker Desktop (Settings > Kubernetes)
- [ ] PowerShell aberto como Administrador
- [ ] Navegador aberto (Chrome/Edge)
- [ ] Software de gravação pronto (OBS/Game Bar)
- [ ] MongoDB Atlas connection string pronta

---

## 🚀 EXECUÇÃO

### Passo 1: Configurar MongoDB (OBRIGATÓRIO)
- [ ] Abrir `k8s\backend-deployment.yaml`
- [ ] Substituir linha 22: `mongodb+srv://usuario:senha@...` pela sua connection string
- [ ] Salvar arquivo (Ctrl+S)

### Passo 2: Executar Deploy
- [ ] Abrir PowerShell como Admin na pasta do projeto
- [ ] Executar: `.\deploy-k8s.ps1`
- [ ] Aguardar 15-20 minutos (build das imagens)
- [ ] Verificar mensagem "DEPLOY CONCLUÍDO!"

### Passo 3: Gerar Relatório
- [ ] Executar: `.\k8s-relatorio.ps1`
- [ ] Ler toda a saída no terminal

---

## 📸 PRINTS OBRIGATÓRIOS

### Do PowerShell:
- [ ] Print 1: Comando `kubectl get pods` mostrando os 4 pods
- [ ] Print 2: Linha "TOTAL DE PODS: 4"
- [ ] Print 3: Comando `kubectl get deployments` 
- [ ] Print 4: Comando `kubectl get services`
- [ ] Print 5: Comando `kubectl get nodes`
- [ ] Print 6: Relatório completo (tela cheia)

### Do Navegador:
- [ ] Print 7: http://localhost:30080 - Tela inicial
- [ ] Print 8: Cardápio público funcionando
- [ ] Print 9: Painel admin (se conseguir fazer login)
- [ ] Print 10: Console do navegador sem erros (F12)

---

## 🎥 GRAVAÇÃO DE VÍDEO (2-3 min)

### Roteiro Sugerido:

**Parte 1: Terminal (30-45 seg)**
- [ ] Mostrar comando: `kubectl get pods`
- [ ] Mostrar comando: `kubectl get services`
- [ ] Mostrar comando: `kubectl get deployments`
- [ ] Falar: "Temos 4 pods em execução, 2 do frontend e 2 do backend"

**Parte 2: Navegador (30-45 seg)**
- [ ] Abrir http://localhost:30080
- [ ] Navegar pelo cardápio
- [ ] Mostrar produtos
- [ ] Falar: "A aplicação está rodando no Kubernetes"

**Parte 3: Logs (30 seg)**
- [ ] Voltar ao terminal
- [ ] Executar: `kubectl logs -l app=fomezap-backend --tail=10`
- [ ] Mostrar logs do backend
- [ ] Falar: "Logs dos pods estão sendo coletados pelo Kubernetes"

**Parte 4: Finalização (10-15 seg)**
- [ ] Mostrar novamente `kubectl get pods`
- [ ] Falar: "Deploy concluído com sucesso"

---

## 📤 GIT PUSH

### Verificar arquivos a serem commitados:
- [ ] `k8s/backend-deployment.yaml`
- [ ] `k8s/frontend-deployment.yaml`
- [ ] `k8s/README.md`
- [ ] `Backend/Dockerfile`
- [ ] `Frontend/Dockerfile`
- [ ] `Frontend/nginx.conf`
- [ ] `deploy-k8s.ps1`
- [ ] `k8s-relatorio.ps1`
- [ ] `GUIA-KUBERNETES-RAPIDO.md`
- [ ] `DOCUMENTACAO-KUBERNETES.md`

### Comandos:
```powershell
git add k8s/ Backend/Dockerfile Frontend/Dockerfile Frontend/nginx.conf deploy-k8s.ps1 k8s-relatorio.ps1 *.md
git commit -m "feat: adicionar deploy Kubernetes para trabalho acadêmico"
git push origin main
```

- [ ] Push realizado com sucesso
- [ ] Verificar no GitHub: https://github.com/Fome-Zap/fomezap

---

## 📝 DOCUMENTAÇÃO FINAL

### a) Prints ✅
- [ ] 10 prints salvos (PNG/JPG)
- [ ] Prints nomeados (ex: `01-kubectl-pods.png`)
- [ ] Prints legíveis e com boa resolução

### b) Quantidade de Pods ✅
- [ ] **Resposta**: 4 pods
  - 2 pods do frontend (frontend-deployment)
  - 2 pods do backend (backend-deployment)

### c) Vídeo ✅
- [ ] Vídeo gravado (2-3 minutos)
- [ ] Formato: MP4 ou AVI
- [ ] Mostra terminal + navegador
- [ ] Áudio claro (opcional)

### d) Link do Repositório ✅
- [ ] Link: `https://github.com/Fome-Zap/fomezap`
- [ ] Branch: `main`
- [ ] Pasta importante: `/k8s/`

### e) Lista do Grupo ✅
```
1. Thiago Figueredo - RA: [PREENCHER]
2. [Nome Completo] - RA: [PREENCHER]
3. [Nome Completo] - RA: [PREENCHER]
```

---

## 🆘 TROUBLESHOOTING RÁPIDO

### Problema: Kubernetes não está rodando
**Solução**: Docker Desktop > Settings > Kubernetes > Enable Kubernetes

### Problema: Build demorou muito
**Solução**: É normal! Backend ~7min, Frontend ~15min

### Problema: Pods em "CrashLoopBackOff"
**Solução**: 
```powershell
kubectl logs <nome-do-pod>
```
Provavelmente erro no MongoDB URI

### Problema: Porta 30080 não abre
**Solução**: Aguardar 1-2 minutos. Verificar pods:
```powershell
kubectl get pods
# Todos devem estar "Running" com "1/1" ready
```

### Problema: Imagem não encontrada
**Solução**: Verificar `imagePullPolicy: Never` nos YAMLs

---

## ⏱️ TEMPO ESTIMADO POR ETAPA

| Etapa                  | Tempo      |
|------------------------|------------|
| Configurar MongoDB     | 5 minutos  |
| Executar deploy-k8s.ps1| 20 minutos |
| Gerar relatório        | 5 minutos  |
| Tirar prints           | 10 minutos |
| Gravar vídeo           | 15 minutos |
| Git push               | 5 minutos  |
| Organizar arquivos     | 10 minutos |
| **TOTAL**              | **70 min** |

**Margem de segurança**: 50 minutos

---

## 📊 DADOS TÉCNICOS PARA RELATAR

**Infraestrutura:**
- Plataforma: Docker Desktop Kubernetes (kubeadm)
- Sistema Operacional: Windows 11
- Versão do Kubernetes: 1.28+ (verificar com `kubectl version`)
- Versão do Docker: 24.0+ (verificar com `docker --version`)

**Recursos Utilizados:**
- Deployments: 2
- Services: 2 (1 NodePort, 1 ClusterIP)
- Pods: 4 (2 réplicas de cada deployment)
- Imagens Docker: 2 (backend e frontend)
- CPU por Pod: ~100m
- Memória por Pod: ~256Mi

**Portas:**
- Frontend: 30080 (NodePort - acesso externo)
- Backend: 5000 (ClusterIP - acesso interno)

**Tempo de Startup:**
- Pods ficam prontos em: 30-60 segundos
- Aplicação acessível em: 1-2 minutos

---

## ✅ CONFIRMAÇÃO FINAL

Antes de entregar, confirme:

- [ ] Tenho 10+ prints salvos
- [ ] Tenho vídeo de 2-3 minutos
- [ ] Git push feito com sucesso
- [ ] Link do GitHub anotado
- [ ] Lista do grupo preenchida
- [ ] MongoDB URI configurado
- [ ] Aplicação funcionando em http://localhost:30080
- [ ] Todos os 4 pods em "Running"

---

## 🎯 ENTREGA

**Plataforma**: [Informar onde entregar]

**Formato**: ZIP ou link do GitHub

**Conteúdo do ZIP** (se aplicável):
```
trabalho-kubernetes-fomezap/
├── prints/
│   ├── 01-kubectl-pods.png
│   ├── 02-total-pods.png
│   ├── 03-deployments.png
│   └── ... (10 prints)
├── video-demonstracao.mp4
├── lista-grupo.txt
└── link-repositorio.txt
```

**Link do Repositório**:
```
https://github.com/Fome-Zap/fomezap
Pasta importante: /k8s/
```

---

## 🎓 OBSERVAÇÕES ACADÊMICAS

Este trabalho demonstra:

✅ Conhecimento em orquestração de contêineres
✅ Uso de Kubernetes para deploy de aplicações
✅ Arquitetura de microsserviços
✅ Docker multi-stage builds
✅ Configuração de Services e Deployments
✅ Alta disponibilidade com réplicas
✅ Load balancing automático
✅ Monitoramento de pods e logs

---

**Data**: 24/11/2025
**Status**: ✅ PRONTO PARA EXECUÇÃO
**Tempo Estimado**: 70 minutos + 50 min margem = **2 horas**

---

**BOA SORTE! 🚀**

Se tudo der certo, você terá uma aplicação rodando em Kubernetes com alta disponibilidade!
