// Super Admin - Backend API para gerenciar tenants
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import argon2 from 'argon2';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ===================================
// CONEXÃO MONGODB
// ===================================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/FomeZap';

console.log('🔗 Conectando ao MongoDB...');
console.log('📍 URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado ao MongoDB!');
    console.log('📊 Database:', mongoose.connection.name);
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar MongoDB:', err);
    process.exit(1);
  });

// ===================================
// SCHEMAS (importar do projeto principal)
// ===================================
const tenantSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, unique: true },
  publicId: Number,
  nome: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  logo: String,
  telefone: String,
  email: String,
  endereco: String,
  horarioFuncionamento: {
    segunda: { abre: String, fecha: String },
    terca: { abre: String, fecha: String },
    quarta: { abre: String, fecha: String },
    quinta: { abre: String, fecha: String },
    sexta: { abre: String, fecha: String },
    sabado: { abre: String, fecha: String },
    domingo: { abre: String, fecha: String }
  },
  tema: {
    corPrimaria: { type: String, default: '#FF6B35' },
    corSecundaria: { type: String, default: '#004E89' }
  },
  configuracoes: {
    taxaEntrega: { type: Number, default: 0 },
    pedidoMinimo: { type: Number, default: 0 },
    aceitaPix: { type: Boolean, default: true },
    aceitaDinheiro: { type: Boolean, default: true },
    aceitaCartao: { type: Boolean, default: true }
  },
  status: {
    type: String,
    enum: ['ativo', 'inativo', 'trial', 'suspenso'],
    default: 'ativo'
  },
  plano: {
    tipo: { type: String, enum: ['free', 'basic', 'premium', 'enterprise'], default: 'free' },
    dataInicio: Date,
    dataVencimento: Date
  },
  proprietario: {
    nome: String,
    email: String,
    telefone: String
  }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  nome: { type: String, required: true },
  email: { type: String, required: true },
  senha: { type: String, required: true },
  role: {
    type: String,
    enum: ['super_admin', 'tenant_admin', 'employee'],
    default: 'employee'
  },
  ativo: { type: Boolean, default: true }
}, { timestamps: true });

// Hash de senha antes de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) return next();
  this.senha = await argon2.hash(this.senha);
  next();
});

const categoriaSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  nome: { type: String, required: true },
  icone: String,
  ordem: { type: Number, default: 0 },
  ativo: { type: Boolean, default: true }
}, { timestamps: true });

const produtoSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', required: true },
  nome: { type: String, required: true },
  descricao: String,
  preco: { type: Number, required: true },
  emoji: String,
  imagem: String,
  disponivel: { type: Boolean, default: true },
  destaque: { type: Boolean, default: false }
}, { timestamps: true });

const Tenant = mongoose.model('Tenant', tenantSchema);
const User = mongoose.model('User', userSchema);
const Categoria = mongoose.model('Categoria', categoriaSchema);
const Produto = mongoose.model('Produto', produtoSchema);

// ===================================
// UTILITÁRIOS
// ===================================
function gerarSlug(nome) {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function gerarTenantId() {
  return new mongoose.Types.ObjectId().toString();
}

// ===================================
// ROTAS DA API
// ===================================

// Listar todos os tenants
app.get('/api/tenants', async (req, res) => {
  try {
    const tenants = await Tenant.find().sort({ createdAt: -1 }).lean();
    
    // Adicionar estatísticas para cada tenant
    const tenantsComStats = await Promise.all(
      tenants.map(async (tenant) => {
        const [totalCategorias, totalProdutos, totalUsuarios] = await Promise.all([
          Categoria.countDocuments({ tenantId: tenant.tenantId }),
          Produto.countDocuments({ tenantId: tenant.tenantId }),
          User.countDocuments({ tenantId: tenant.tenantId })
        ]);
        
        return {
          ...tenant,
          stats: {
            categorias: totalCategorias,
            produtos: totalProdutos,
            usuarios: totalUsuarios
          }
        };
      })
    );
    
    res.json(tenantsComStats);
  } catch (error) {
    console.error('Erro ao listar tenants:', error);
    res.status(500).json({ error: 'Erro ao buscar tenants' });
  }
});

// Buscar tenant por ID
app.get('/api/tenants/:id', async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ tenantId: req.params.id });
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant não encontrado' });
    }
    
    // Buscar estatísticas
    const [categorias, produtos, usuarios] = await Promise.all([
      Categoria.countDocuments({ tenantId: tenant.tenantId }),
      Produto.countDocuments({ tenantId: tenant.tenantId }),
      User.countDocuments({ tenantId: tenant.tenantId })
    ]);
    
    res.json({
      ...tenant.toObject(),
      stats: { categorias, produtos, usuarios }
    });
  } catch (error) {
    console.error('Erro ao buscar tenant:', error);
    res.status(500).json({ error: 'Erro ao buscar tenant' });
  }
});

// Criar novo tenant
app.post('/api/tenants', async (req, res) => {
  try {
    const { nome, telefone, email, endereco, criarAdmin, emailAdmin, senhaAdmin } = req.body;
    
    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }
    
    // Gerar IDs
    const tenantId = gerarTenantId();
    let slug = gerarSlug(nome);
    
    // Verificar se slug já existe
    let slugExiste = await Tenant.findOne({ slug });
    let contador = 1;
    while (slugExiste) {
      slug = `${gerarSlug(nome)}-${contador}`;
      slugExiste = await Tenant.findOne({ slug });
      contador++;
    }
    
    // Criar tenant
    const novoTenant = await Tenant.create({
      tenantId,
      slug,
      nome,
      telefone: telefone || '',
      email: email || '',
      endereco: endereco || '',
      status: 'ativo',
      logo: 'images/logo-default.png',
      plano: {
        tipo: 'trial',
        dataInicio: new Date(),
        dataVencimento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 dias
      },
      proprietario: {
        nome: nome,
        email: email,
        telefone: telefone
      }
    });
    
    // Criar categorias padrão
    const categoriasDefault = [
      { nome: 'Lanches', icone: '🍔', ordem: 1 },
      { nome: 'Bebidas', icone: '🥤', ordem: 2 },
      { nome: 'Sobremesas', icone: '🍰', ordem: 3 }
    ];
    
    await Categoria.insertMany(
      categoriasDefault.map(cat => ({
        ...cat,
        tenantId,
        ativo: true
      }))
    );
    
    // Criar usuário admin se solicitado
    if (criarAdmin && emailAdmin && senhaAdmin) {
      await User.create({
        tenantId,
        nome: `Admin ${nome}`,
        email: emailAdmin,
        senha: senhaAdmin,
        role: 'tenant_admin',
        ativo: true
      });
    }
    
    res.status(201).json({
      success: true,
      tenant: novoTenant,
      message: 'Tenant criado com sucesso!',
      admin: criarAdmin ? { email: emailAdmin, senha: senhaAdmin } : null
    });
    
  } catch (error) {
    console.error('Erro ao criar tenant:', error);
    res.status(500).json({ error: 'Erro ao criar tenant: ' + error.message });
  }
});

// Atualizar tenant
app.put('/api/tenants/:id', async (req, res) => {
  try {
    const { nome, slug, telefone, email, endereco, status } = req.body;
    const tenantId = req.params.id;
    
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant não encontrado' });
    }
    
    // Validar slug único (se mudou)
    if (slug && slug !== tenant.slug) {
      const slugExiste = await Tenant.findOne({ slug });
      if (slugExiste) {
        return res.status(400).json({ error: 'Slug já está em uso' });
      }
      tenant.slug = slug;
    }
    
    // Atualizar campos
    if (nome) tenant.nome = nome;
    if (telefone !== undefined) tenant.telefone = telefone;
    if (email !== undefined) tenant.email = email;
    if (endereco !== undefined) tenant.endereco = endereco;
    if (status) tenant.status = status;
    
    await tenant.save();
    
    res.json({
      success: true,
      tenant,
      message: 'Tenant atualizado com sucesso!'
    });
    
  } catch (error) {
    console.error('Erro ao atualizar tenant:', error);
    res.status(500).json({ error: 'Erro ao atualizar tenant: ' + error.message });
  }
});

// Excluir tenant (com confirmação)
app.delete('/api/tenants/:id', async (req, res) => {
  try {
    const tenantId = req.params.id;
    
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant não encontrado' });
    }
    
    // Excluir todos os dados relacionados
    await Promise.all([
      Categoria.deleteMany({ tenantId }),
      Produto.deleteMany({ tenantId }),
      User.deleteMany({ tenantId }),
      Tenant.deleteOne({ tenantId })
    ]);
    
    res.json({
      success: true,
      message: 'Tenant e todos os dados relacionados foram excluídos!'
    });
    
  } catch (error) {
    console.error('Erro ao excluir tenant:', error);
    res.status(500).json({ error: 'Erro ao excluir tenant: ' + error.message });
  }
});

// Status da conexão
app.get('/api/status', async (req, res) => {
  res.json({
    mongodb: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado',
    database: mongoose.connection.name,
    ambiente: process.env.NODE_ENV || 'development',
    uri: MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')
  });
});

// ===================================
// SERVIDOR
// ===================================
app.listen(PORT, () => {
  console.log(`\n🚀 Super Admin rodando em: http://localhost:${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 MongoDB: ${mongoose.connection.readyState === 1 ? 'Conectado' : 'Conectando...'}\n`);
});
