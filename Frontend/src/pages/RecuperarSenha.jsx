import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../api/api';

export default function RecuperarSenha() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    setSucesso(false);
    setLoading(true);
    try {
      const response = await api.post('/api/auth/recuperar-senha', { email });
      setMensagem(response.data.mensagem || 'Se o email estiver cadastrado, você receberá instruções para recuperar sua senha.');
      setSucesso(true);
    } catch (error) {
      setMensagem(error.response?.data?.mensagem || 'Erro ao solicitar recuperação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 flex flex-col items-center relative">
        <button
          onClick={() => navigate('/login')}
          className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Voltar</span>
        </button>
        <img src="/img/fomezap_logoLaranjaFundoTranspHoriz.png" alt="FomeZap" className="h-12 mb-6" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Recuperar Senha</h1>
        <p className="text-gray-600 mb-6 text-center">Digite seu email cadastrado para receber o link de redefinição de senha.</p>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="seu@email.com"
            required
            disabled={loading || sucesso}
          />
          <button
            type="submit"
            disabled={loading || sucesso}
            className="w-full py-3 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 transition disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
        </form>
        {mensagem && (
          <div className={`mt-6 p-4 rounded-lg text-center font-medium ${sucesso ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{mensagem}</div>
        )}
      </div>
    </div>
  );
}
