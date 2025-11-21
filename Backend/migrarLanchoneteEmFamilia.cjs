/**
 * Script de Migração - Lanchonete em Família
 * Extrai dados do HTML hardcoded e popula o banco MongoDB do tenant 'familia'
 * 
 * Tenant ID: 691f97b15cd208a3e3c1b836
 * Slug: familia
 * Domínio: familia.fomezap.com
 */

const mongoose = require('mongoose');
require('dotenv').config();

// ===== CONEXÃO COM BANCO =====
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/FomeZap';

console.log('🔗 Tentando conectar ao MongoDB...');
console.log('📍 URI:', MONGODB_URI.replace(/:([^:@]+)@/, ':****@')); // Oculta senha

// ===== MODELS (USANDO MESMA ESTRUTURA DO SISTEMA) =====
const categoriaSchema = new mongoose.Schema({
  tenantId: { type: String, required: true }, // String, não ObjectId!
  nome: { type: String, required: true },
  icone: { type: String, default: 'fas fa-hamburger' },
  imagemPadrao: String,
  ordem: { type: Number, default: 0 },
  ativa: { type: Boolean, default: true }
}, { timestamps: true });

const extraSchema = new mongoose.Schema({
  tenantId: { type: String, required: true }, // String, não ObjectId!
  nome: { type: String, required: true },
  preco: { type: Number, required: true, min: 0 },
  disponivel: { type: Boolean, default: true }
}, { timestamps: true });

const produtoSchema = new mongoose.Schema({
  tenantId: { type: String, required: true }, // String, não ObjectId!
  codigo: String,
  nome: { type: String, required: true },
  descricao: String,
  preco: { type: Number, required: true, min: 0 },
  categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', required: true },
  emoji: String,
  imagem: String,
  disponivel: { type: Boolean, default: true },
  destaque: { type: Boolean, default: false },
  extras: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Extra' }],
  ordem: { type: Number, default: 0 },
  tags: [String]
}, { timestamps: true });

// Adicionar indexes para performance
categoriaSchema.index({ tenantId: 1, ordem: 1 });
produtoSchema.index({ tenantId: 1, categoria: 1 });
produtoSchema.index({ tenantId: 1, disponivel: 1 });
extraSchema.index({ tenantId: 1 });

const Categoria = mongoose.model('Categoria', categoriaSchema);
const Extra = mongoose.model('Extra', extraSchema);
const Produto = mongoose.model('Produto', produtoSchema);

// ===== TENANT ID (String, não ObjectId) =====
const TENANT_ID = '691f97b15cd208a3e3c1b836';

// ===== DADOS EXTRAÍDOS DO MIGRACAO-FAMILIA.MD =====

// 1. CATEGORIAS
const categorias = [
  { nome: 'Lanches no Pão Francês', icone: '🥖', ordem: 1 },
  { nome: 'Lanches no Pão de Hambúrguer', icone: '🍔', ordem: 2 },
  { nome: 'Lanches no Prato', icone: '🍽️', ordem: 3 },
  { nome: 'Beirutes', icone: '🌯', ordem: 4 },
  { nome: 'Porções', icone: '🍟', ordem: 5 },
  { nome: 'Sucos', icone: '🧃', ordem: 6 },
  { nome: 'Refrigerantes e Cervejas', icone: '🥤', ordem: 7 }
];

// 2. EXTRAS PARA LANCHES PÃO FRANCÊS, LANCHES PÃO DE HAMBURGER E LANCHES NO PRATO
const extrasGerais = [
  { nome: 'AZEITONAS', preco: 4.00 },
  { nome: 'CALABRESA', preco: 8.00 },
  { nome: 'CARNE HAMBÚRGUER', preco: 6.00 },
  { nome: 'MILHO VERDE', preco: 3.00 },
  { nome: 'OVO', preco: 3.00 },
  { nome: 'PRESUNTO', preco: 7.00 },
  { nome: 'QUEIJO', preco: 10.00 },
  { nome: 'REQUEIJÃO', preco: 10.00 },
  { nome: 'SALSICHA', preco: 4.00 },
  { nome: 'BACON', preco: 10.00 },
  { nome: 'CREAM CHEESE', preco: 12.00 },
  { nome: 'CHEDDAR', preco: 10.00 },
  { nome: 'RÚCULA', preco: 3.00 },
  { nome: 'CEBOLA', preco: 3.00 },
  { nome: 'TOMATE SECO', preco: 10.00 },
  { nome: 'BATATA PALHA', preco: 4.00 },
  { nome: 'SACHÊ DE ALHO', preco: 1.00 }
];

// 3. EXTRAS ESPECÍFICOS PARA BEIRUTES (preços diferentes)
const extrasBeirute = [
  { nome: 'BACON (BEIRUTE)', preco: 14.00 },
  { nome: 'OVO (BEIRUTE)', preco: 7.00 },
  { nome: 'REQUEIJÃO (BEIRUTE)', preco: 14.00 }
];

// 4. PRODUTOS (extraídos do MIGRACAO-FAMILIA.MD com códigos, nomes, descrições e preços corretos)

const produtos = {
  // ===== LANCHES NO PÃO FRANCÊS (códigos 01-29) =====
  paoFrances: [
    { codigo: '01', nome: 'À MODA DA CASA', descricao: 'Lombo, contra filé, filé de frango, alface, tomate, 2 ovos, presunto, queijo, requeijão, cebola', preco: 64.00, emoji: '🥪' },
    { codigo: '02', nome: 'AMERICANO', descricao: 'Contra filé, alface, tomate, ovo, presunto, queijo, requeijão, cebola', preco: 55.00, emoji: '🥪' },
    { codigo: '03', nome: 'BAURU DE VACA', descricao: 'Contra filé, tomate, queijo', preco: 45.00, emoji: '🥪' },
    { codigo: '04', nome: 'BAURU DE LOMBO', descricao: 'Lombo, tomate, queijo', preco: 40.00, emoji: '🥪' },
    { codigo: '05', nome: 'BAURU DE FRANGO', descricao: 'Filé de Frango, tomate, queijo', preco: 40.00, emoji: '🥪' },
    { codigo: '06', nome: 'ESPECIAL', descricao: 'Contra filé, tomate, presunto, ovo, bacon, queijo, requeijão, alface', preco: 60.00, emoji: '🥪' },
    { codigo: '07', nome: 'ESPECIAL DE LOMBO', descricao: 'Lombo, tomate, presunto, ovo, bacon, queijo, requeijão, alface', preco: 55.00, emoji: '🥪' },
    { codigo: '08', nome: 'ESPECIAL DE FRANGO', descricao: 'Filé de frango, tomate, presunto, ovo, bacon, queijo, requeijão, alface', preco: 55.00, emoji: '🥪' },
    { codigo: '09', nome: 'MISTO QUENTE', descricao: 'Queijo, tomate e presunto', preco: 28.00, emoji: '🥪' },
    { codigo: '10', nome: 'HAMBURGÃO', descricao: '2 carnes de hambúrguer, vinagrete, alface, queijo, presunto, batata palha, bacon, maionese, catchup, mostarda', preco: 40.00, emoji: '🍔' },
    { codigo: '11', nome: 'X-CALABRESA', descricao: 'Calabresa, 2 carnes de hambúrguer, tomate, queijo, presunto, maionese, catchup, mostarda', preco: 36.00, emoji: '🍔' },
    { codigo: '12', nome: 'X-TUDO', descricao: '2 carnes de hambúrguer, vinagrete, alface, queijo, presunto, ovo, bacon, salsicha, maionese, catchup, mostarda', preco: 42.00, emoji: '🍔' },
    { codigo: '13', nome: 'X-BACON', descricao: '2 carnes de hambúrguer, vinagrete, alface, queijo, presunto, bacon, maionese, catchup, mostarda', preco: 38.00, emoji: '🍔' },
    { codigo: '14', nome: 'X-SALADA', descricao: '2 carnes de hambúrguer, vinagrete, alface, queijo, presunto, maionese, catchup, mostarda', preco: 30.00, emoji: '🍔' },
    { codigo: '15', nome: 'X-BACON EGG', descricao: '2 carnes de hambúrguer, vinagrete, alface, queijo, bacon, ovo, maionese, catchup, mostarda', preco: 38.00, emoji: '🍔' },
    { codigo: '16', nome: 'HAMBÚRGUER DUPLO', descricao: '2 carnes de hambúrguer, vinagrete, batata palha, alface, queijo, maionese, catchup, mostarda', preco: 25.00, emoji: '🍔' },
    { codigo: '17', nome: 'X-BÚRGUER', descricao: '2 carnes de hambúrguer, vinagrete, alface, queijo, maionese, catchup, mostarda', preco: 26.00, emoji: '🍔' },
    { codigo: '18', nome: 'X-AZEITONADO', descricao: '2 carnes de hambúrguer, vinagrete, alface, queijo, azeitonas, milho, maionese, catchup, mostarda', preco: 33.00, emoji: '🍔' },
    { codigo: '19', nome: 'HOT DOG', descricao: '3 salsichas, vinagrete, alface, batata palha, maionese, catchup, mostarda', preco: 25.00, emoji: '🌭' },
    { codigo: '20', nome: 'X-RÚCULA', descricao: 'Contra filé ou frango ou lombo, rúcula, tomate seco e queijo', preco: 52.00, emoji: '🥪' },
    { codigo: '21', nome: 'BAURU PIZZA', descricao: 'Queijo, presunto, tomate, azeitona e orégano', preco: 33.00, emoji: '🍕' },
    { codigo: '22', nome: 'CALABRESÃO', descricao: 'Calabresa, queijo, tomate e orégano', preco: 30.00, emoji: '🌭' },
    { codigo: '23', nome: 'MISTO ESPECIAL', descricao: 'Presunto, queijo, tomate, bacon e ovo', preco: 36.00, emoji: '🥪' },
    { codigo: '24', nome: 'X-EGG', descricao: '2 carnes de hambúrguer, ovo, vinagrete, alface, queijo, maionese, catchup, mostarda', preco: 30.00, emoji: '🍔' },
    { codigo: '25', nome: 'FRANGO CHEESE', descricao: 'Frango, alface, tomate, cream cheese', preco: 44.00, emoji: '🍔' },
    { codigo: '26', nome: 'X-LINGUIÇA', descricao: 'Hambúrguer de linguiça, queijo, tomate, rúcula', preco: 33.00, emoji: '🌭' },
    { codigo: '27', nome: 'SUPER DOG', descricao: '2 carnes de hambúrguer, salsicha, presunto, queijo, vinagrete, alface, batata, maionese, mostarda, catchup', preco: 33.00, emoji: '🌭' },
    { codigo: '28', nome: 'HAMBÚRGUER REQUEIJÃO', descricao: '2 carnes de hambúrguer, requeijão, vinagrete, alface, maionese, catchup, mostarda', preco: 33.00, emoji: '🍔' },
    { codigo: '29', nome: 'HAMBÚRGUER PICANHA', descricao: '2 carnes de hambúrguer de picanha, vinagrete, alface, queijo, batata palha, maionese, catchup, mostarda', preco: 35.00, emoji: '🍔' }
  ],

  // ===== LANCHES NO PÃO DE HAMBÚRGUER (códigos 50-69) =====
  paoHamburguer: [
    { codigo: '50', nome: 'HAMBÚRGUER PICANHA', descricao: 'Hambúrguer de picanha, vinagrete, alface, queijo, batata palha, maionese, catchup, mostarda', preco: 23.00, emoji: '🍔' },
    { codigo: '51', nome: 'HAMBÚRGUER', descricao: 'Carne de hambúrguer, vinagrete, alface, queijo, batata palha, maionese, catchup, mostarda', preco: 15.00, emoji: '🍔' },
    { codigo: '52', nome: 'HAMBÚRGUER DUPLO', descricao: '2 Carnes de hambúrguer, vinagrete, batata palha, alface, queijo, maionese, catchup, mostarda', preco: 19.00, emoji: '🍔' },
    { codigo: '53', nome: 'X-BÚRGUER', descricao: 'Carne de hambúrguer, vinagrete, alface, queijo, maionese, catchup, mostarda', preco: 17.00, emoji: '🍔' },
    { codigo: '54', nome: 'X-EGG', descricao: 'Carne de hambúrguer, ovo, vinagrete, alface, queijo, maionese, catchup, mostarda', preco: 20.00, emoji: '🍔' },
    { codigo: '55', nome: 'X-BACON EGG', descricao: 'Carne de hambúrguer, vinagrete, alface, queijo, bacon, ovo, maionese, catchup, mostarda', preco: 30.00, emoji: '🍔' },
    { codigo: '56', nome: 'X-BACON', descricao: 'Carne de hambúrguer, vinagrete, alface, queijo, presunto, bacon, maionese, catchup, mostarda', preco: 30.00, emoji: '🍔' },
    { codigo: '57', nome: 'X-SALADA', descricao: 'Carne de hambúrguer, vinagrete, alface, queijo, presunto, maionese, catchup, mostarda', preco: 22.00, emoji: '🍔' },
    { codigo: '58', nome: 'X-TUDO', descricao: 'Carne de hambúrguer, vinagrete, alface, queijo, presunto, ovo, bacon, salsicha, maionese, catchup, mostarda', preco: 33.00, emoji: '🍔' },
    { codigo: '59', nome: 'HOT DOG', descricao: '2 salsichas, vinagrete, alface, batata palha, maionese, catchup, mostarda', preco: 15.00, emoji: '🌭' },
    { codigo: '60', nome: 'X-AZEITONADO', descricao: 'Carne de hambúrguer, vinagrete, alface, queijo, azeitonas, milho, maionese, catchup, mostarda', preco: 23.00, emoji: '🍔' },
    { codigo: '61', nome: 'HAMBÚRGUER REQUEIJÃO', descricao: 'Carne de hambúrguer, requeijão, vinagrete, alface, maionese, catchup, mostarda', preco: 23.00, emoji: '🍔' },
    { codigo: '62', nome: 'HAMBÚRGUER CALABRESA', descricao: 'Carne de hambúrguer, calabresa, queijo, vinagrete, alface, maionese, catchup, mostarda', preco: 22.00, emoji: '🍔' },
    { codigo: '63', nome: 'HAMBÚRGUER BACON', descricao: 'Carne de hambúrguer, bacon, milho, vinagrete, alface, maionese, catchup, mostarda', preco: 25.00, emoji: '🍔' },
    { codigo: '64', nome: 'HAMBÚRGUER SIMPLES', descricao: 'Carne de hambúrguer e queijo', preco: 13.00, emoji: '🍔' },
    { codigo: '65', nome: 'HAMBÚRGUER MIRIM', descricao: 'Carne de hambúrguer, queijo, tomate, batata palha, alface, maionese, catchup (acompanha refri pequeno e fritas)', preco: 23.00, emoji: '🍔' },
    { codigo: '66', nome: 'FRANGO CHEESE', descricao: 'Frango, alface, tomate, cream cheese', preco: 33.00, emoji: '🍔' },
    { codigo: '67', nome: 'MISTO QUENTE', descricao: 'Queijo, tomate e presunto', preco: 21.00, emoji: '🥪' },
    { codigo: '68', nome: 'HAMBÚRGUER CHEDDAR', descricao: 'Carne de hambúrguer, cheddar, tomate, alface, maionese, catchup, mostarda', preco: 23.00, emoji: '🍔' },
    { codigo: '69', nome: 'HAMBÚRGUER DE LINGUIÇA', descricao: 'Hambúrguer de linguiça, queijo, rúcula, vinagrete', preco: 25.00, emoji: '🌭' }
  ],

  // ===== LANCHES NO PRATO (códigos 100-104) =====
  noPrato: [
    { codigo: '100', nome: 'À MODA DA CASA', descricao: 'Lombo, contra filé, filé de frango, 2 ovos, presunto, queijo, requeijão, tomate, cebola, alface', preco: 70.00, emoji: '🍽️' },
    { codigo: '101', nome: 'AMERICANO', descricao: 'Contra filé, tomate, alface, ovo, queijo, presunto, requeijão, cebola', preco: 65.00, emoji: '🍽️' },
    { codigo: '102', nome: 'LOMBO', descricao: 'Lombo, bacon, ovo, presunto, queijo, tomate, alface, requeijão', preco: 60.00, emoji: '🍽️' },
    { codigo: '103', nome: 'CONTRA FILÉ', descricao: 'Contra filé, bacon, ovo, presunto, queijo, tomate, alface, requeijão', preco: 66.00, emoji: '🍽️' },
    { codigo: '104', nome: 'FILÉ DE FRANGO', descricao: 'Filé de frango, bacon, ovo, presunto, queijo, tomate, alface, requeijão', preco: 60.00, emoji: '🍽️' }
  ],

  // ===== BEIRUTES (códigos 120-123) =====
  beirutes: [
    { codigo: '120', nome: 'BEIRUTE DE PRESUNTO E QUEIJO', descricao: 'Presunto, queijo, tomate, alface', preco: 36.00, emoji: '🌯' },
    { codigo: '121', nome: 'BEIRUTE DE CONTRA FILÉ', descricao: 'Contra filé, tomate, queijo, alface', preco: 52.00, emoji: '🌯' },
    { codigo: '122', nome: 'BEIRUTE DE LOMBO', descricao: 'Lombo, queijo, tomate, alface', preco: 46.00, emoji: '🌯' },
    { codigo: '123', nome: 'BEIRUTE DE FRANGO', descricao: 'Filé de frango, tomate, queijo, alface', preco: 46.00, emoji: '🌯' }
  ],

  // ===== PORÇÕES (códigos 150-158) =====
  porcoes: [
    { codigo: '150', nome: 'BATATA PALITO', descricao: 'Porção de batata frita palito', preco: 26.00, emoji: '🍟' },
    { codigo: '151', nome: 'BATATA PALITO C/ BACON', descricao: 'Porção de batata frita com bacon', preco: 35.00, emoji: '🍟' },
    { codigo: '152', nome: 'POLENTA FRITA', descricao: 'Porção de polenta frita', preco: 28.00, emoji: '🟡' },
    { codigo: '153', nome: 'LOMBO CHAPEADO', descricao: 'Lombo grelhado', preco: 55.00, emoji: '🥩' },
    { codigo: '154', nome: 'FILÉ DE FRANGO CHAPEADO', descricao: 'Filé de frango grelhado', preco: 50.00, emoji: '🍗' },
    { codigo: '155', nome: 'CONTRA FILÉ CHAPEADO', descricao: 'Contra filé grelhado', preco: 65.00, emoji: '🥩' },
    { codigo: '156', nome: 'CALABRESA CHAPEADA', descricao: 'Calabresa grelhada', preco: 48.00, emoji: '🌭' },
    { codigo: '157', nome: 'MANDIOCA', descricao: 'Porção de mandioca frita', preco: 28.00, emoji: '🍠' },
    { codigo: '158', nome: 'BATATA PALITO C/ QUEIJO/BACON', descricao: 'Porção de batata frita com queijo e bacon', preco: 42.00, emoji: '🍟' }
  ],

  // ===== SUCOS (sem código) =====
  sucos: [
    { codigo: '', nome: 'ABACAXI (COPO)', descricao: 'Suco de abacaxi', preco: 9.00, emoji: '🍍' },
    { codigo: '', nome: 'ABACAXI COM HORTELÃ (COPO)', descricao: 'Suco de abacaxi com hortelã', preco: 9.00, emoji: '🍍' },
    { codigo: '', nome: 'MARACUJÁ (COPO)', descricao: 'Suco de maracujá', preco: 9.00, emoji: '🥭' },
    { codigo: '', nome: 'ABACAXI (JARRA 1L)', descricao: 'Suco natural de abacaxi (750ml)', preco: 16.00, emoji: '🍍' },
    { codigo: '', nome: 'ABACAXI COM HORTELÃ (JARRA 1L)', descricao: 'Suco natural de abacaxi com hortelã (750ml)', preco: 16.00, emoji: '🍍' },
    { codigo: '', nome: 'MARACUJÁ (JARRA 1L)', descricao: 'Suco natural de maracujá (750ml)', preco: 16.00, emoji: '🥭' }
  ],

  // ===== REFRIGERANTES E CERVEJAS (sem código) =====
  refriCervejas: [
    { codigo: '', nome: 'COCA COLA 1 LITRO', descricao: 'Refrigerante Coca Cola 1L', preco: 9.00, emoji: '🥤' },
    { codigo: '', nome: 'COCA COLA 2 LITROS', descricao: 'Refrigerante Coca Cola 2L', preco: 14.00, emoji: '🥤' },
    { codigo: '', nome: 'REFRIGERANTE XV - 1 LITRO', descricao: 'Refrigerante XV 1L', preco: 6.50, emoji: '🥤' },
    { codigo: '', nome: 'REFRIGERANTE XV - 2 LITROS', descricao: 'Refrigerante XV 2L', preco: 8.50, emoji: '🥤' },
    { codigo: '', nome: 'REFRIGERANTE LATA', descricao: 'Refrigerante lata 350ml', preco: 6.00, emoji: '🥤' },
    { codigo: '', nome: 'ÁGUA SEM GÁS', descricao: 'Água mineral sem gás', preco: 3.00, emoji: '💧' },
    { codigo: '', nome: 'ÁGUA COM GÁS', descricao: 'Água mineral com gás', preco: 3.50, emoji: '💧' }
  ]
};

// ===== FUNÇÃO PRINCIPAL DE MIGRAÇÃO =====
async function migrarDados() {
  try {
    console.log('🔄 Conectando ao MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB com sucesso!\n');
    console.log('📊 Banco:', mongoose.connection.name);
    console.log('🏪 Tenant ID:', TENANT_ID, '\n');

    // Limpar dados anteriores do tenant
    console.log('🗑️  Limpando dados anteriores do tenant familia...');
    const deletedProdutos = await Produto.deleteMany({ tenantId: TENANT_ID });
    const deletedExtras = await Extra.deleteMany({ tenantId: TENANT_ID });
    const deletedCategorias = await Categoria.deleteMany({ tenantId: TENANT_ID });
    console.log(`   ✓ Produtos removidos: ${deletedProdutos.deletedCount}`);
    console.log(`   ✓ Extras removidos: ${deletedExtras.deletedCount}`);
    console.log(`   ✓ Categorias removidas: ${deletedCategorias.deletedCount}`);
    console.log('✅ Limpeza concluída\n');

    // 1. Criar Categorias
    console.log('📂 Criando categorias...');
    const categoriasMap = {};
    for (const cat of categorias) {
      const categoria = await Categoria.create({
        tenantId: TENANT_ID,
        ...cat
      });
      categoriasMap[cat.nome] = categoria._id;
      console.log(`   ✓ ${cat.icone} ${cat.nome}`);
    }
    console.log(`✅ ${categorias.length} categorias criadas\n`);

    // 2. Criar Extras Gerais (para lanches)
    console.log('🍔 Criando extras gerais (lanches)...');
    const extrasGeraisIds = [];
    for (const extra of extrasGerais) {
      const extraDoc = await Extra.create({
        tenantId: TENANT_ID,
        ...extra
      });
      extrasGeraisIds.push(extraDoc._id);
      console.log(`   ✓ ${extra.nome} - R$ ${extra.preco.toFixed(2)}`);
    }
    console.log(`✅ ${extrasGerais.length} extras gerais criados\n`);

    // 3. Criar Extras Específicos para Beirute
    console.log('🌯 Criando extras específicos para beirute...');
    const extrasBeiruteIds = [];
    for (const extra of extrasBeirute) {
      const extraDoc = await Extra.create({
        tenantId: TENANT_ID,
        ...extra
      });
      extrasBeiruteIds.push(extraDoc._id);
      console.log(`   ✓ ${extra.nome} - R$ ${extra.preco.toFixed(2)}`);
    }
    console.log(`✅ ${extrasBeirute.length} extras de beirute criados\n`);

    // 4. Criar Produtos
    console.log('🍽️  Criando produtos...');
    let totalProdutos = 0;

    // Mapeamento categoria -> produtos
    const categoriaProdutos = {
      'Lanches no Pão Francês': produtos.paoFrances,
      'Lanches no Pão de Hambúrguer': produtos.paoHamburguer,
      'Lanches no Prato': produtos.noPrato,
      'Beirutes': produtos.beirutes,
      'Porções': produtos.porcoes,
      'Sucos': produtos.sucos,
      'Refrigerantes e Cervejas': produtos.refriCervejas
    };

    for (const [nomeCategoria, listaProdutos] of Object.entries(categoriaProdutos)) {
      console.log(`\n   📁 ${nomeCategoria}:`);
      const categoriaId = categoriasMap[nomeCategoria];

      for (let i = 0; i < listaProdutos.length; i++) {
        const prod = listaProdutos[i];

        // Seleciona os extras corretos por categoria
        let extrasIds = [];
        if ([
          'Lanches no Pão Francês',
          'Lanches no Pão de Hambúrguer',
          'Lanches no Prato'
        ].includes(nomeCategoria)) {
          extrasIds = extrasGeraisIds;
        } else if (nomeCategoria === 'Beirutes') {
          extrasIds = extrasBeiruteIds;
        } else {
          extrasIds = [];
        }

        const produto = await Produto.create({
          tenantId: TENANT_ID,
          codigo: prod.codigo || undefined, // Não incluir código se vazio
          nome: prod.nome,
          descricao: prod.descricao,
          preco: prod.preco,
          categoria: categoriaId,
          emoji: prod.emoji,
          extras: extrasIds, // Apenas os extras corretos
          disponivel: true,
          ordem: i
        });

        const codigoDisplay = prod.codigo ? `#${prod.codigo} ` : '';
        console.log(`      ✓ ${codigoDisplay}${prod.emoji} ${prod.nome} - R$ ${prod.preco.toFixed(2)}`);
        totalProdutos++;
      }
    }

    console.log(`\n✅ ${totalProdutos} produtos criados\n`);

    // Validação final - contar documentos no banco
    console.log('🔍 Validando dados inseridos...');
    const totalCategoriasDB = await Categoria.countDocuments({ tenantId: TENANT_ID });
    const totalExtrasDB = await Extra.countDocuments({ tenantId: TENANT_ID });
    const totalProdutosDB = await Produto.countDocuments({ tenantId: TENANT_ID });
    
    console.log(`   ✓ Categorias no banco: ${totalCategoriasDB}`);
    console.log(`   ✓ Extras no banco: ${totalExtrasDB}`);
    console.log(`   ✓ Produtos no banco: ${totalProdutosDB}`);

    // Resumo final
    console.log('\n═══════════════════════════════════════');
    console.log('✨ MIGRAÇÃO CONCLUÍDA COM SUCESSO! ✨');
    console.log('═══════════════════════════════════════');
    console.log(`📂 Categorias: ${categorias.length}`);
    console.log(`🍔 Extras Gerais (Lanches): ${extrasGerais.length}`);
    console.log(`🌯 Extras Beirute: ${extrasBeirute.length}`);
    console.log(`🍽️  Produtos: ${totalProdutos}`);
    console.log(`🏪 Tenant: Lanchonete em Família (${TENANT_ID})`);
    console.log(`💾 Banco: ${mongoose.connection.name}`);
    console.log('═══════════════════════════════════════\n');

    console.log('🎉 Acesse o painel admin em: http://localhost:5173/login');
    console.log('📱 Ou o cardápio em: http://localhost:5173/?tenant=familia');
    console.log('🌐 Produção: https://familia.fomezap.com/\n');

  } catch (error) {
    console.error('❌ Erro na migração:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Conexão com MongoDB encerrada');
  }
}

// Executar migração
if (require.main === module) {
  migrarDados()
    .then(() => {
      console.log('\n✅ Script finalizado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { migrarDados };
