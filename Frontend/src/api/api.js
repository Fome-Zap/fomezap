import axios from 'axios';

// Detectar produção de forma confiável
// 1. Vite define import.meta.env.PROD em builds de produção
// 2. Fallback: verificar hostname se estiver no browser
const isProduction = import.meta.env.PROD || 
  (typeof window !== 'undefined' && 
   (window.location.hostname.includes('vercel.app') || 
    window.location.hostname.includes('fomezap.com')));

const baseURL = isProduction
  ? 'https://fomezap-api.onrender.com'
  : 'http://localhost:5000';

// Configurar base URL
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Log para debug (sempre mostrar, para verificar)
console.log('🔧 API configurada:', {
  'import.meta.env.PROD': import.meta.env.PROD,
  'import.meta.env.DEV': import.meta.env.DEV,
  'import.meta.env.MODE': import.meta.env.MODE,
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'SSR',
  isProduction,
  baseURL
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Só adicionar token em rotas protegidas (admin, super-admin e auth/me)
    const rotasProtegidas = [
      '/api/admin', 
      '/api/super-admin', 
      '/api/auth/me', 
      '/api/auth/alterar-senha', 
      '/api/auth/alterar-email', // garantir token ao alterar email
      '/api/upload/foto'
    ];
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
    // Evitar logout automático para endpoints que retornam 401 por validação de dados
    // (ex: alterar-email quando a senha informada está incorreta).
    // Neste caso, queremos propagar o erro para o catch do componente e
    // não forçar a limpeza do token/localStorage.
    const requestUrl = error.config?.url || '';
    const isAlterarEmail = requestUrl.includes('/api/auth/alterar-email');

    if (error.response?.status === 401 && !isAlterarEmail) {
      // Token inválido ou expirado (não é a rota alterar-email) => forçar logout
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
