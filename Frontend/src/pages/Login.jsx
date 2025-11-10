import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [carregando, setCarregando] = useState(false);

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
      await login(formData.email, formData.senha);
      setMensagem({ tipo: 'sucesso', texto: 'Login realizado! Redirecionando...' });
      
      // Redirecionar após 1 segundo
      setTimeout(() => {
        navigate('/admin');
      }, 1000);

    } catch (error) {
      const mensagemErro = error.response?.data?.mensagem || 'Erro ao fazer login. Verifique suas credenciais.';
      setMensagem({ tipo: 'erro', texto: mensagemErro });
    } finally {
      setCarregando(false);
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
          <p>Esqueceu sua senha? <a href="#" className="text-orange-500 hover:underline">Recuperar</a></p>
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
    </div>
  );
}
