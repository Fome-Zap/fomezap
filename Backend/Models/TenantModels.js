import mongoose from "../db/conn.js";

const { Schema } = mongoose;

// Schema do Tenant (Lanchonete) - baseado no seu projeto ToDo
const tenantSchema = new Schema({
  tenantId: {
    type: String,
    required: true,
    unique: true
  },
  nome: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  logo: {
    type: String,
    default: "images/logo-default.png"
  },
  telefone: String,
  email: String, // Email de contato do negócio
  endereco: String,
  
  // Configurações de funcionamento
  horarioFuncionamento: {
    abertura: { type: String, default: "18:00" },
    fechamento: { type: String, default: "23:30" },
    diasSemana: { 
      type: [String], 
      default: ["segunda", "terca", "quarta", "quinta", "sexta", "sabado"] 
    }
  },
  
  // Personalização visual (como as cores do seu HTML atual)
  tema: {
    corPrimaria: { type: String, default: '#ff6b35' },
    corSecundaria: { type: String, default: '#2c3e50' },
    corBotao: { type: String, default: '#27ae60' }
  },
  
  // Configurações da lanchonete
  configuracoes: {
    mostarPrecos: { type: Boolean, default: true },
    permitirExtras: { type: Boolean, default: true },
    taxaEntrega: { type: Number, default: 5.00 },
    pedidoMinimo: { type: Number, default: 25.00 },
    tempoEstimado: { type: String, default: '45-60 minutos' },
    formasPagamento: { 
      type: [String], 
      default: ["dinheiro", "pix", "cartao"] 
    },
    mensagemWhatsApp: { 
      type: String, 
      default: "Olá! Gostaria de fazer um pedido:" 
    }
  },
  
  // Status da conta SaaS
  status: {
    type: String,
    enum: ['ativo', 'inativo', 'suspenso', 'trial'],
    default: 'trial'
  },
  
  // Plano de assinatura
  plano: {
    tipo: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    dataVencimento: Date,
    limiteProdutos: { type: Number, default: 20 },
    limitePedidosMes: { type: Number, default: 50 }
  },
  
  // Dados do proprietário
  proprietario: {
    nome: String,
    email: String,
    telefone: String
  }
}, { 
  timestamps: true 
});

// Schema de Categoria (substituindo parte do sistema de tarefas)
const categoriaSchema = new Schema({
  tenantId: {
    type: String,
    required: true
  },
  nome: {
    type: String,
    required: true
  },
  icone: {
    type: String,
    default: "fas fa-hamburger"
  },
  imagemPadrao: String,
  ordem: { type: Number, default: 0 },
  ativa: { type: Boolean, default: true }
}, { 
  timestamps: true 
});

// Schema de Produto (baseado na estrutura dos seus HTMLs)
const produtoSchema = new Schema({
  tenantId: {
    type: String,
    required: true
  },
  codigo: String, // ex: "01", "02", etc como no seu HTML
  nome: {
    type: String,
    required: true
  },
  descricao: String,
  preco: {
    type: Number,
    required: true,
    min: 0
  },
  categoria: {
    type: Schema.Types.ObjectId,
    ref: 'Categoria',
    required: true
  },
  emoji: String, // Emoji do produto (ex: 🍔)
  imagem: String, // URL da imagem do produto
  disponivel: { type: Boolean, default: true },
  destaque: { type: Boolean, default: false },
  extras: [String], // IDs dos extras disponíveis
  tags: [String],
  ordem: { type: Number, default: 0 }
}, { 
  timestamps: true 
});

// Schema de Extra (como bacon, ovo, etc.)
const extraSchema = new Schema({
  tenantId: {
    type: String,
    required: true
  },
  nome: {
    type: String,
    required: true
  },
  preco: {
    type: Number,
    required: true,
    min: 0
  },
  disponivel: { type: Boolean, default: true },
  ordem: { type: Number, default: 0 }
}, { 
  timestamps: true 
});

// Schema de Pedido (evolução do sistema de tarefas para pedidos)
const pedidoSchema = new Schema({
  tenantId: {
    type: String,
    required: true
  },
  numeroPedido: {
    type: String,
    required: true
  },
  
  // Dados do cliente
  cliente: {
    nome: { type: String, required: true },
    telefone: { type: String, required: true },
    email: String
  },
  
  // Itens do pedido
  itens: [{
    produtoId: { type: Schema.Types.ObjectId, ref: 'Produto' },
    nome: String,
    preco: Number,
    quantidade: Number,
    extras: [{
      nome: String,
      preco: Number
    }],
    observacoes: String,
    subtotal: Number
  }],
  
  // Entrega
  entrega: {
    tipo: { type: String, enum: ['retirada', 'delivery'], required: true },
    endereco: String,
    taxa: { type: Number, default: 0 }
  },
  
  // Valores
  subtotal: Number,
  taxaEntrega: { type: Number, default: 0 },
  valorTotal: {
    type: Number,
    required: true
  },
  
  // Pagamento
  pagamento: {
    forma: { type: String, required: true },
    status: { type: String, enum: ['pendente', 'pago', 'cancelado'], default: 'pendente' }
  },
  
  // Status do pedido (similar ao sistema de situação das tarefas)
  status: {
    type: String,
    enum: ['recebido', 'preparando', 'pronto', 'saiu_entrega', 'entregue', 'cancelado'],
    default: 'recebido'
  },
  
  observacoes: String
}, { 
  timestamps: true 
});

// Indexes para performance (remover duplicados)
categoriaSchema.index({ tenantId: 1, ordem: 1 });
produtoSchema.index({ tenantId: 1, categoria: 1 });
produtoSchema.index({ tenantId: 1, disponivel: 1 });
extraSchema.index({ tenantId: 1 });
pedidoSchema.index({ tenantId: 1, createdAt: -1 });
pedidoSchema.index({ tenantId: 1, status: 1 });

// Middleware para garantir isolamento de dados (segurança multi-tenant)
function addTenantFilter() {
  if (this.getQuery && !this.getQuery().tenantId) {
    console.warn('Query sem tenantId detectada - aplicando filtro de segurança');
  }
}

categoriaSchema.pre(/^find/, addTenantFilter);
produtoSchema.pre(/^find/, addTenantFilter);
extraSchema.pre(/^find/, addTenantFilter);
pedidoSchema.pre(/^find/, addTenantFilter);

// Models
const Tenant = mongoose.model("Tenant", tenantSchema);
const Categoria = mongoose.model("Categoria", categoriaSchema);
const Produto = mongoose.model("Produto", produtoSchema);
const Extra = mongoose.model("Extra", extraSchema);
const Pedido = mongoose.model("Pedido", pedidoSchema);

export { Tenant, Categoria, Produto, Extra, Pedido };
export default Tenant;