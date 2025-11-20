import nodemailer from 'nodemailer';

/**
 * Envia email de recuperação de senha via Gmail SMTP
 * 
 * REQUISITOS:
 * 1. Criar conta Gmail dedicada (ex: noreply.fomezap@gmail.com)
 * 2. Ativar verificação em 2 etapas no Gmail
 * 3. Gerar App Password: https://myaccount.google.com/apppasswords
 * 4. Adicionar no .env: GMAIL_APP_PASSWORD=abcdefghijklmnop
 */

export async function sendRecoveryEmail({ to, token, nome }) {
  try {
    console.log('📧 Iniciando envio de email de recuperação...');
    console.log('   Destinatário:', to);
    console.log('   Provedor: Gmail SMTP');
    console.log('   Remetente:', process.env.GMAIL_USER || 'tffjauds@gmail.com');
    
    // ✅ CONFIGURAÇÃO GMAIL - Simples e Confiável
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Preset do nodemailer para Gmail
      auth: {
        user: process.env.GMAIL_USER || 'tffjauds@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD // App Password de 16 dígitos
      }
    });

    // Verificar conexão antes de enviar
    console.log('🔌 Testando conexão Gmail SMTP...');
    await transporter.verify();
    console.log('✅ Conexão Gmail verificada com sucesso!');

    // URL de recuperação (localhost em dev, domínio em prod)
    const recoveryUrl = process.env.NODE_ENV === 'production' 
      ? `https://fomezap.com/resetar-senha/${token}`
      : `http://localhost:5173/resetar-senha/${token}`;

    console.log('🔗 URL de recuperação:', recoveryUrl);

    // Template HTML profissional do email
    const mailOptions = {
      from: `"FomeZap" <${process.env.GMAIL_USER || 'tffjauds@gmail.com'}>`, // Nome exibido + email
      to, // Apenas o destinatário (sem cópia)
      subject: '🔐 Recuperação de Senha - FomeZap',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  
                  <!-- Header com gradiente -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #ff6600 0%, #ff3300 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">
                        🍔 FomeZap
                      </h1>
                      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                        Sistema de Cardápio Digital
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Conteúdo -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">
                        Olá${nome ? `, ${nome}` : ''}! 👋
                      </h2>
                      
                      <p style="color: #666666; line-height: 1.8; margin: 0 0 20px 0; font-size: 16px;">
                        Recebemos uma solicitação para <strong>redefinir sua senha</strong> no FomeZap.
                      </p>
                      
                      <p style="color: #666666; line-height: 1.8; margin: 0 0 30px 0; font-size: 16px;">
                        Para criar uma nova senha, clique no botão abaixo:
                      </p>
                      
                      <!-- Botão de ação -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${recoveryUrl}" 
                               style="background: linear-gradient(135deg, #ff6600 0%, #ff3300 100%); 
                                      color: #ffffff; 
                                      padding: 16px 40px; 
                                      text-decoration: none; 
                                      border-radius: 8px; 
                                      font-weight: bold; 
                                      font-size: 18px;
                                      display: inline-block;
                                      box-shadow: 0 4px 6px rgba(255, 102, 0, 0.3);">
                              🔓 Redefinir Minha Senha
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Link alternativo -->
                      <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
                        Se o botão não funcionar, copie e cole este link no navegador:<br>
                        <a href="${recoveryUrl}" style="color: #ff6600; word-break: break-all;">${recoveryUrl}</a>
                      </p>
                      
                      <!-- Aviso de segurança -->
                      <div style="background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 30px 0; border-radius: 4px;">
                        <p style="color: #e65100; margin: 0; font-size: 14px; line-height: 1.6;">
                          <strong>⚠️ Não solicitou esta alteração?</strong><br>
                          Você pode ignorar este email com segurança. Sua senha permanecerá inalterada.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="color: #999999; font-size: 12px; margin: 0 0 10px 0; line-height: 1.6;">
                        ⏱️ Este link expira em <strong>1 hora</strong> por segurança.
                      </p>
                      <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.6;">
                        📧 Email automático - Por favor, não responda esta mensagem.
                      </p>
                      <p style="color: #cccccc; font-size: 11px; margin: 20px 0 0 0;">
                        © ${new Date().getFullYear()} FomeZap - Todos os direitos reservados
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      // Versão texto puro (fallback)
      text: `
Olá${nome ? `, ${nome}` : ''}!

Recebemos uma solicitação para redefinir sua senha no FomeZap.

Para criar uma nova senha, acesse este link:
${recoveryUrl}

Se você não solicitou esta alteração, pode ignorar este email.

Este link expira em 1 hora por segurança.

---
FomeZap - Sistema de Cardápio Digital
      `
    };

    console.log('📨 Enviando email via Gmail...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email de recuperação enviado com sucesso!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    console.log('   Accepted:', info.accepted);
    console.log('   Rejected:', info.rejected);
    
    return info;
    
  } catch (error) {
    console.error('❌ ERRO ao enviar email de recuperação:');
    console.error('   Tipo:', error.name);
    console.error('   Mensagem:', error.message);
    console.error('   Code:', error.code);
    
    if (error.code === 'EAUTH') {
      console.error('\n💡 SOLUÇÃO PARA ERRO DE AUTENTICAÇÃO:');
      console.error('   1. Ative verificação em 2 etapas: https://myaccount.google.com/security');
      console.error('   2. Gere App Password: https://myaccount.google.com/apppasswords');
      console.error('   3. Adicione no .env: GMAIL_APP_PASSWORD=abcdefghijklmnop');
      console.error('   4. Reinicie o servidor backend\n');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.error('\n💡 SOLUÇÃO PARA ERRO DE CONEXÃO:');
      console.error('   1. Verifique sua conexão com internet');
      console.error('   2. Firewall pode estar bloqueando Gmail SMTP');
      console.error('   3. Tente desabilitar VPN/proxy temporariamente\n');
    }
    
    throw error; // Repassa erro para AuthController tratar
  }
}
