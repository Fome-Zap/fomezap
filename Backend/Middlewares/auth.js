import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seu-segredo-super-secreto-aqui-2024';

// Middleware para verificar token JWT
export const verificarToken = (req, res, next) => {
  try {
    // Pegar token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        mensagem: 'Token não fornecido. Faça login para acessar este recurso.' 
      });
    }

    // Formato esperado: "Bearer TOKEN_AQUI"
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ 
        mensagem: 'Formato de token inválido. Use: Bearer [token]' 
      });
    }

    const token = parts[1];

    // Verificar e decodificar token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ 
          mensagem: 'Token inválido ou expirado. Faça login novamente.' 
        });
      }

      // Adicionar dados do usuário ao request
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
      req.userRole = decoded.role;
      req.tenantId = decoded.tenantId;

      next();
    });

  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return res.status(500).json({ 
      mensagem: 'Erro ao verificar autenticação',
      erro: error.message 
    });
  }
};

// Middleware para verificar se usuário é admin do tenant
export const verificarTenantAdmin = (req, res, next) => {
  try {
    const { tenantId } = req.params;
    
    // Log para debug
    console.log('🔍 verificarTenantAdmin:', {
      urlTenantId: tenantId,
      userTenantId: req.tenantId,
      userRole: req.userRole,
      userId: req.userId
    });
    
    // Super admin pode acessar qualquer tenant
    if (req.userRole === 'super_admin') {
      console.log('✅ Super admin - acesso permitido');
      return next();
    }

    // Tenant admin e employee só podem acessar seu próprio tenant
    if (req.tenantId !== tenantId) {
      console.log('❌ Acesso negado - tenant diferente');
      return res.status(403).json({ 
        mensagem: 'Acesso negado. Você não tem permissão para acessar este tenant.' 
      });
    }

    console.log('✅ Acesso permitido');
    next();

  } catch (error) {
    console.error('Erro ao verificar permissão de tenant:', error);
    return res.status(500).json({ 
      mensagem: 'Erro ao verificar permissões',
      erro: error.message 
    });
  }
};

// Middleware para verificar se usuário é super admin
export const verificarSuperAdmin = (req, res, next) => {
  try {
    if (req.userRole !== 'super_admin') {
      return res.status(403).json({ 
        mensagem: 'Acesso negado. Apenas super administradores podem acessar este recurso.' 
      });
    }

    next();

  } catch (error) {
    console.error('Erro ao verificar super admin:', error);
    return res.status(500).json({ 
      mensagem: 'Erro ao verificar permissões',
      erro: error.message 
    });
  }
};

// Middleware para verificar roles específicas
export const verificarRoles = (...rolesPermitidas) => {
  return (req, res, next) => {
    try {
      if (!rolesPermitidas.includes(req.userRole)) {
        return res.status(403).json({ 
          mensagem: `Acesso negado. Roles permitidas: ${rolesPermitidas.join(', ')}` 
        });
      }

      next();

    } catch (error) {
      console.error('Erro ao verificar roles:', error);
      return res.status(500).json({ 
        mensagem: 'Erro ao verificar permissões',
        erro: error.message 
      });
    }
  };
};
