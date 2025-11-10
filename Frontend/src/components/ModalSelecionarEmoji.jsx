import { useState } from 'react';
import { X, Search } from 'lucide-react';

const ModalSelecionarEmoji = ({ isOpen, onClose, onSelect }) => {
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos');

  const emojisComida = {
    lanches: {
      nome: 'Lanches',
      emojis: ['🍔', '🌭', '🥪', '🌮', '🌯', '🥙', '🍟', '🥓', '🥩', '🍖']
    },
    pizzas: {
      nome: 'Pizzas e Massas',
      emojis: ['🍕', '🍝', '🥘', '🥟', '🥠', '🥡']
    },
    bebidas: {
      nome: 'Bebidas',
      emojis: ['🥤', '🧃', '🧋', '☕', '🍵', '🧉', '🥛', '🍺', '🍻', '🍷', '🥂', '🍹', '🍸']
    },
    sobremesas: {
      nome: 'Sobremesas',
      emojis: ['🍰', '🎂', '🧁', '🍪', '🍩', '🍦', '🍨', '🍧', '🍫', '🍬', '🍭']
    },
    frutas: {
      nome: 'Frutas e Saudáveis',
      emojis: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🥗', '🥑', '🥒']
    },
    paes: {
      nome: 'Pães e Padaria',
      emojis: ['🥐', '🥖', '🍞', '🥯', '🧇', '🥞']
    },
    asiaticos: {
      nome: 'Culinária Asiática',
      emojis: ['🍜', '🍱', '🍣', '🍤', '🥢', '🍛', '🍙', '🍚']
    },
    outros: {
      nome: 'Outros',
      emojis: ['🌶️', '🧀', '🥚', '🍳', '🧈', '🍿', '🥜', '🌰']
    }
  };

  const todosEmojis = Object.values(emojisComida).flatMap(cat => cat.emojis);

  const emojisExibidos = categoriaAtiva === 'todos' 
    ? todosEmojis 
    : emojisComida[categoriaAtiva]?.emojis || [];

  const emojisFiltrados = busca 
    ? emojisExibidos.filter(emoji => emoji.includes(busca))
    : emojisExibidos;

  const handleSelect = (emoji) => {
    onSelect(emoji);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Escolher Emoji</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X size={24} />
            </button>
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar emoji..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categorias */}
        <div className="px-6 py-4 border-b border-gray-200 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            <button
              type="button"
              onClick={() => setCategoriaAtiva('todos')}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                categoriaAtiva === 'todos'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            {Object.entries(emojisComida).map(([key, { nome }]) => (
              <button
                type="button"
                key={key}
                onClick={() => setCategoriaAtiva(key)}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  categoriaAtiva === key
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {nome}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Emojis */}
        <div className="flex-1 overflow-y-auto p-6">
          {emojisFiltrados.length > 0 ? (
            <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2">
              {emojisFiltrados.map((emoji, index) => (
                <button
                  type="button"
                  key={`${emoji}-${index}`}
                  onClick={() => handleSelect(emoji)}
                  className="aspect-square flex items-center justify-center text-4xl hover:bg-orange-50 rounded-lg transition transform hover:scale-110 active:scale-95"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <span className="text-6xl">🔍</span>
              <p className="mt-4 text-lg">Nenhum emoji encontrado</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>💡 Clique em um emoji para selecionar</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalSelecionarEmoji;
