// Middleware para detectar tenant por subdomínio ou query parameter
import { Tenant } from '../Models/TenantModels.js';

export async function detectarTenant(req, res, next) {
  try {
    let tenantId = null;
    let tenant = null;

    // 1. Tentar detectar por subdomínio (produção)
    const host = req.get('host'); // ex: lanchonete-central-2.fomezap.com
    const subdomain = host.split('.')[0]; // lanchonete-central-2
    
    // Se não for localhost e não for domínio principal
    if (!host.includes('localhost') && subdomain !== 'fomezap' && subdomain !== 'www') {
      // Buscar tenant pelo slug (subdomínio)
      tenant = await Tenant.findOne({ slug: subdomain });
      
      if (tenant) {
        tenantId = tenant.tenantId;
        console.log(`🌐 Tenant detectado por subdomínio: ${subdomain} -> ${tenantId}`);
      }
    }

    // 2. Se não encontrou, tentar por query parameter (desenvolvimento)
    if (!tenantId && req.query.tenant) {
      tenantId = req.query.tenant;
      tenant = await Tenant.findOne({ tenantId });
      console.log(`🔍 Tenant detectado por query: ${tenantId}`);
    }

    // 3. Se não encontrou, tentar por header (mobile/API)
    if (!tenantId && req.headers['x-tenant-id']) {
      tenantId = req.headers['x-tenant-id'];
      tenant = await Tenant.findOne({ tenantId });
      console.log(`📱 Tenant detectado por header: ${tenantId}`);
    }

    // Adicionar informações ao request
    if (tenant) {
      req.tenant = tenant;
      req.tenantId = tenantId;
      req.tenantSlug = tenant.slug;
    } else if (tenantId) {
      // Caso tenha ID mas não encontrou o tenant
      console.warn(`⚠️  Tenant não encontrado: ${tenantId}`);
      req.tenantId = tenantId;
    }

    next();
  } catch (error) {
    console.error('Erro ao detectar tenant:', error);
    next();
  }
}

export default detectarTenant;
