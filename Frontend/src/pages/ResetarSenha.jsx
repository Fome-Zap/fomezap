import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../api/api';

export default function ResetarSenha() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [senhaNova, setSenhaNova] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');
    setSucesso(false);
    if (senhaNova.length < 6) {
      setMensagem('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (senhaNova !== confirmarSenha) {
      setMensagem('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post(`/api/auth/resetar-senha/${token}`, { senhaNova });
      setMensagem(response.data.mensagem || 'Senha redefinida com sucesso!');
      setSucesso(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setMensagem(error.response?.data?.mensagem || 'Erro ao redefinir senha. Tente novamente.');
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
          disabled={sucesso}
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Voltar</span>
        </button>
        <img src="/img/fomezap_logoLaranjaFundoTranspHoriz.png" alt="FomeZap" className="h-12 mb-6" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Redefinir Senha</h1>
        <p className="text-gray-600 mb-6 text-center">Digite sua nova senha abaixo.</p>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <input
            type="password"
            value={senhaNova}
            onChange={e => setSenhaNova(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Nova senha"
            required
            minLength={6}
            disabled={loading || sucesso}
          />
          <input
            type="password"
            value={confirmarSenha}
            onChange={e => setConfirmarSenha(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Confirmar nova senha"
            required
            minLength={6}
            disabled={loading || sucesso}
          />
          <button
            type="submit"
            disabled={loading || sucesso}
            className="w-full py-3 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 transition disabled:opacity-50"
          >
            {loading ? 'Redefinindo...' : 'Redefinir senha'}
          </button>
        </form>
        {mensagem && (
          <div className={`mt-6 p-4 rounded-lg text-center font-medium ${sucesso ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{mensagem}</div>
        )}
      </div>
    </div>
  );
}
