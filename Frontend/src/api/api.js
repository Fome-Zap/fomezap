import axios from 'axios';

// Configurar base URL - detecta ambiente automaticamente (SEM variáveis de ambiente)
const api = axios.create({
  baseURL: import.meta.env.MODE === 'production' 
    ? 'https://fomezap-api.onrender.com'
    : (import.meta.env.DEV ? 'http://localhost:5000' : 'http://localhost:5000'),
  headers: {
    'Content-Type': 'application/json'
  }
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
