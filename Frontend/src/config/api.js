// Configurações de API centralizadas
// Detecta automaticamente ambiente (desenvolvimento/produção) e tenant por subdomínio

// Detectar produção de forma confiável
const isProduction = import.meta.env.PROD || 
  (typeof window !== 'undefined' && 
   (window.location.hostname.includes('vercel.app') || 
    window.location.hostname.includes('fomezap.com')));

// URL base da API (backend)
export const API_BASE_URL = isProduction
  ? '' // Usar URL relativa em produção (proxy do Nginx)
  : 'http://localhost:5000';

// URL completa da API com /api
export const API_URL = `${API_BASE_URL}/api`;

// URL para uploads de imagens
export const UPLOADS_URL = API_BASE_URL;

// Função helper para URLs de imagem
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${UPLOADS_URL}${imagePath}`;
};

// ============================================================
// DETECÇÃO AUTOMÁTICA DE TENANT POR SUBDOMÍNIO
// ============================================================

/**
 * Detecta o tipo de acesso com base no hostname
 * @returns {Object} { accessType: 'manager' | 'tenant' | 'local', tenantSlug: string | null }
 */
export const detectAccessType = () => {
  if (typeof window === 'undefined') {
    return { accessType: 'local', tenantSlug: null };
  }

  const hostname = window.location.hostname;
  
  // Desenvolvimento local
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return { accessType: 'local', tenantSlug: null };
  }

  // Produção Vercel sem domínio customizado
  if (hostname.includes('vercel.app')) {
    return { accessType: 'local', tenantSlug: null };
  }

  // Domínio principal (não customizado)
  if (hostname === 'fomezap.com' || hostname === 'www.fomezap.com') {
    return { accessType: 'local', tenantSlug: null };
  }

  // Manager (Super Admin)
  if (hostname === 'manager.fomezap.com') {
    return { accessType: 'manager', tenantSlug: null };
  }

  // Tenant por subdomínio (ex: bkjau.fomezap.com)
  if (hostname.endsWith('.fomezap.com')) {
    const subdomain = hostname.split('.')[0];
    // Excluir subdomínios reservados
    if (['www', 'manager', 'api', 'admin', 'lanchoneteemfamilia'].includes(subdomain)) {
      return { accessType: 'local', tenantSlug: null };
    }
    return { accessType: 'tenant', tenantSlug: subdomain };
  }

  return { accessType: 'local', tenantSlug: null };
};

/**
 * Obtém o tenant atual (por subdomínio ou query parameter)
 * @returns {string | null} Slug do tenant
 */
export const getCurrentTenant = () => {
  // 1. Tentar detectar por subdomínio
  const { accessType, tenantSlug } = detectAccessType();
  if (accessType === 'tenant' && tenantSlug) {
    return tenantSlug;
  }

  // 2. Fallback para query parameter (desenvolvimento)
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tenant');
  }

  return null;
};

/**
 * Verifica se está no domínio do Manager (Super Admin)
 * Em desenvolvimento (localhost), permite acesso se:
 * 1. Houver parâmetro ?mode=manager na URL OU
 * 2. Flag 'managerMode' estiver no localStorage (persiste após redirecionamento)
 * @returns {boolean}
 */
export const isManagerDomain = () => {
  const { accessType } = detectAccessType();
  
  // Em desenvolvimento (localhost)
  if (typeof window !== 'undefined' && window.location.hostname.includes('localhost')) {
    // Verificar query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const temQueryParam = urlParams.get('mode') === 'manager';
    
    // Verificar localStorage (persiste após login)
    const temFlagLocalStorage = localStorage.getItem('managerMode') === 'true';
    
    console.log('🔍 isManagerDomain (localhost):', {
      temQueryParam,
      temFlagLocalStorage,
      resultado: temQueryParam || temFlagLocalStorage
    });
    
    return temQueryParam || temFlagLocalStorage;
  }
  
  // Em produção, apenas domínio manager.fomezap.com
  return accessType === 'manager';
};

/**
 * Verifica se está em um domínio de tenant
 * @returns {boolean}
 */
export const isTenantDomain = () => {
  const { accessType } = detectAccessType();
  return accessType === 'tenant';
};

// Log de configuração (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  const detecao = detectAccessType();
  console.log('🔧 Configuração API:', {
    API_BASE_URL,
    API_URL,
    UPLOADS_URL,
    ambiente: import.meta.env.MODE,
    deteccao: detecao,
    tenantAtual: getCurrentTenant()
  });
}

// Log para produção também
if (isProduction) {
  const detecao = detectAccessType();
  console.log('🌐 Ambiente Produção:', {
    hostname: window.location.hostname,
    accessType: detecao.accessType,
    tenantSlug: detecao.tenantSlug,
    tenantAtual: getCurrentTenant()
  });
}
