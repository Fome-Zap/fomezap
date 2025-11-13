// Configurações de API centralizadas
// Detecta automaticamente ambiente (desenvolvimento/produção)

// Detectar produção de forma confiável
const isProduction = import.meta.env.PROD || 
  (typeof window !== 'undefined' && 
   (window.location.hostname.includes('vercel.app') || 
    window.location.hostname.includes('fomezap.com')));

// URL base da API (backend)
export const API_BASE_URL = isProduction
  ? 'https://fomezap-api.onrender.com' 
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

// Log de configuração (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  console.log('🔧 Configuração API:', {
    API_BASE_URL,
    API_URL,
    UPLOADS_URL,
    ambiente: import.meta.env.MODE
  });
}
