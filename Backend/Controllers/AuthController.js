import jwt from 'jsonwebtoken';
import User from '../Models/User.js';

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

}

export default new AuthController();
