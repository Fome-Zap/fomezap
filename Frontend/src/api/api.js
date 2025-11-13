import axios from 'axios';

// Detectar se está em produção pelo hostname (mais confiável que import.meta.env.MODE)
const isProduction = typeof window !== 'undefined' && 
  (window.location.hostname.includes('vercel.app') || 
   window.location.hostname.includes('fomezap.com'));

// Configurar base URL
const api = axios.create({
  baseURL: isProduction
    ? 'https://fomezap-api.onrender.com'
    : 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

console.log('🔧 API configurada:', {
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'SSR',
  isProduction,
  baseURL: api.defaults.baseURL
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Só adicionar token em rotas protegidas (admin e auth/me)
    const rotasProtegidas = ['/api/admin', '/api/auth/me', '/api/auth/alterar-senha', '/api/upload/foto'];
    const ehRotaProtegida = rotasProtegidas.some(rota => config.url?.includes(rota));
    
    if (token && ehRotaProtegida) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
