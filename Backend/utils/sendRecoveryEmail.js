import nodemailer from 'nodemailer';

export async function sendRecoveryEmail({ to, token, nome }) {
  try {
    console.log('📧 Iniciando envio de email de recuperação...');
    console.log('   Para:', to);
    console.log('   SMTP User:', 'no-reply@fomezap.com');
    console.log('   SMTP Pass definido:', !!process.env.TITAN_SMTP_PASS);
    
    // Configuração SMTP Titan
    const transporter = nodemailer.createTransport({
      host: 'smtp.titan.email',
      port: 465,
      secure: true, // SSL/TLS
      auth: {
        user: 'no-reply@fomezap.com',
        pass: process.env.TITAN_SMTP_PASS
      },
      logger: true, // Log SMTP para debug
      debug: true // Debug detalhado
    });

    // Verificar conexão SMTP
    console.log('🔌 Testando conexão SMTP...');
    await transporter.verify();
    console.log('✅ Conexão SMTP verificada com sucesso!');

    const recoveryUrl = process.env.NODE_ENV === 'production' 
      ? `https://fomezap.com/resetar-senha/${token}`
      : `http://localhost:5173/resetar-senha/${token}`;

    console.log('🔗 URL de recuperação:', recoveryUrl);

    const mailOptions = {
      from: 'FomeZap <no-reply@fomezap.com>',
      to,
      subject: 'Recuperação de Senha - FomeZap',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Olá${nome ? `, ${nome}` : ''}!</h2>
          <p>Recebemos uma solicitação para redefinir sua senha no FomeZap.</p>
          <p>Clique no botão abaixo para criar uma nova senha:</p>
          <p style="margin: 32px 0;">
            <a href="${recoveryUrl}" style="background: #ff6600; color: #fff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Redefinir Senha</a>
          </p>
          <p>Se você não solicitou, ignore este email.</p>
          <hr />
          <p style="font-size: 12px; color: #888;">Este link expira em 1 hora por segurança.</p>
        </div>
      `
    };

    console.log('📨 Enviando email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado com sucesso!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    
    return info;
  } catch (error) {
    console.error('❌ ERRO ao enviar email de recuperação:');
    console.error('   Tipo:', error.name);
    console.error('   Mensagem:', error.message);
    console.error('   Code:', error.code);
    console.error('   Command:', error.command);
    console.error('   Stack:', error.stack);
    throw error;
  }
}
