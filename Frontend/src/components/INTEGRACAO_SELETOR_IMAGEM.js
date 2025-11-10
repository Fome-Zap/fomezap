/**
 * 📋 COMO INTEGRAR O SELETOR DE IMAGEM EM PRODUTOS.JSX
 * 
 * Este arquivo mostra como usar o componente SeletorImagemProduto
 * no formulário de criação/edição de produtos.
 */

// ============================================
// 1. IMPORTAR O COMPONENTE
// ============================================
import SeletorImagemProduto from '../../components/SeletorImagemProduto';

// ============================================
// 2. ADICIONAR AOS ESTADOS DO FORMULÁRIO
// ============================================
const [formData, setFormData] = useState({
  nome: '',
  descricao: '',
  preco: '',
  categoria: '',
  codigo: '',
  // NOVOS CAMPOS:
  emoji: '',        // Armazena o emoji (ex: "🍔")
  imagem: '',       // Armazena a URL da imagem (ex: "/uploads/...")
  tipoImagem: null, // 'emoji' | 'imagem' | null
  disponivel: true,
  destaque: false
});

// ============================================
// 3. HANDLER PARA O SELETOR
// ============================================
const handleImagemChange = ({ tipo, valor }) => {
  setFormData(prev => ({
    ...prev,
    tipoImagem: tipo,
    emoji: tipo === 'emoji' ? valor : '',
    imagem: tipo === 'imagem' ? valor : ''
  }));
};

// ============================================
// 4. ADICIONAR NO FORMULÁRIO (DENTRO DO MODAL)
// ============================================
{/* ... outros campos (nome, descrição, etc) ... */}

{/* SELETOR DE IMAGEM */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Imagem do Produto
  </label>
  <SeletorImagemProduto
    valor={formData.emoji || formData.imagem || null}
    onChange={handleImagemChange}
  />
</div>

{/* ... resto do formulário ... */}

// ============================================
// 5. AO SALVAR (handleSalvar)
// ============================================
const handleSalvar = async () => {
  try {
    const dadosProduto = {
      nome: formData.nome,
      descricao: formData.descricao,
      preco: parseFloat(formData.preco),
      categoria: formData.categoria,
      codigo: formData.codigo,
      emoji: formData.emoji,        // ← Enviar emoji
      imagem: formData.imagem,      // ← Enviar URL da imagem
      disponivel: formData.disponivel,
      destaque: formData.destaque
    };

    if (produtoEditando) {
      // Atualizar
      await api.put(`/api/admin/${TENANT_ID}/produtos/${produtoEditando._id}`, dadosProduto);
    } else {
      // Criar
      await api.post(`/api/admin/${TENANT_ID}/produtos`, dadosProduto);
    }

    // Recarregar lista e fechar modal
    carregarProdutos();
    setModalAberto(false);
  } catch (error) {
    console.error('Erro ao salvar:', error);
    alert('Erro ao salvar produto');
  }
};

// ============================================
// 6. AO EDITAR PRODUTO EXISTENTE
// ============================================
const abrirModalEdicao = (produto) => {
  setProdutoEditando(produto);
  setFormData({
    nome: produto.nome,
    descricao: produto.descricao || '',
    preco: produto.preco,
    categoria: produto.categoria._id,
    codigo: produto.codigo || '',
    emoji: produto.emoji || '',
    imagem: produto.imagem || '',
    tipoImagem: produto.emoji ? 'emoji' : produto.imagem ? 'imagem' : null,
    disponivel: produto.disponivel,
    destaque: produto.destaque
  });
  setModalAberto(true);
};

// ============================================
// 7. EXIBIR NO CARDÁPIO PÚBLICO (FomeZapExact.jsx)
// ============================================
{produtos.map(produto => (
  <div key={produto._id} className="produto-card">
    {/* PRIORIDADE: imagem → emoji → placeholder */}
    {produto.imagem ? (
      <img 
        src={produto.imagem} 
        alt={produto.nome}
        className="w-full h-48 object-cover rounded-lg"
      />
    ) : produto.emoji ? (
      <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-lg">
        <span className="text-8xl">{produto.emoji}</span>
      </div>
    ) : (
      <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-lg">
        <span className="text-6xl text-gray-300">🍽️</span>
      </div>
    )}
    
    <h3 className="font-bold text-lg mt-3">{produto.nome}</h3>
    <p className="text-gray-600 text-sm">{produto.descricao}</p>
    <span className="text-orange-600 font-bold text-xl">
      R$ {produto.preco.toFixed(2)}
    </span>
  </div>
))}

/**
 * ============================================
 * 📝 RESUMO
 * ============================================
 * 
 * O componente SeletorImagemProduto:
 * ✅ Mostra preview da imagem/emoji selecionado
 * ✅ Botão "Escolher Emoji" → Abre modal com 100+ emojis
 * ✅ Botão "Upload de Foto" → Drag & drop + validação
 * ✅ Permite remover seleção (volta para placeholder)
 * ✅ UX profissional com feedback visual
 * 
 * No banco de dados:
 * - emoji: String (ex: "🍔" ou "")
 * - imagem: String (ex: "/uploads/foto.webp" ou "")
 * 
 * No cardápio público:
 * 1. Se tem imagem → mostra imagem
 * 2. Se tem emoji → mostra emoji grande
 * 3. Se não tem nada → mostra 🍽️ genérico
 */
