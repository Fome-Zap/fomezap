import { useState } from 'react';
import { Image as ImageIcon, Smile } from 'lucide-react';
import ModalSelecionarEmoji from './ModalSelecionarEmoji';
import UploadFoto from './UploadFoto';
import { getImageUrl } from '../config/api';

const SeletorImagemProduto = ({ valor, onChange }) => {
  const [modalAberto, setModalAberto] = useState(null); // 'emoji' | 'upload' | null

  // Detectar se o valor é emoji ou URL de imagem
  const isEmoji = valor && valor.length <= 4 && /\p{Emoji}/u.test(valor);
  const isImagem = valor && !isEmoji;

  const handleSelecionarEmoji = (emoji) => {
    onChange({ tipo: 'emoji', valor: emoji });
    setModalAberto(null);
  };

  const handleUploadSuccess = (url) => {
    onChange({ tipo: 'imagem', valor: url });
    setModalAberto(null);
  };

  const handleRemover = () => {
    onChange({ tipo: null, valor: null });
  };

  return (
    <div className="space-y-4">
      {/* Preview Atual */}
      {valor ? (
        <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {isEmoji ? 'Emoji selecionado' : 'Imagem do produto'}
            </span>
            <button
              type="button"
              onClick={handleRemover}
              className="text-red-500 hover:text-red-600 transition"
              title="Remover"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex items-center justify-center w-full h-48 bg-white rounded-lg border-2 border-gray-200">
            {isEmoji ? (
              <span className="text-8xl">{valor}</span>
            ) : (
              <img
                src={getImageUrl(valor)}
                alt="Preview do produto"
                className="max-w-full max-h-full object-contain rounded-lg"
                onError={(e) => {
                  console.error('Erro ao carregar imagem:', valor);
                  e.target.style.display = 'none';
                }}
              />
            )}
          </div>
        </div>
      ) : (
        /* Placeholder - Sem imagem */
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 bg-gray-50">
          <div className="flex items-center justify-center w-full h-48 text-gray-300">
            <div className="text-center">
              <ImageIcon size={64} className="mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Nenhuma imagem selecionada</p>
              <p className="text-sm text-gray-400 mt-1">Escolha um emoji ou faça upload</p>
            </div>
          </div>
        </div>
      )}

      {/* Botões de Ação */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setModalAberto('emoji')}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition font-medium"
        >
          <Smile size={20} />
          Escolher Emoji
        </button>
        
        <button
          type="button"
          onClick={() => setModalAberto('upload')}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
        >
          <ImageIcon size={20} />
          Upload de Foto
        </button>
      </div>

      <p className="text-sm text-gray-500 text-center">
        💡 Ou deixe em branco para usar um ícone genérico (🍽️)
      </p>

      {/* Modal de Emoji */}
      <ModalSelecionarEmoji
        isOpen={modalAberto === 'emoji'}
        onClose={() => setModalAberto(null)}
        onSelect={handleSelecionarEmoji}
      />

      {/* Modal de Upload */}
      {modalAberto === 'upload' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Upload de Foto</h2>
              <button
                type="button"
                onClick={() => setModalAberto(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>
            
            <UploadFoto
              onUploadSuccess={handleUploadSuccess}
              onClose={() => setModalAberto(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SeletorImagemProduto;
