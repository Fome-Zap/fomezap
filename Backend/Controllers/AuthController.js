import jwt from 'jsonwebtoken';
import User from '../Models/User.js';
import { sendRecoveryEmail } from '../utils/sendRecoveryEmailGmail.js';


// Segredo para assinar o JWT (em produção, use variável de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-super-secreto-aqui-2024';
const JWT_EXPIRES_IN = '7d'; // Token válido por 7 dias

class AuthController {
  
  // POST /api/auth/register - Criar novo usuário
  async register(req, res) {
    try {
      const { email, senha, nome, role, tenantId } = req.body;

      // Validações básicas
      if (!email || !senha || !nome) {
        return res.status(400).json({ 
          mensagem: 'Email, senha e nome são obrigatórios' 
        });
      }

      // Verificar se email já existe
      const usuarioExistente = await User.findOne({ email: email.toLowerCase() });
      if (usuarioExistente) {
        return res.status(400).json({ 
          mensagem: 'Este email já está cadastrado' 
        });
      }

      // Validar role
      const rolesValidas = ['super_admin', 'tenant_admin', 'employee'];
      const roleUsuario = role || 'tenant_admin';
      
      if (!rolesValidas.includes(roleUsuario)) {
        return res.status(400).json({ 
          mensagem: 'Role inválida. Use: super_admin, tenant_admin ou employee' 
        });
      }

      // Validar tenantId (obrigatório exceto para super_admin)
      if (roleUsuario !== 'super_admin' && !tenantId) {
        return res.status(400).json({ 
          mensagem: 'TenantId é obrigatório para tenant_admin e employee' 
        });
      }

      // Criar usuário (senha será hasheada automaticamente pelo middleware do model)
      const novoUsuario = new User({
        email: email.toLowerCase(),
        senha,
        nome,
        role: roleUsuario,
        tenantId: roleUsuario !== 'super_admin' ? tenantId : undefined
      });

      await novoUsuario.save();

      // Gerar token JWT
      const token = jwt.sign(
        { 
          userId: novoUsuario._id,
          email: novoUsuario.email,
          role: novoUsuario.role,
          tenantId: novoUsuario.tenantId
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.status(201).json({
        mensagem: 'Usuário criado com sucesso',
        token,
        usuario: {
          id: novoUsuario._id,
          email: novoUsuario.email,
          nome: novoUsuario.nome,
          role: novoUsuario.role,
          tenantId: novoUsuario.tenantId
        }
      });

    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      res.status(500).json({ 
        mensagem: 'Erro ao criar usuário',
        erro: error.message 
      });
    }
  }

  // POST /api/auth/login - Fazer login
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      // Validações básicas
      if (!email || !senha) {
        return res.status(400).json({ 
          mensagem: 'Email e senha são obrigatórios' 
        });
      }

      // Buscar usuário (incluindo senha para comparação)
      const usuario = await User.findOne({ 
        email: email.toLowerCase(),
        ativo: true 
      });

      if (!usuario) {
        return res.status(401).json({ 
          mensagem: 'Email ou senha incorretos' 
        });
      }

      // Verificar senha usando argon2
      const senhaCorreta = await usuario.compararSenha(senha);
      
      if (!senhaCorreta) {
        return res.status(401).json({ 
          mensagem: 'Email ou senha incorretos' 
        });
      }

      // Gerar token JWT
      const token = jwt.sign(
        { 
          userId: usuario._id,
          email: usuario.email,
          role: usuario.role,
          tenantId: usuario.tenantId
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.json({
        mensagem: 'Login realizado com sucesso',
        token,
        usuario: {
          id: usuario._id,
          email: usuario.email,
          nome: usuario.nome,
          role: usuario.role,
          tenantId: usuario.tenantId
        }
      });

    } catch (error) {
      console.error('Erro ao fazer login:', error);
      res.status(500).json({ 
        mensagem: 'Erro ao fazer login',
        erro: error.message 
      });
    }
  }

  // GET /api/auth/me - Buscar dados do usuário logado
  async me(req, res) {
    try {
      // req.userId vem do middleware verificarToken
      const usuario = await User.findById(req.userId).select('-senha');

      if (!usuario) {
        return res.status(404).json({ 
          mensagem: 'Usuário não encontrado' 
        });
      }

      res.json({
        usuario: {
          id: usuario._id,
          email: usuario.email,
          nome: usuario.nome,
          role: usuario.role,
          tenantId: usuario.tenantId,
          ativo: usuario.ativo
        }
      });

    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ 
        mensagem: 'Erro ao buscar dados do usuário',
        erro: error.message 
      });
    }
  }

  // POST /api/auth/alterar-senha - Alterar senha do usuário logado
  async alterarSenha(req, res) {
    try {
      const { senhaAtual, senhaNova } = req.body;

      if (!senhaAtual || !senhaNova) {
        return res.status(400).json({ 
          mensagem: 'Senha atual e nova senha são obrigatórias' 
        });
      }

      if (senhaNova.length < 6) {
        return res.status(400).json({ 
          mensagem: 'Nova senha deve ter no mínimo 6 caracteres' 
        });
      }

      // Buscar usuário
      const usuario = await User.findById(req.userId);

      if (!usuario) {
        return res.status(404).json({ 
          mensagem: 'Usuário não encontrado' 
        });
      }

      // Verificar senha atual
      const senhaCorreta = await usuario.compararSenha(senhaAtual);
      
      if (!senhaCorreta) {
        return res.status(401).json({ 
          mensagem: 'Senha atual incorreta' 
        });
      }

      // Atualizar senha (será hasheada automaticamente pelo middleware)
      usuario.senha = senhaNova;
      await usuario.save();

      res.json({
        mensagem: 'Senha alterada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({ 
        mensagem: 'Erro ao alterar senha',
        erro: error.message 
      });
    }
  }

  // POST /api/auth/alterar-email - Alterar email do usuário logado
  async alterarEmail(req, res) {
    try {
      const { novoEmail, senha } = req.body;

      if (!novoEmail || !senha) {
        return res.status(400).json({ 
          mensagem: 'Novo email e senha são obrigatórios' 
        });
      }

      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(novoEmail)) {
        return res.status(400).json({ 
          mensagem: 'Email inválido' 
        });
      }

      // Buscar usuário
      const usuario = await User.findById(req.userId);

      if (!usuario) {
        return res.status(404).json({ 
          mensagem: 'Usuário não encontrado' 
        });
      }

      // Verificar senha
      const senhaCorreta = await usuario.compararSenha(senha);
      
      if (!senhaCorreta) {
        return res.status(401).json({ 
          mensagem: 'Senha incorreta' 
        });
      }

      // Verificar se novo email já está em uso
      const emailExistente = await User.findOne({ 
        email: novoEmail.toLowerCase(),
        _id: { $ne: usuario._id } // Excluir o próprio usuário
      });

      if (emailExistente) {
        return res.status(400).json({ 
          mensagem: 'Este email já está em uso' 
        });
      }

      // Atualizar email
      usuario.email = novoEmail.toLowerCase();
      await usuario.save();

      res.json({
        mensagem: 'Email alterado com sucesso',
        novoEmail: usuario.email
      });

    } catch (error) {
      console.error('Erro ao alterar email:', error);
      res.status(500).json({ 
        mensagem: 'Erro ao alterar email',
        erro: error.message 
      });
    }
  }

  // POST /api/auth/recuperar-senha - Solicitar recuperação de senha (envia email com link)
  async recuperarSenha(req, res) {
    try {
      const { email } = req.body;
      console.log('🔐 Recuperação de senha solicitada para:', email);
      
      if (!email) {
        return res.status(400).json({ mensagem: 'Email é obrigatório' });
      }
      
      const usuario = await User.findOne({ email: email.toLowerCase(), ativo: true });
      console.log('👤 Usuário encontrado:', usuario ? `Sim (${usuario.nome})` : 'Não');
      
      // Sempre retorna sucesso para não revelar se email existe
      if (!usuario) {
        console.log('⚠️ Email não encontrado no banco de dados');
        return res.json({ mensagem: 'Se o email estiver cadastrado, você receberá instruções para recuperar sua senha.' });
      }
      
      // Gerar token único e expiração
      const crypto = await import('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      usuario.resetToken = token;
      usuario.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
      await usuario.save();
      console.log('✅ Token de recuperação salvo no banco:', token.substring(0, 10) + '...');
      
      // Enviar email via Gmail
      console.log('📧 Tentando enviar email de recuperação...');
      await sendRecoveryEmail({ to: usuario.email, token, nome: usuario.nome });
      console.log('✅ Email de recuperação enviado com sucesso!');
      
      res.json({ mensagem: 'Se o email estiver cadastrado, você receberá instruções para recuperar sua senha.' });
    } catch (error) {
      console.error('❌ Erro ao enviar email de recuperação:', error);
      console.error('   Stack:', error.stack);
      res.status(500).json({ mensagem: 'Erro ao processar recuperação de senha', erro: error.message });
    }
  }

  // POST /api/auth/resetar-senha/:token - Redefinir senha usando token
  async resetarSenha(req, res) {
    try {
      const { token } = req.params;
      const { senhaNova } = req.body;
      if (!senhaNova || senhaNova.length < 6) {
        return res.status(400).json({ mensagem: 'Nova senha deve ter no mínimo 6 caracteres' });
      }
      const usuario = await User.findOne({ resetToken: token, resetTokenExpires: { $gt: new Date() } });
      if (!usuario) {
        return res.status(400).json({ mensagem: 'Token inválido ou expirado' });
      }
      usuario.senha = senhaNova;
      usuario.resetToken = null;
      usuario.resetTokenExpires = null;
      await usuario.save();
      res.json({ mensagem: 'Senha redefinida com sucesso! Você já pode fazer login.' });
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      res.status(500).json({ mensagem: 'Erro ao redefinir senha', erro: error.message });
    }
  }

}

export default new AuthController();
