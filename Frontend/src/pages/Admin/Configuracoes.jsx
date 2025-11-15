import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrencyInput } from '../../hooks/useCurrencyInput';
import api from '../../api/api';

export default function Configuracoes() {
  const { user } = useAuth();
  const tenantId = user?.tenantId;
  
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  
  // Máscaras de moeda
  const taxaEntrega = useCurrencyInput('5.00');
  const pedidoMinimo = useCurrencyInput('25.00');
  
  const [config, setConfig] = useState({
    // Delivery
    aceitaDelivery: true,
    tempoEstimado: '45-60 minutos',
    
    // Horário de Funcionamento
    horarioAbertura: '18:00',
    horarioFechamento: '23:30',
    diasFuncionamento: ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'],
    fusoHorario: 'America/Sao_Paulo', // GMT-3 (Brasília)
    
    // Dados do Restaurante
    nome: 'FomeZap',
    telefone: '(11) 99999-9999',
    endereco: 'Rua Exemplo, 123 - Centro',
    
    // Formas de Pagamento
    formasPagamento: ['dinheiro', 'pix', 'cartao']
  });

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/admin/${tenantId}/configuracoes`);
      
      if (response.data) {
        setConfig(response.data);
        // Atualizar máscaras de moeda
        taxaEntrega.setValue(response.data.taxaEntrega || 5.00);
        pedidoMinimo.setValue(response.data.pedidoMinimo || 25.00);
      }
    } catch (error) {
      console.log('Usando configurações padrão');
    } finally {
      setLoading(false);
    }
  };

  const salvarConfiguracoes = async () => {
    try {
      setLoading(true);
      setMensagem({ tipo: '', texto: '' });

      const payload = {
        ...config,
        taxaEntrega: taxaEntrega.realValue,
        pedidoMinimo: pedidoMinimo.realValue
      };

      const response = await api.put(`/api/admin/${tenantId}/configuracoes`, payload);
      setMensagem({ tipo: 'sucesso', texto: 'Configurações salvas com sucesso!' });
      // Auto-esconder após 5 segundos
      setTimeout(() => setMensagem({ tipo: '', texto: '' }), 5000);
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar configurações' });
      setTimeout(() => setMensagem({ tipo: '', texto: '' }), 5000);
    } finally {
      setLoading(false);
    }
  };

  const toggleDia = (dia) => {
    if (config.diasFuncionamento.includes(dia)) {
      setConfig({
        ...config,
        diasFuncionamento: config.diasFuncionamento.filter(d => d !== dia)
      });
    } else {
      setConfig({
        ...config,
        diasFuncionamento: [...config.diasFuncionamento, dia]
      });
    }
  };

  const toggleFormaPagamento = (forma) => {
    if (config.formasPagamento.includes(forma)) {
      setConfig({
        ...config,
        formasPagamento: config.formasPagamento.filter(f => f !== forma)
      });
    } else {
      setConfig({
        ...config,
        formasPagamento: [...config.formasPagamento, forma]
      });
    }
  };

  const diasSemana = [
    { id: 'segunda', label: 'Segunda' },
    { id: 'terca', label: 'Terça' },
    { id: 'quarta', label: 'Quarta' },
    { id: 'quinta', label: 'Quinta' },
    { id: 'sexta', label: 'Sexta' },
    { id: 'sabado', label: 'Sábado' },
    { id: 'domingo', label: 'Domingo' }
  ];

  const formasPagamentoOpcoes = [
    { id: 'dinheiro', label: 'Dinheiro', icon: '💵' },
    { id: 'pix', label: 'PIX', icon: '📱' },
    { id: 'cartao', label: 'Cartão', icon: '💳' }
  ];

  return (
    <div className="p-6">
      {/* Notificação Flutuante Fixa */}
      {mensagem.texto && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md animate-slide-in ${
          mensagem.tipo === 'sucesso' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {mensagem.tipo === 'sucesso' ? '✅' : '❌'}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{mensagem.tipo === 'sucesso' ? 'Sucesso!' : 'Erro!'}</p>
              <p className="text-sm">{mensagem.texto}</p>
            </div>
            <button
              onClick={() => setMensagem({ tipo: '', texto: '' })}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">⚙️ Configurações</h1>
        <p className="text-gray-600">Configure seu restaurante e delivery</p>
      </div>

      <div className="space-y-6">
        {/* Dados do Restaurante */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            🏪 Dados do Restaurante
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Restaurante
              </label>
              <input
                type="text"
                value={config.nome}
                onChange={(e) => setConfig({ ...config, nome: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone para Pedidos
              </label>
              <input
                type="tel"
                value={config.telefone}
                onChange={(e) => setConfig({ ...config, telefone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço
              </label>
              <input
                type="text"
                value={config.endereco}
                onChange={(e) => setConfig({ ...config, endereco: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Configurações de Delivery */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            🚚 Delivery
          </h2>

          <div className="space-y-4">
            {/* Toggle Delivery */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Aceitar pedidos de delivery</div>
                <div className="text-sm text-gray-600">Ative ou desative o serviço de entrega</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.aceitaDelivery}
                  onChange={(e) => setConfig({ ...config, aceitaDelivery: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>

            {config.aceitaDelivery && (
              <>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Taxa de Entrega
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={taxaEntrega.displayValue}
                      onChange={taxaEntrega.handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="R$ 0,00"
                    />
                    <p className="text-xs text-gray-500 mt-1">Digite apenas números. Ex: 500 = R$ 5,00</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pedido Mínimo
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={pedidoMinimo.displayValue}
                      onChange={pedidoMinimo.handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="R$ 0,00"
                    />
                    <p className="text-xs text-gray-500 mt-1">Digite apenas números. Ex: 2500 = R$ 25,00</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tempo Estimado
                    </label>
                    <input
                      type="text"
                      value={config.tempoEstimado}
                      onChange={(e) => setConfig({ ...config, tempoEstimado: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="45-60 minutos"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Horário de Funcionamento */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            🕐 Horário de Funcionamento
          </h2>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horário de Abertura
                </label>
                <input
                  type="time"
                  value={config.horarioAbertura}
                  onChange={(e) => setConfig({ ...config, horarioAbertura: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horário de Fechamento
                </label>
                <input
                  type="time"
                  value={config.horarioFechamento}
                  onChange={(e) => setConfig({ ...config, horarioFechamento: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dias de Funcionamento
              </label>
              <div className="flex flex-wrap gap-2">
                {diasSemana.map(dia => (
                  <button
                    key={dia.id}
                    type="button"
                    onClick={() => toggleDia(dia.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      config.diasFuncionamento.includes(dia.id)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {dia.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fuso Horário
              </label>
              <select
                value={config.fusoHorario}
                onChange={(e) => setConfig({ ...config, fusoHorario: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                <option value="America/Manaus">Manaus (GMT-4)</option>
                <option value="America/Rio_Branco">Acre (GMT-5)</option>
                <option value="America/Noronha">Fernando de Noronha (GMT-2)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Selecione o fuso horário da sua região para validar horários corretamente
              </p>
            </div>
          </div>
        </div>

        {/* Formas de Pagamento */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            💳 Formas de Pagamento
          </h2>

          <div className="flex flex-wrap gap-3">
            {formasPagamentoOpcoes.map(forma => (
              <button
                key={forma.id}
                type="button"
                onClick={() => toggleFormaPagamento(forma.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  config.formasPagamento.includes(forma.id)
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <span className="text-2xl">{forma.icon}</span>
                {forma.label}
              </button>
            ))}
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-end gap-4">
          <button
            onClick={salvarConfiguracoes}
            disabled={loading}
            className="bg-orange-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : '💾 Salvar Configurações'}
          </button>
        </div>
      </div>
    </div>
  );
}


