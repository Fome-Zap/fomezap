import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configurar interceptor do axios para incluir token em todas as requisições
  useEffect(() => {
    if (token) {
      // Token já é adicionado automaticamente pelo interceptor da api.js
      // Buscar dados do usuário ao carregar
      buscarUsuario();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Buscar dados do usuário logado
  const buscarUsuario = async () => {
    try {
      const response = await api.get('/api/auth/me');
      const userData = response.data.usuario;
      setUser(userData);
      // Salvar no localStorage também como backup
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      // Se token inválido, fazer logout
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (email, senha) => {
    try {
      const response = await api.post('/api/auth/login', {
        email,
        senha
      });

      const { token: novoToken, usuario } = response.data;

      // Salvar token e user no localStorage
      localStorage.setItem('token', novoToken);
      localStorage.setItem('user', JSON.stringify(usuario));
      setToken(novoToken);
      setUser(usuario);

      return response.data;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  };

  // Registro (caso queira permitir auto-cadastro)
  const register = async (dados) => {
    try {
      const response = await api.post('/api/auth/register', dados);

      const { token: novoToken, usuario } = response.data;

      // Salvar token no localStorage
      localStorage.setItem('token', novoToken);
      setToken(novoToken);
      setUser(usuario);

      return response.data;
    } catch (error) {
      console.error('Erro ao registrar:', error);
      throw error;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('managerMode'); // Limpar flag de manager mode
    setToken(null);
    setUser(null);
  };

  // Alterar senha
  const alterarSenha = async (senhaAtual, senhaNova) => {
    try {
      const response = await api.post('/api/auth/alterar-senha', {
        senhaAtual,
        senhaNova
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    alterarSenha,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export default AuthContext;
