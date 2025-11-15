// Routes/publicRoutes.js - Rotas públicas do cardápio (sem autenticação)
import { Router } from "express";
import AdminController from "../Controllers/AdminController.js";
import ConfiguracoesController from "../Controllers/ConfiguracoesController.js";
import { Tenant } from "../Models/TenantModels.js";

const router = Router();

// Middleware para validar se tenant existe (usa detecção automática ou parâmetro)
async function validarTenantPublico(req, res, next) {
  try {
    // Tentar pegar tenantId do middleware detectarTenant ou do parâmetro da rota
    let tenantId = req.tenantId || req.params.tenantId;
    
    if (!tenantId) {
      return res.status(400).json({ 
        error: 'Tenant não identificado. Use subdomínio ou parâmetro ?tenant=ID',
        hint: 'Exemplo: familia.fomezap.com ou /?tenant=demo'
      });
    }
    
    // Se já foi detectado pelo middleware, usar tenant existente
    if (req.tenant && req.tenant.tenantId === tenantId) {
      return next();
    }
    
    // Buscar tenant no banco
    const tenant = await Tenant.findOne({ 
      $or: [
        { tenantId },
        { slug: tenantId }
      ],
      status: { $in: ['ativo', 'trial'] } 
    });
    
    if (!tenant) {
      return res.status(404).json({ 
        error: 'Restaurante não encontrado ou inativo',
        tenantId 
      });
    }
    
    req.tenant = tenant;
    req.tenantId = tenant.tenantId;
    req.tenantSlug = tenant.slug;
    next();
  } catch (error) {
    console.error('Erro ao validar tenant público:', error);
    res.status(500).json({ error: 'Erro ao validar restaurante' });
  }
}

// === ROTAS PÚBLICAS DO CARDÁPIO (SEM AUTENTICAÇÃO) ===
// Essas rotas são usadas pelo cardápio do cliente (FomeZapExact)

// ROTAS COM DETECÇÃO AUTOMÁTICA (subdomínio)
// Exemplo: familia.fomezap.com/api/cardapio/categorias
router.get("/cardapio/categorias", validarTenantPublico, AdminController.listarCategorias);
router.get("/cardapio/produtos", validarTenantPublico, AdminController.listarProdutos);
router.get("/cardapio/extras", validarTenantPublico, AdminController.listarExtras);
router.get("/cardapio/configuracoes", validarTenantPublico, ConfiguracoesController.buscarConfiguracoes);
router.get("/cardapio/horario", validarTenantPublico, ConfiguracoesController.verificarHorarioFuncionamento);

// ROTAS COM PARÂMETRO (compatibilidade com versão antiga)
// Exemplo: localhost:5173/api/demo/cardapio/categorias
router.get("/:tenantId/cardapio/categorias", validarTenantPublico, AdminController.listarCategorias);
router.get("/:tenantId/cardapio/produtos", validarTenantPublico, AdminController.listarProdutos);
router.get("/:tenantId/cardapio/extras", validarTenantPublico, AdminController.listarExtras);
router.get("/:tenantId/cardapio/configuracoes", validarTenantPublico, ConfiguracoesController.buscarConfiguracoes);
router.get("/:tenantId/cardapio/horario", validarTenantPublico, ConfiguracoesController.verificarHorarioFuncionamento);

export default router;
