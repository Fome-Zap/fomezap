// src/contexts/CarrinhoContext.jsx - Context para carrinho de compras
import { createContext, useContext, useReducer } from 'react';

const CarrinhoContext = createContext();

// Reducer para gerenciar estado do carrinho
const carrinhoReducer = (state, action) => {
  switch (action.type) {
    case 'ADICIONAR_ITEM':
      const itemExistente = state.itens.find(
        item => item.produtoId === action.payload.produtoId &&
                JSON.stringify(item.extras) === JSON.stringify(action.payload.extras)
      );

      if (itemExistente) {
        return {
          ...state,
          itens: state.itens.map(item =>
            item.produtoId === action.payload.produtoId &&
            JSON.stringify(item.extras) === JSON.stringify(action.payload.extras)
              ? { ...item, quantidade: item.quantidade + action.payload.quantidade }
              : item
          )
        };
      }

      return {
        ...state,
        itens: [...state.itens, action.payload]
      };

    case 'REMOVER_ITEM':
      return {
        ...state,
        itens: state.itens.filter((_, index) => index !== action.payload.index)
      };

    case 'ATUALIZAR_QUANTIDADE':
      return {
        ...state,
        itens: state.itens.map((item, index) =>
          index === action.payload.index
            ? { ...item, quantidade: action.payload.quantidade }
            : item
        )
      };

    case 'LIMPAR_CARRINHO':
      return {
        ...state,
        itens: []
      };

    case 'DEFINIR_DADOS_ENTREGA':
      return {
        ...state,
        entrega: action.payload
      };

    case 'DEFINIR_DADOS_CLIENTE':
      return {
        ...state,
        cliente: action.payload
      };

    case 'DEFINIR_PAGAMENTO':
      return {
        ...state,
        pagamento: action.payload
      };

    default:
      return state;
  }
};

const estadoInicial = {
  itens: [],
  cliente: {
    nome: '',
    telefone: '',
    email: ''
  },
  entrega: {
    tipo: 'delivery', // 'delivery' ou 'retirada'
    endereco: '',
    taxa: 0
  },
  pagamento: {
    forma: 'dinheiro', // 'dinheiro', 'pix', 'cartao'
    observacoes: ''
  }
};

export const CarrinhoProvider = ({ children }) => {
  const [carrinho, dispatch] = useReducer(carrinhoReducer, estadoInicial);

  // Funções auxiliares
  const adicionarItem = (produto, extras = [], quantidade = 1, observacoes = '') => {
    dispatch({
      type: 'ADICIONAR_ITEM',
      payload: {
        produtoId: produto.id,
        nome: produto.nome,
        preco: produto.preco,
        quantidade,
        extras,
        observacoes,
        imagem: produto.imagem
      }
    });
  };

  const removerItem = (index) => {
    dispatch({
      type: 'REMOVER_ITEM',
      payload: { index }
    });
  };

  const atualizarQuantidade = (index, quantidade) => {
    if (quantidade <= 0) {
      removerItem(index);
    } else {
      dispatch({
        type: 'ATUALIZAR_QUANTIDADE',
        payload: { index, quantidade }
      });
    }
  };

  const limparCarrinho = () => {
    dispatch({ type: 'LIMPAR_CARRINHO' });
  };

  const definirDadosCliente = (dados) => {
    dispatch({
      type: 'DEFINIR_DADOS_CLIENTE',
      payload: dados
    });
  };

  const definirDadosEntrega = (dados) => {
    dispatch({
      type: 'DEFINIR_DADOS_ENTREGA',
      payload: dados
    });
  };

  const definirPagamento = (dados) => {
    dispatch({
      type: 'DEFINIR_PAGAMENTO',
      payload: dados
    });
  };

  // Calcular totais
  const calcularSubtotal = () => {
    return carrinho.itens.reduce((total, item) => {
      const precoExtras = item.extras?.reduce((sum, extra) => sum + extra.preco, 0) || 0;
      return total + ((item.preco + precoExtras) * item.quantidade);
    }, 0);
  };

  const calcularTotal = () => {
    return calcularSubtotal() + (carrinho.entrega?.taxa || 0);
  };

  const quantidadeItens = carrinho.itens.reduce((total, item) => total + item.quantidade, 0);

  const value = {
    carrinho,
    adicionarItem,
    removerItem,
    atualizarQuantidade,
    limparCarrinho,
    definirDadosCliente,
    definirDadosEntrega,
    definirPagamento,
    calcularSubtotal,
    calcularTotal,
    quantidadeItens
  };

  return (
    <CarrinhoContext.Provider value={value}>
      {children}
    </CarrinhoContext.Provider>
  );
};

export const useCarrinho = () => {
  const context = useContext(CarrinhoContext);
  
  if (!context) {
    throw new Error('useCarrinho deve ser usado dentro de um CarrinhoProvider');
  }
  
  return context;
};

export default CarrinhoProvider;