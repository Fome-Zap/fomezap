// Middleware para detectar tenant por subdomínio ou query parameter
import { Tenant } from '../Models/TenantModels.js';

export async function detectarTenant(req, res, next) {
  try {
    // Log para debug
    console.log(`🔍 detectarTenant chamado: ${req.method} ${req.path}`);
    
    // Pular detecção para rotas que NÃO precisam de tenant
    // IMPORTANTE: Como backup de segurança, mesmo que essas rotas sejam registradas antes deste middleware
    const rotasExcluidas = [
      '/api/super-admin',
      '/api/auth',
      '/health',
      '/detect-tenant'
    ];

    // Verificar se a rota atual começa com alguma das rotas excluídas
    const deveExcluir = rotasExcluidas.some(rota => req.path.startsWith(rota));
    
    if (deveExcluir) {
      console.log(`⏩ Pulando detecção de tenant para: ${req.path}`);
      return next();
    }

    let tenantId = null;
    let tenant = null;

    // 1. Tentar detectar por subdomínio (produção)
    const host = req.get('host'); // ex: lanchonete-central-2.fomezap.com
    const subdomain = host.split('.')[0]; // lanchonete-central-2
    
    // Se não for localhost e não for domínio principal
    if (!host.includes('localhost') && subdomain !== 'fomezap' && subdomain !== 'www' && subdomain !== 'manager') {
      // Buscar tenant pelo slug (subdomínio)
      tenant = await Tenant.findOne({ slug: subdomain });
      
      if (tenant) {
        tenantId = tenant.tenantId;
        console.log(`🌐 Tenant detectado por subdomínio: ${subdomain} -> ${tenantId}`);
      }
    }

    // 2. Se não encontrou, tentar por query parameter (desenvolvimento)
    if (!tenantId && req.query.tenant) {
      const tenantParam = req.query.tenant;
      
      // Tentar buscar por slug primeiro, depois por tenantId
      tenant = await Tenant.findOne({ 
        $or: [
          { slug: tenantParam },
          { tenantId: tenantParam }
        ]
      });
      
      if (tenant) {
        tenantId = tenant.tenantId;
        console.log(`🔍 Tenant detectado por query (${tenantParam}): ${tenantId}`);
      } else {
        console.warn(`⚠️  Tenant não encontrado com slug/id: ${tenantParam}`);
      }
    }

    // 3. Se não encontrou, tentar por header (mobile/API)
    if (!tenantId && req.headers['x-tenant-id']) {
      const headerParam = req.headers['x-tenant-id'];
      
      // Tentar buscar por slug primeiro, depois por tenantId
      tenant = await Tenant.findOne({ 
        $or: [
          { slug: headerParam },
          { tenantId: headerParam }
        ]
      });
      
      if (tenant) {
        tenantId = tenant.tenantId;
        console.log(`📱 Tenant detectado por header (${headerParam}): ${tenantId}`);
      }
    }

    // Adicionar informações ao request
    if (tenant) {
      req.tenant = tenant;
      req.tenantId = tenantId;
      req.tenantSlug = tenant.slug;
      console.log(`✅ Tenant configurado: ${tenantId}`);
    } else if (tenantId) {
      // Caso tenha ID mas não encontrou o tenant
      console.warn(`⚠️  Tenant não encontrado: ${tenantId}`);
      req.tenantId = tenantId;
    } else {
      // Nenhum tenant detectado
      console.log(`⚠️  Nenhum tenant detectado para: ${req.method} ${req.path}`);
      console.log(`   Host: ${req.get('host')}`);
      console.log(`   Query: ${JSON.stringify(req.query)}`);
      console.log(`   Headers x-tenant-id: ${req.headers['x-tenant-id']}`);
    }

    next();
  } catch (error) {
    console.error('Erro ao detectar tenant:', error);
    next();
  }
}

export default detectarTenant;
