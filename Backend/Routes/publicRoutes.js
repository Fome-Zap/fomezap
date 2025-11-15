// Routes/publicRoutes.js - Rotas públicas do cardápio (sem autenticação)
import { Router } from "express";
import AdminController from "../Controllers/AdminController.js";
import ConfiguracoesController from "../Controllers/ConfiguracoesController.js";
import { Tenant } from "../Models/TenantModels.js";

const router = Router();

// Middleware para validar se tenant existe
async function validarTenantPublico(req, res, next) {
  try {
    const tenantId = req.params.tenantId;
    const tenant = await Tenant.findOne({ 
      tenantId, 
      status: { $in: ['ativo', 'trial'] } 
    });
    
    if (!tenant) {
      return res.status(404).json({ 
        error: 'Restaurante não encontrado ou inativo',
        tenantId 
      });
    }
    
    req.tenant = tenant;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao validar restaurante' });
  }
}

// === ROTAS PÚBLICAS DO CARDÁPIO (SEM AUTENTICAÇÃO) ===
// Essas rotas são usadas pelo cardápio do cliente (FomeZapExact)

// Listar categorias (público)
router.get("/:tenantId/cardapio/categorias", validarTenantPublico, AdminController.listarCategorias);

// Listar produtos (público)
router.get("/:tenantId/cardapio/produtos", validarTenantPublico, AdminController.listarProdutos);

// Listar extras (público)
router.get("/:tenantId/cardapio/extras", validarTenantPublico, AdminController.listarExtras);

// Buscar configurações (público)
router.get("/:tenantId/cardapio/configuracoes", validarTenantPublico, ConfiguracoesController.buscarConfiguracoes);

// Verificar horário de funcionamento (público)
router.get("/:tenantId/cardapio/horario", validarTenantPublico, ConfiguracoesController.verificarHorarioFuncionamento);

export default router;
