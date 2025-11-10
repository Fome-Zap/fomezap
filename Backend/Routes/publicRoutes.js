// Routes/publicRoutes.js - Rotas públicas do cardápio (sem autenticação)
import { Router } from "express";
import AdminController from "../Controllers/AdminController.js";
import ConfiguracoesController from "../Controllers/ConfiguracoesController.js";

const router = Router();

// === ROTAS PÚBLICAS DO CARDÁPIO (SEM AUTENTICAÇÃO) ===
// Essas rotas são usadas pelo cardápio do cliente (FomeZapExact)

// Listar categorias (público)
router.get("/:tenantId/cardapio/categorias", AdminController.listarCategorias);

// Listar produtos (público)
router.get("/:tenantId/cardapio/produtos", AdminController.listarProdutos);

// Listar extras (público)
router.get("/:tenantId/cardapio/extras", AdminController.listarExtras);

// Buscar configurações (público)
router.get("/:tenantId/cardapio/configuracoes", ConfiguracoesController.buscarConfiguracoes);

// Verificar horário de funcionamento (público)
router.get("/:tenantId/cardapio/horario", ConfiguracoesController.verificarHorarioFuncionamento);

export default router;
