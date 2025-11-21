// Routes/adminRoutes.js - Rotas do painel administrativo
import { Router } from "express";
import AdminController from "../Controllers/AdminController.js";
import ConfiguracoesController from "../Controllers/ConfiguracoesController.js";
import PedidoController from "../Controllers/PedidoController.js";
import { verificarTenantAdmin } from "../Middlewares/auth.js";

const router = Router();

// ============================================
// DASHBOARD
// ============================================
router.get("/:tenantId/dashboard", verificarTenantAdmin, AdminController.getDashboard);

// ============================================
// CATEGORIAS
// ============================================
router.get("/:tenantId/categorias", verificarTenantAdmin, AdminController.listarCategorias);
router.post("/:tenantId/categorias", verificarTenantAdmin, AdminController.criarCategoria);
router.put("/:tenantId/categorias/:id", verificarTenantAdmin, AdminController.editarCategoria);
router.delete("/:tenantId/categorias/:id", verificarTenantAdmin, AdminController.deletarCategoria);
router.put("/:tenantId/categorias/reordenar", verificarTenantAdmin, AdminController.reordenarCategorias);

// ============================================
// PRODUTOS
// ============================================
router.get("/:tenantId/produtos", verificarTenantAdmin, AdminController.listarProdutos);
router.get("/:tenantId/produtos/:id", verificarTenantAdmin, AdminController.buscarProduto);
router.post("/:tenantId/produtos", verificarTenantAdmin, AdminController.criarProduto);
router.put("/:tenantId/produtos/:id", verificarTenantAdmin, AdminController.editarProduto);
router.delete("/:tenantId/produtos/:id", verificarTenantAdmin, AdminController.deletarProduto);
router.patch("/:tenantId/produtos/:id/toggle", verificarTenantAdmin, AdminController.toggleDisponibilidade);
router.put("/:tenantId/produtos/reordenar", verificarTenantAdmin, AdminController.reordenarProdutos);

// ============================================
// EXTRAS
// ============================================
router.get("/:tenantId/extras", verificarTenantAdmin, AdminController.listarExtras);
router.post("/:tenantId/extras", verificarTenantAdmin, AdminController.criarExtra);
router.put("/:tenantId/extras/:id", verificarTenantAdmin, AdminController.editarExtra);
router.delete("/:tenantId/extras/:id", verificarTenantAdmin, AdminController.deletarExtra);
router.put("/:tenantId/extras/reordenar", verificarTenantAdmin, AdminController.reordenarExtras);

// ============================================
// CONFIGURAÇÕES
// ============================================
router.get("/:tenantId/configuracoes", verificarTenantAdmin, ConfiguracoesController.buscarConfiguracoes);
router.put("/:tenantId/configuracoes", verificarTenantAdmin, ConfiguracoesController.atualizarConfiguracoes);

// ============================================
// HORÁRIO DE FUNCIONAMENTO (Para o cardápio público)
// ============================================
router.get("/:tenantId/horario", verificarTenantAdmin, ConfiguracoesController.verificarHorarioFuncionamento);

// ============================================
// PEDIDOS
// ============================================
router.get("/:tenantId/pedidos", verificarTenantAdmin, AdminController.listarPedidos);
router.get("/:tenantId/pedidos/:id", verificarTenantAdmin, AdminController.buscarPedido);
router.patch("/:tenantId/pedidos/:id", verificarTenantAdmin, AdminController.atualizarStatusPedido);
router.delete("/:tenantId/pedidos/:id", verificarTenantAdmin, AdminController.deletarPedido);

// ============================================
// ROTA PÚBLICA - CRIAR PEDIDO (Cliente)
// ============================================
router.post("/:tenantId/pedidos", PedidoController.create);

export default router;
