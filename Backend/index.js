import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import tenantRoutes from "./Routes/tenantRoutes.js";
import adminRoutes from "./Routes/adminRoutes.js";
import authRoutes from "./Routes/authRoutes.js";
import publicRoutes from "./Routes/publicRoutes.js";
import upload from "./Middlewares/upload.js";
import { handleMulterError } from "./Middlewares/upload.js";
import { verificarToken, verificarTenantAdmin } from "./Middlewares/auth.js";
import UploadController from "./Controllers/UploadController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new express();

//json - troca de mensagens entre backend e frontend
app.use(express.json())

// Servir arquivos estáticos (uploads e fotos padrão)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/fotos-padrao', express.static(path.join(__dirname, 'public', 'fotos-padrao')));

//cors comunicação entre duas aplicações que rodam em portas diferentes - ADAPTADO PARA MULTI-TENANT
app.use(cors({
    credentials: true, 
    origin: [
        "http://localhost",
        "http://localhost:80",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:3000",
        /^https?:\/\/[a-z0-9-]+\.fomezap\.com$/,  // Subdomínios em produção
        /^https?:\/\/[a-z0-9-]+\.localhost:[0-9]+$/,  // Subdomínios em desenvolvimento
        /^https:\/\/.*\.vercel\.app$/  // Qualquer deploy Vercel
    ]
}))

// === ROTAS PÚBLICAS (SEM AUTENTICAÇÃO) ===
// Autenticação
app.use("/api/auth", authRoutes);

// Cardápio público (para clientes acessarem sem login)
app.use("/api", publicRoutes);

// Upload de fotos (público para testar, depois proteger)
app.post("/api/upload/foto", upload.single('foto'), handleMulterError, UploadController.uploadFoto);
app.get("/api/upload/fotos-padrao", UploadController.listarFotosPadrao);

// === ROTAS DO PAINEL ADMINISTRATIVO (PROTEGIDAS) ===
// Proteger todas as rotas /api/admin/* com autenticação
// Nota: verificarTenantAdmin aplicado dentro das rotas para ter acesso ao req.params
app.use("/api/admin", verificarToken, adminRoutes);

// Deletar foto (protegida)
app.delete("/api/upload/foto/:filename", verificarToken, UploadController.deletarFoto);

// === ROTAS DE UPLOAD (ANTIGAS - MANTER COMPATIBILIDADE) ===
// app.use("/api", uploadRoutes);

// === ROTAS MULTI-TENANT (FomeZap) - POR ÚLTIMO ===
app.use("/api", tenantRoutes);

// === ROTA DE HEALTH CHECK ===
app.get("/health", (req, res) => {
    res.json({ 
        status: "ok", 
        service: "FomeZap API",
        timestamp: new Date().toISOString(),
        version: "1.0.0"
    });
});

// === ROTA PARA DETECÇÃO DE TENANT (DEBUG) ===
app.get("/detect-tenant", (req, res) => {
    const host = req.get('host');
    let tenantId = null;
    
    if (host?.includes('.fomezap.com')) {
        tenantId = host.replace('.fomezap.com', '');
    } else if (host?.includes('localhost')) {
        tenantId = req.query.tenant || 'desenvolvimento';
    }
    
    res.json({
        host,
        tenantId,
        detected: !!tenantId,
        environment: process.env.NODE_ENV || 'development'
    });
});

// === MIDDLEWARE DE ERRO GLOBAL ===
app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
    res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado'
    });
});

// === ROTA PARA CRIAR DADOS DEMO (TEMPORÁRIA) ===
app.get("/setup-demo", async (req, res) => {
    try {
        const { Tenant, Categoria, Produto, Extra } = await import("./Models/TenantModels.js");
        
        // Limpar dados existentes
        await Tenant.deleteOne({ tenantId: 'demo' });
        await Categoria.deleteMany({ tenantId: 'demo' });
        await Produto.deleteMany({ tenantId: 'demo' });
        await Extra.deleteMany({ tenantId: 'demo' });

        // Criar tenant
        const tenant = new Tenant({
            tenantId: 'demo',
            nome: 'Lanches do João',
            slug: 'lanches-do-joao',
            telefone: '(11) 99999-9999',
            endereco: 'Rua dos Lanches, 123',
            tema: {
                corPrimaria: '#ff6b35',
                corSecundaria: '#2c3e50', 
                corBotao: '#27ae60'
            },
            configuracoes: {
                mostarPrecos: true,
                permitirExtras: true,
                taxaEntrega: 5.00,
                pedidoMinimo: 25.00,
                formasPagamento: ['dinheiro', 'pix'],
                mensagemWhatsApp: 'Olá! Gostaria de fazer um pedido:'
            },
            status: 'ativo'
        });
        await tenant.save();

        // Criar categorias
        const categorias = await Categoria.insertMany([
            { tenantId: 'demo', nome: 'Hambúrguers', icone: '🍔', ordem: 1, ativa: true },
            { tenantId: 'demo', nome: 'Bebidas', icone: '🥤', ordem: 2, ativa: true }
        ]);

        // Criar produtos
        await Produto.insertMany([
            {
                tenantId: 'demo',
                codigo: '01',
                nome: 'X-Burger',
                descricao: 'Hambúrguer com queijo, alface e tomate',
                preco: 18.90,
                categoria: categorias[0]._id,
                disponivel: true
            },
            {
                tenantId: 'demo',
                codigo: '02',
                nome: 'X-Bacon',
                descricao: 'Hambúrguer com bacon e queijo',
                preco: 22.90,
                categoria: categorias[0]._id,
                disponivel: true
            },
            {
                tenantId: 'demo',
                codigo: '10',
                nome: 'Coca-Cola',
                descricao: 'Refrigerante 350ml',
                preco: 5.50,
                categoria: categorias[1]._id,
                disponivel: true
            }
        ]);

        res.json({ 
            success: true, 
            message: 'Dados demo criados com sucesso!',
            tenant: 'demo',
            testUrl: 'http://localhost:5173?tenant=demo'
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 FomeZap API rodando na porta ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔍 Debug tenant: http://localhost:${PORT}/detect-tenant`);
    console.log(`🏪 API Multi-tenant: http://localhost:${PORT}/api/*`);
    console.log(`⚙️  Painel Admin: http://localhost:${PORT}/api/admin/*`);
});

export default app;