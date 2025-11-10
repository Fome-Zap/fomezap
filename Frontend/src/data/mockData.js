// Dados de exemplo para testar a interface
export const mockTenantData = {
  tenantId: 'demo',
  config: {
    restaurant: {
      nome: "Lanchonete em Família",
      descricao: "Deliciosos lanches artesanais",
      telefone: "(11) 99999-9999",
      endereco: "Rua das Flores, 123",
      logo: "/logo.png",
      horarioFuncionamento: {
        abertura: "18:00",
        fechamento: "23:00"
      }
    },
    categorias: [
      {
        id: "all",
        nome: "Todos",
        ativa: true
      },
      {
        id: "burgersfrench",
        nome: "Lanches Pão Francês",
        ativa: true
      },
      {
        id: "burgers",
        nome: "Lanches Pão de Hambúrguer",
        ativa: true
      },
      {
        id: "onplate",
        nome: "Lanches no Prato",
        ativa: true
      },
      {
        id: "beirutes",
        nome: "Beirutes",
        ativa: true
      },
      {
        id: "porcoes",
        nome: "Porções",
        ativa: true
      },
      {
        id: "juices",
        nome: "Sucos",
        ativa: true
      },
      {
        id: "refribeers",
        nome: "Refrigerantes e Cervejas",
        ativa: true
      }
    ],
    produtos: [
      {
        id: "1",
        nome: "01 - À MODA DA CASA",
        descricao: "Lombo, contra filé, filé de frango, alface, tomate, 2 ovos, presunto, queijo, requeijão e cebola.",
        preco: 64.00,
        categoria: "burgersfrench",
        imagem: "images/paofrances.png",
        disponivel: true,
        extras: []
      },
      {
        id: "2", 
        nome: "02 - AMERICANO",
        descricao: "Contra filé, alface, tomate, ovo, presunto, queijo, requeijão e cebola.",
        preco: 55.00,
        categoria: "burgersfrench",
        imagem: "images/paofrances.png",
        disponivel: true,
        extras: []
      },
      {
        id: "3",
        nome: "03 - BAURU DE VACA",
        descricao: "Contra filé, tomate e queijo.",
        preco: 45.00,
        categoria: "burgersfrench",
        imagem: "images/paofrances.png",
        disponivel: true,
        extras: []
      },
      {
        id: "4",
        nome: "50 - HAMBÚRGUER PICANHA",
        descricao: "Hambúrguer de picanha, vinagrete, alface, queijo, batata palha, maionese, catchup e mostarda.",
        preco: 23.00,
        categoria: "burgers", 
        imagem: "images/paohamburg.png",
        disponivel: true,
        temExtras: true
      },
      {
        id: "5",
        nome: "51 - HAMBÚRGUER",
        descricao: "Carne de hambúrguer, vinagrete, alface, queijo, batata palha, maionese, catchup e mostarda.",
        preco: 15.00,
        categoria: "burgers",
        imagem: "images/paohamburg.png", 
        disponivel: true,
        extras: []
      },
      {
        id: "6",
        nome: "100 - À MODA DA CASA",
        descricao: "Lombo, contra filé, filé de frango, 2 ovos, presunto, queijo, requeijão, tomate, cebola e alface.",
        preco: 70.00,
        categoria: "onplate",
        imagem: "images/lancheprato.jpg", 
        disponivel: true,
        extras: []
      },
      {
        id: "7",
        nome: "120 - BEIRUTE DE PRESUNTO E QUEIJO",
        descricao: "Presunto, queijo, tomate e alface.",
        preco: 36.00,
        categoria: "beirutes",
        imagem: "images/beirute.jpg", 
        disponivel: true,
        temExtras: true
      },
      {
        id: "8",
        nome: "150 - BATATA PALITO",
        descricao: "",
        preco: 26.00,
        categoria: "porcoes",
        imagem: "images/porcoes.png", 
        disponivel: true,
        extras: []
      }
    ],
    extras: {
      "bacon": { nome: "Bacon Extra", preco: 3.50 },
      "queijo": { nome: "Queijo Extra", preco: 2.50 },
      "ovo": { nome: "Ovo", preco: 2.00 },
      "batata": { nome: "Batata Frita", preco: 8.00 },
      "granola": { nome: "Granola", preco: 2.00 },
      "banana": { nome: "Banana", preco: 1.50 },
      "leite-condensado": { nome: "Leite Condensado", preco: 1.00 }
    }
  }
};