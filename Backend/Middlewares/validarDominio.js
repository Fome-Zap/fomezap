// Middleware para validar domínio do manager (super-admin)
// CRÍTICO: Super-admin SOMENTE pode ser acessado em manager.fomezap.com

export const validarDominioManager = (req, res, next) => {
  try {
    const origin = req.get('origin') || req.get('referer') || '';
    const host = req.get('host') || '';
    
    console.log('🔒 Validando domínio manager:', {
      origin,
      host,
      rota: req.path
    });

    // Permitir em desenvolvimento (localhost)
    if (host.includes('localhost') || origin.includes('localhost')) {
      console.log('✅ Ambiente local - acesso permitido');
      return next();
    }

    // Permitir em Vercel sem domínio customizado (para testes)
    if (host.includes('vercel.app') || origin.includes('vercel.app')) {
      console.log('✅ Vercel app - acesso permitido');
      return next();
    }

    // PRODUÇÃO: Verificar se está em manager.fomezap.com
    const ehManager = host === 'manager.fomezap.com' || 
                      origin.includes('manager.fomezap.com');
    
    if (!ehManager) {
      console.warn('🚫 ACESSO NEGADO: Tentativa de acessar super-admin fora do domínio manager');
      console.warn('   Host:', host);
      console.warn('   Origin:', origin);
      console.warn('   Rota:', req.path);
      
      return res.status(403).json({ 
        mensagem: 'Acesso negado. Esta rota só pode ser acessada através de manager.fomezap.com',
        detalhes: {
          dominioAtual: host,
          dominioRequerido: 'manager.fomezap.com'
        }
      });
    }

    console.log('✅ Domínio manager validado - acesso permitido');
    next();

  } catch (error) {
    console.error('Erro ao validar domínio manager:', error);
    return res.status(500).json({ 
      mensagem: 'Erro ao validar domínio',
      erro: error.message 
    });
  }
};

// Middleware para validar que NÃO é domínio manager (para rotas de tenant)
export const validarNaoEhManager = (req, res, next) => {
  try {
    const host = req.get('host') || '';
    
    // Permitir em desenvolvimento
    if (host.includes('localhost') || host.includes('vercel.app')) {
      return next();
    }

    // Bloquear se for manager.fomezap.com
    if (host === 'manager.fomezap.com') {
      console.warn('🚫 Manager tentando acessar rota de tenant');
      return res.status(403).json({ 
        mensagem: 'Esta rota não está disponível no domínio manager.fomezap.com',
        detalhes: 'Acesse através do domínio do tenant'
      });
    }

    next();

  } catch (error) {
    console.error('Erro ao validar domínio:', error);
    return res.status(500).json({ 
      mensagem: 'Erro ao validar domínio',
      erro: error.message 
    });
  }
};

export default { validarDominioManager, validarNaoEhManager };
