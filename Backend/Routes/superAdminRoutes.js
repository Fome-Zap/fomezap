// Routes/superAdminRoutes.js - Rotas exclusivas para Super Admin
import { Router } from "express";
import SuperAdminController from "../Controllers/SuperAdminController.js";
import { verificarToken, verificarSuperAdmin } from "../Middlewares/auth.js";

const router = Router();

// Todas as rotas exigem autenticação E role super_admin
router.use(verificarToken);
router.use(verificarSuperAdmin);

// === ESTATÍSTICAS ===
router.get("/stats", SuperAdminController.estatisticas);

// === GERENCIAR TENANTS ===
router.get("/tenants", SuperAdminController.listarTenants);
router.post("/tenants", SuperAdminController.criarTenant);
router.put("/tenants/:tenantId", SuperAdminController.atualizarTenant);
router.delete("/tenants/:tenantId", SuperAdminController.excluirTenant);
router.patch("/tenants/:tenantId/status", SuperAdminController.alterarStatus);

// === ALTERAR SENHA E GERAR ACESSO ===
router.patch("/tenants/:tenantId/alterar-senha", SuperAdminController.alterarSenhaTenant);
router.post("/tenants/:tenantId/gerar-acesso", SuperAdminController.gerarAcessoTenant);

export default router;
