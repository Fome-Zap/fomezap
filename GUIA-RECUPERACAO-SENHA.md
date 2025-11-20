# 📧 Guia Completo: Recuperação de Senha em Produção

## 📋 Sumário
1. [Como Funciona](#como-funciona)
2. [Configuração Gmail](#configuracao-gmail)
3. [Variáveis de Ambiente](#variaveis-ambiente)
4. [Teste Local](#teste-local)
5. [Deploy Produção](#deploy-producao)
6. [Troubleshooting](#troubleshooting)

---

## 🔄 Como Funciona {#como-funciona}

### Fluxo Completo

```
1. Usuário clica "Esqueci minha senha"
   └─> Página: /recuperar-senha
   
2. Digita email e clica "Enviar"
   └─> POST /api/auth/recuperar-senha
   
3. Backend gera token JWT (expira em 1h)
   └─> Salva no campo `resetPasswordToken` do usuário
   
4. Backend envia email via Gmail SMTP
   ├─> Remetente: tffjauds@gmail.com (seu Gmail)
   ├─> Destinatário: email do usuário
   └─> Link: https://sua-app.vercel.app/resetar-senha/TOKEN
   
5. Usuário clica no link do email
   └─> Página: /resetar-senha/:token
   
6. Usuário digita nova senha
   └─> POST /api/auth/resetar-senha/:token
   
7. Backend valida token e atualiza senha
   └─> Usuário pode fazer login com nova senha
```

---

## 🔐 Configuração Gmail (ESSENCIAL) {#configuracao-gmail}

### ⚠️ IMPORTANTE: Não usar senha normal do Gmail!

O Gmail bloqueia login de aplicações externas por segurança. Você precisa usar **App Password**.

### Passo 1: Ativar Verificação em 2 Etapas

```
1. Acesse: https://myaccount.google.com/security
2. Role até "Verificação em duas etapas"
3. Clique em "Ativar"
4. Siga os passos (SMS ou Google Authenticator)
5. Confirme que está ativado ✅
```

### Passo 2: Gerar App Password

```
1. Acesse: https://myaccount.google.com/apppasswords
   (ou Google Account → Security → App passwords)

2. Faça login novamente se solicitado

3. Configure:
   ┌──────────────────────────────┐
   │ Select app: Other (Custom)   │
   │ Name: FomeZap Backend        │
   └──────────────────────────────┘

4. Clique em "Generate"

5. Copie o App Password (16 caracteres):
   Exemplo: abcd efgh ijkl mnop
   (sem espaços no .env)
```

### ⚠️ SEGURANÇA

```
✅ App Password é ESPECÍFICO para FomeZap
✅ Pode ser revogado sem afetar sua conta Gmail
✅ Nunca commitou no Git (está no .gitignore)
❌ NUNCA compartilhe publicamente
❌ NUNCA use senha normal do Gmail
```

---

## 🔧 Variáveis de Ambiente {#variaveis-ambiente}

### Local: Backend/.env

```env
# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/FomeZap

# JWT
JWT_SECRET=sua-chave-secreta-jwt

# Gmail SMTP (para recuperação de senha)
GMAIL_USER=tffjauds@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop

# Ambiente
NODE_ENV=development
PORT=5000
```

### Produção: Render (Environment Variables)

```
Render Dashboard → Your Web Service → Environment
┌─────────────────────────────────────────────────┐
│ MONGODB_URI          mongodb+srv://...          │
│ JWT_SECRET           <chave-secreta>            │
│ GMAIL_USER           tffjauds@gmail.com         │
│ GMAIL_APP_PASSWORD   abcdefghijklmnop          │ ← App Password!
│ NODE_ENV             production                 │
│ PORT                 5000                       │
└─────────────────────────────────────────────────┘

IMPORTANTE: Após adicionar, clicar em "Save Changes"
Render fará redeploy automático
```

### Produção: Vercel (NÃO PRECISA)

```
❌ Vercel = Frontend (não envia emails)
✅ Render = Backend (envia emails)

Frontend apenas faz requisições ao backend:
POST https://fomezap-api.onrender.com/api/auth/recuperar-senha
```

---

## 🧪 Teste Local {#teste-local}

### 1️⃣ Verificar Configuração

```bash
cd Backend
node testarGmailSMTP.js
```

**Saída esperada:**
```
✅ Variáveis de ambiente encontradas
   GMAIL_USER: tffjauds@gmail.com
   GMAIL_APP_PASSWORD: ****
   
✅ Conexão Gmail verificada com sucesso!
✅ Email de teste enviado!
   Message ID: <...@gmail.com>
```

### 2️⃣ Criar Usuário de Teste

```javascript
// Via SuperAdmin ou script
{
  email: "teste@exemplo.com",
  senha: "senha123",
  nome: "Usuário Teste"
}
```

### 3️⃣ Testar Fluxo Completo

```bash
# 1. Iniciar backend
cd Backend
npm start

# 2. Iniciar frontend (outro terminal)
cd Frontend
npm run dev

# 3. Acessar: http://localhost:5173/recuperar-senha
# 4. Digitar: teste@exemplo.com
# 5. Verificar console do backend:
#    📧 Iniciando envio de email...
#    ✅ Email enviado com sucesso!
# 6. Abrir email e clicar no link
# 7. Redefinir senha
```

---

## 🚀 Deploy Produção {#deploy-producao}

### 1️⃣ Render: Adicionar Variáveis

```bash
1. Login: https://dashboard.render.com
2. Selecione seu Web Service: fomezap-api
3. Environment → Add Environment Variable:

   GMAIL_USER = tffjauds@gmail.com
   GMAIL_APP_PASSWORD = abcdefghijklmnop

4. Save Changes
5. Aguardar redeploy (~2 minutos)
```

### 2️⃣ Verificar Deploy

```bash
# Health Check
curl https://fomezap-api.onrender.com/health

# Resposta esperada:
{
  "status": "ok",
  "service": "FomeZap API",
  "timestamp": "2025-11-20T..."
}
```

### 3️⃣ Testar Recuperação em Produção

```bash
# Via Postman ou curl
curl -X POST https://fomezap-api.onrender.com/api/auth/recuperar-senha \
  -H "Content-Type: application/json" \
  -d '{"email": "teste@exemplo.com"}'

# Resposta esperada:
{
  "message": "Email de recuperação enviado com sucesso!"
}
```

### 4️⃣ Verificar Logs no Render

```
Render → Logs → Filter: "Email"

Procurar por:
✅ 📧 Iniciando envio de email...
✅ ✅ Email enviado com sucesso!
❌ ❌ ERRO ao enviar email... (se houver problema)
```

---

## 🛠️ Código Backend (Já Implementado) {#codigo-backend}

### AuthController.js

```javascript
// POST /api/auth/recuperar-senha
async recuperarSenha(req, res) {
  const { email } = req.body;
  
  // Buscar usuário/admin
  const usuario = await Admin.findOne({ email }) || 
                  await SuperAdmin.findOne({ email });
  
  if (!usuario) {
    return res.status(404).json({ 
      message: "Email não encontrado" 
    });
  }
  
  // Gerar token JWT (expira em 1h)
  const token = jwt.sign(
    { id: usuario._id, email: usuario.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  // Salvar token no banco
  usuario.resetPasswordToken = token;
  usuario.resetPasswordExpires = Date.now() + 3600000; // 1h
  await usuario.save();
  
  // Enviar email via Gmail
  await sendRecoveryEmail({
    to: email,
    token,
    nome: usuario.nome
  });
  
  res.json({ 
    message: "Email de recuperação enviado!" 
  });
}
```

### sendRecoveryEmailGmail.js

```javascript
import nodemailer from 'nodemailer';

export async function sendRecoveryEmail({ to, token, nome }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
  
  const recoveryUrl = process.env.NODE_ENV === 'production'
    ? `https://sua-app.vercel.app/resetar-senha/${token}`
    : `http://localhost:5173/resetar-senha/${token}`;
  
  await transporter.sendMail({
    from: `"FomeZap" <${process.env.GMAIL_USER}>`,
    to,
    subject: '🔐 Recuperação de Senha - FomeZap',
    html: `
      <h1>Olá${nome ? `, ${nome}` : ''}!</h1>
      <p>Clique no botão abaixo para redefinir sua senha:</p>
      <a href="${recoveryUrl}">Redefinir Senha</a>
      <p>Link expira em 1 hora.</p>
    `
  });
}
```

---

## ⚠️ Troubleshooting {#troubleshooting}

### ❌ Erro: "Invalid login: 535 Authentication failed"

**Causa:** App Password incorreto ou não configurado

**Solução:**
```bash
1. Verificar .env tem GMAIL_APP_PASSWORD (sem espaços)
2. Regenerar App Password no Google
3. Verificar verificação em 2 etapas está ativa
4. Reiniciar backend: npm start
```

### ❌ Erro: "ECONNECTION" ou "ETIMEDOUT"

**Causa:** Firewall bloqueando porta 587 (SMTP)

**Solução:**
```bash
# Windows Firewall
1. Painel de Controle → Firewall
2. Permitir aplicativo → Node.js
3. Adicionar porta 587 (outbound)

# Render (produção) - já permite por padrão
```

### ❌ Erro: "Email não recebido"

**Causa:** Email pode estar em Spam

**Solução:**
```bash
1. Verificar pasta Spam/Lixo Eletrônico
2. Adicionar tffjauds@gmail.com aos contatos
3. Verificar logs do backend:
   console.log('✅ Email enviado:', info.messageId)
```

### ❌ Erro: "Token expirado"

**Causa:** Passou mais de 1 hora desde o pedido

**Solução:**
```bash
1. Solicitar nova recuperação de senha
2. Usar link dentro de 1 hora
3. Verificar relógio do sistema está sincronizado
```

### ❌ Erro: "Variável GMAIL_APP_PASSWORD não encontrada"

**Causa:** .env não carregado ou variável não configurada

**Solução Local:**
```bash
# 1. Verificar arquivo existe
ls Backend/.env

# 2. Verificar conteúdo
cat Backend/.env | grep GMAIL

# 3. Adicionar se não existir
echo "GMAIL_APP_PASSWORD=abcdefghijklmnop" >> Backend/.env

# 4. Reiniciar backend
```

**Solução Produção (Render):**
```bash
1. Render Dashboard → Environment
2. Add Environment Variable:
   Key: GMAIL_APP_PASSWORD
   Value: abcdefghijklmnop
3. Save Changes (faz redeploy)
```

---

## 📊 Checklist de Deploy

### Antes do Deploy

- [ ] App Password gerado no Google
- [ ] `.env` configurado localmente
- [ ] Testado localmente (`node testarGmailSMTP.js`)
- [ ] Email de teste recebido
- [ ] Fluxo completo testado (recuperar + resetar)

### Deploy no Render

- [ ] Variáveis adicionadas no Environment
- [ ] Redeploy concluído sem erros
- [ ] Health check respondendo
- [ ] Logs sem erros de autenticação SMTP
- [ ] Teste de recuperação em produção funcionou
- [ ] Email recebido com link correto

### Configuração Frontend (Vercel)

- [ ] URL de produção correta no `sendRecoveryEmail.js`:
  ```javascript
  const recoveryUrl = process.env.NODE_ENV === 'production'
    ? 'https://sua-app.vercel.app/resetar-senha/${token}'
    : `http://localhost:5173/resetar-senha/${token}`;
  ```
- [ ] Página `/resetar-senha/:token` funciona na Vercel
- [ ] Formulário envia POST correto ao backend

---

## 🎯 Resumo Executivo

### O que você precisa fazer:

1. **Google Account:**
   - Ativar verificação em 2 etapas
   - Gerar App Password
   - Copiar senha de 16 dígitos

2. **Local (.env):**
   ```env
   GMAIL_USER=tffjauds@gmail.com
   GMAIL_APP_PASSWORD=abcdefghijklmnop
   ```

3. **Produção (Render Environment):**
   ```
   GMAIL_USER=tffjauds@gmail.com
   GMAIL_APP_PASSWORD=abcdefghijklmnop
   ```

4. **Testar:**
   - Local: `node Backend/testarGmailSMTP.js`
   - Produção: Fazer recuperação de senha real

### O que JÁ está pronto no código:

✅ `sendRecoveryEmailGmail.js` - Envio via Gmail SMTP
✅ `AuthController.recuperarSenha()` - Gerar token e enviar email
✅ `AuthController.resetarSenha()` - Validar token e atualizar senha
✅ Rotas `/api/auth/recuperar-senha` e `/api/auth/resetar-senha`
✅ Páginas `/recuperar-senha` e `/resetar-senha/:token`
✅ Template HTML profissional do email

### Você só precisa configurar as variáveis! 🚀
