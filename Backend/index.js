import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "./db/conn.js";
import tenantRoutes from "./Routes/tenantRoutes.js";
import adminRoutes from "./Routes/adminRoutes.js";
import authRoutes from "./Routes/authRoutes.js";
import publicRoutes from "./Routes/publicRoutes.js";
import superAdminRoutes from "./Routes/superAdminRoutes.js";
import upload from "./Middlewares/upload.js";
import { handleMulterError } from "./Middlewares/upload.js";
import { verificarToken, verificarTenantAdmin } from "./Middlewares/auth.js";
import detectarTenant from "./Middlewares/detectarTenant.js";
import { validarDominioManager } from "./Middlewares/validarDominio.js";
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
    origin: function(origin, callback) {
        // Permitir requests sem origin (mobile apps, Postman)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            "http://localhost",
            "http://localhost:80",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "http://localhost:5176",
            "http://localhost:3000",
            "https://fomezap.netlify.app",
            "https://demo.fomezap.com",
            "https://familia.fomezap.com",
            "https://lanchoneteemfamilia.fomezap.com",
            "https://thi-burg.fomezap.com",
            "https://manager.fomezap.com"
        ];
        
        // Verificar origins permitidas ou patterns
        if (allowedOrigins.includes(origin) ||
            /^https?:\/\/[a-z0-9-]+\.fomezap\.com$/.test(origin) ||
            /^https?:\/\/[a-z0-9-]+\.localhost:[0-9]+$/.test(origin) ||
            /^https:\/\/.*\.vercel\.app$/.test(origin) ||
            /^https:\/\/.*\.netlify\.app$/.test(origin)) {
            callback(null, true);
        } else {
            console.warn('⚠️  Origin bloqueada pelo CORS:', origin);
            callback(new Error('Origin não permitida pelo CORS'));
        }
    }
}))

// ============================================================
// ORDEM CRÍTICA DAS ROTAS - NÃO ALTERAR!
// Rotas mais específicas DEVEM vir ANTES das genéricas
// ============================================================

// === ROTAS DO SUPER ADMIN (SEM DETECÇÃO DE TENANT + VALIDAÇÃO DE DOMÍNIO) ===
// DEVE ser a PRIMEIRA rota /api/* para evitar conflito com outras rotas genéricas
// CRÍTICO: Validar domínio manager.fomezap.com para segurança
app.use("/api/super-admin", validarDominioManager, superAdminRoutes);

// === ROTAS DE AUTENTICAÇÃO (SEM DETECÇÃO DE TENANT) ===
app.use("/api/auth", authRoutes);

// === ROTAS DO PAINEL ADMINISTRATIVO (SEM DETECÇÃO DE TENANT - USA TOKEN) ===
// Proteger todas as rotas /api/admin/* com autenticação
app.use("/api/admin", verificarToken, adminRoutes);

// === MIDDLEWARE DE DETECÇÃO DE TENANT ===
// A partir daqui, TODAS as rotas passam pela detecção de tenant
app.use(detectarTenant);

// === ROTAS PÚBLICAS DO CARDÁPIO (COM DETECÇÃO DE TENANT) ===
app.use("/api", publicRoutes);

// === UPLOAD DE FOTOS ===
app.post("/api/upload/foto", upload.single('foto'), handleMulterError, UploadController.uploadFoto);
app.get("/api/upload/fotos-padrao", UploadController.listarFotosPadrao);
app.delete("/api/upload/foto/:filename", verificarToken, UploadController.deletarFoto);

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

// === MIDDLEWARE 404 (deve vir antes do erro global) ===
app.use((req, res, next) => {
    res.status(404).json({ 
        error: 'Rota não encontrada',
        path: req.path,
        method: req.method
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