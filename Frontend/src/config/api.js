// Configurações de API centralizadas
// Detecta automaticamente ambiente (desenvolvimento/produção)

// URL base da API (backend)
export const API_BASE_URL = import.meta.env.MODE === 'production' 
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
