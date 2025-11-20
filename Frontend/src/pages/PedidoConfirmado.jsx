import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCurrentTenant } from '../config/api';

export default function PedidoConfirmado() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // DETECÇÃO AUTOMÁTICA DE TENANT POR SUBDOMÍNIO
  const tenantId = getCurrentTenant() || searchParams.get('tenant') || 'demo';
  const numeroPedido = searchParams.get('numero');
  const whatsappUrl = searchParams.get('whatsapp');

  useEffect(() => {
    // Se não tem número do pedido, redireciona
    if (!numeroPedido) {
      navigate('/');
    }
  }, [numeroPedido, navigate]);

  const abrirWhatsApp = () => {
    if (whatsappUrl) {
      window.open(decodeURIComponent(whatsappUrl), '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {/* Ícone de sucesso animado */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Mensagem de sucesso */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Pedido Confirmado!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Seu pedido foi recebido com sucesso
        </p>

        {/* Número do pedido */}
        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-600 mb-1">Número do Pedido</div>
          <div className="text-2xl font-bold text-orange-600">
            #{numeroPedido}
          </div>
        </div>

        {/* Informações */}
        <div className="text-left bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex items-start">
            <span className="text-2xl mr-3">⏱️</span>
            <div>
              <div className="font-medium">Tempo estimado</div>
              <div className="text-sm text-gray-600">45-60 minutos</div>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="text-2xl mr-3">📱</span>
            <div>
              <div className="font-medium">Acompanhe seu pedido</div>
              <div className="text-sm text-gray-600">Enviaremos atualizações por WhatsApp</div>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="space-y-3">
          {whatsappUrl && (
            <button
              onClick={abrirWhatsApp}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Enviar pelo WhatsApp
            </button>
          )}

          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors"
          >
            Voltar ao Cardápio
          </button>
        </div>

        {/* Nota */}
        <p className="text-xs text-gray-500 mt-6">
          Guarde o número do pedido para acompanhamento
        </p>
      </div>
    </div>
  );
}
