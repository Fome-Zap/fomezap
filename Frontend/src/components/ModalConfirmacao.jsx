// src/components/ModalConfirmacao.jsx - Modal de confirmação reutilizável
import { X, AlertTriangle, Trash2 } from 'lucide-react';

function ModalConfirmacao({ 
  aberto, 
  onFechar, 
  onConfirmar, 
  titulo = "Confirmar ação",
  mensagem = "Tem certeza que deseja continuar?",
  textoBotaoConfirmar = "Confirmar",
  textoBotaoCancelar = "Cancelar",
  tipo = "danger" // danger, warning, info
}) {
  if (!aberto) return null;

  const estilos = {
    danger: {
      icone: <Trash2 className="w-12 h-12 text-red-600" />,
      botao: "bg-red-600 hover:bg-red-700",
      header: "text-red-800"
    },
    warning: {
      icone: <AlertTriangle className="w-12 h-12 text-yellow-600" />,
      botao: "bg-yellow-600 hover:bg-yellow-700",
      header: "text-yellow-800"
    },
    info: {
      icone: <AlertTriangle className="w-12 h-12 text-blue-600" />,
      botao: "bg-blue-600 hover:bg-blue-700",
      header: "text-blue-800"
    }
  };

  const estilo = estilos[tipo] || estilos.danger;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-fadeIn">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {estilo.icone}
              <h2 className={`text-xl font-bold ${estilo.header}`}>{titulo}</h2>
            </div>
            <button
              onClick={onFechar}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mensagem */}
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed">{mensagem}</p>
        </div>

        {/* Botões */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onFechar}
            className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
          >
            {textoBotaoCancelar}
          </button>
          <button
            onClick={() => {
              onConfirmar();
              onFechar();
            }}
            className={`flex-1 px-4 py-2.5 text-white rounded-lg font-medium transition-colors ${estilo.botao}`}
          >
            {textoBotaoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalConfirmacao;
