import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/api';

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  
  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user) {
      const role = user.role;
      if (role === 'super_admin') {
        navigate('/super-admin');
      } else {
        navigate('/admin');
      }
    }
  }, [user, navigate]);
  
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [carregando, setCarregando] = useState(false);
  
  // Estados para recuperação de senha
  const [showRecuperarSenha, setShowRecuperarSenha] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState('');
  const [loadingRecuperacao, setLoadingRecuperacao] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem({ tipo: '', texto: '' });
    
    // Validações
    if (!formData.email || !formData.senha) {
      setMensagem({ tipo: 'erro', texto: 'Preencha todos os campos' });
      return;
    }

    setCarregando(true);

    try {
      const userData = await login(formData.email, formData.senha);
      setMensagem({ tipo: 'sucesso', texto: 'Login realizado! Redirecionando...' });
      
      console.log('🔍 Dados do login:', userData);
      
      // Redirecionar após 1 segundo baseado na role
      setTimeout(() => {
        // userData = { token, usuario }
        const role = userData.usuario?.role || userData.role;
        
        console.log('🎯 Role detectada:', role);
        
        if (role === 'super_admin') {
          console.log('✅ Redirecionando para /super-admin');
          navigate('/super-admin');
        } else {
          console.log('✅ Redirecionando para /admin');
          navigate('/admin');
        }
      }, 1000);

    } catch (error) {
      const mensagemErro = error.response?.data?.mensagem || 'Erro ao fazer login. Verifique suas credenciais.';
      setMensagem({ tipo: 'erro', texto: mensagemErro });
    } finally {
      setCarregando(false);
    }
  };

  const handleRecuperarSenha = async (e) => {
    e.preventDefault();
    
    if (!emailRecuperacao) {
      setMensagem({ tipo: 'erro', texto: 'Digite seu email' });
      return;
    }

    setLoadingRecuperacao(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      const response = await api.post('/api/auth/recuperar-senha', {
        email: emailRecuperacao
      });

      // Mostrar senha temporária (apenas para desenvolvimento)
      if (response.data.senhaTemporaria) {
        setMensagem({ 
          tipo: 'sucesso', 
          texto: `Senha temporária: ${response.data.senhaTemporaria}\n\n${response.data.aviso}` 
        });
      } else {
        setMensagem({ 
          tipo: 'sucesso', 
          texto: response.data.mensagem 
        });
      }

      // Fechar modal após 8 segundos
      setTimeout(() => {
        setShowRecuperarSenha(false);
        setEmailRecuperacao('');
        setMensagem({ tipo: '', texto: '' });
      }, 8000);

    } catch (error) {
      const mensagemErro = error.response?.data?.mensagem || 'Erro ao recuperar senha';
      setMensagem({ tipo: 'erro', texto: mensagemErro });
    } finally {
      setLoadingRecuperacao(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        
        {/* Logo/Título */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🍔</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">FomeZap</h1>
          <p className="text-gray-600">Painel Administrativo</p>
        </div>

        {/* Toast de Mensagem */}
        {mensagem.texto && (
          <div className={`mb-6 p-4 rounded-lg ${
            mensagem.tipo === 'sucesso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {mensagem.texto}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              placeholder="seu@email.com"
              disabled={carregando}
            />
          </div>

          {/* Senha */}
          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              id="senha"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              placeholder="••••••••"
              disabled={carregando}
            />
          </div>

          {/* Botão Submit */}
          <button
            type="submit"
            disabled={carregando}
            className={`w-full py-3 rounded-lg font-semibold text-white transition ${
              carregando
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 active:scale-95'
            }`}
          >
            {carregando ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Entrando...
              </span>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Links adicionais */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Esqueceu sua senha? {' '}
            <button 
              onClick={() => setShowRecuperarSenha(true)}
              className="text-orange-500 hover:underline font-medium"
            >
              Recuperar
            </button>
          </p>
        </div>

        {/* Versão de desenvolvimento - credenciais de teste */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-xs text-gray-600">
            <p className="font-semibold mb-2">🔧 Modo Desenvolvimento</p>
            <p><strong>Email:</strong> admin@demo.com</p>
            <p><strong>Senha:</strong> 123456</p>
            <p className="mt-2 text-gray-500">Execute: <code className="bg-white px-2 py-1 rounded">node criarUsuario.js</code></p>
          </div>
        )}
      </div>

      {/* Modal de Recuperação de Senha */}
      {showRecuperarSenha && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fade-in">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🔑</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Recuperar Senha</h2>
              <p className="text-gray-600 text-sm">Digite seu email cadastrado</p>
            </div>

            <form onSubmit={handleRecuperarSenha} className="space-y-4">
              <div>
                <label htmlFor="emailRecuperacao" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="emailRecuperacao"
                  value={emailRecuperacao}
                  onChange={(e) => setEmailRecuperacao(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  placeholder="seu@email.com"
                  disabled={loadingRecuperacao}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRecuperarSenha(false);
                    setEmailRecuperacao('');
                    setMensagem({ tipo: '', texto: '' });
                  }}
                  disabled={loadingRecuperacao}
                  className="flex-1 py-3 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingRecuperacao}
                  className={`flex-1 py-3 rounded-lg font-semibold text-white transition ${
                    loadingRecuperacao
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600 active:scale-95'
                  }`}
                >
                  {loadingRecuperacao ? 'Enviando...' : 'Recuperar'}
                </button>
              </div>
            </form>

            <p className="text-xs text-gray-500 mt-4 text-center">
              💡 Em produção, você receberia um email com instruções
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
