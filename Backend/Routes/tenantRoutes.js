// Routes/tenantRoutes.js - Rotas Multi-Tenant (evolução do routes.js)
import { Router } from "express";
import PedidoController from "../Controllers/PedidoController.js";
import TenantController from "../Controllers/TenantController.js";

const tenantRoutes = Router();

// Middleware para extrair e validar tenant em todas as rotas
tenantRoutes.use(TenantController.extractTenant);
tenantRoutes.use(TenantController.validateTenant);

// === ROTAS DE CONFIGURAÇÃO ===
// Obter configuração completa do restaurante (JSON)
tenantRoutes.get("/config", TenantController.getConfig);

// === ROTAS DE PEDIDOS (Evolução das rotas de tarefas) ===
// Criar pedido (POST /Create -> POST /pedidos)
tenantRoutes.post("/pedidos", PedidoController.create);

// Listar todos os pedidos (GET /getAll -> GET /pedidos)
tenantRoutes.get("/pedidos", PedidoController.getAll);

// Buscar um pedido específico (GET /:id -> GET /pedidos/:id)
tenantRoutes.get("/pedidos/:id", PedidoController.getOne);

// Atualizar pedido completo (PUT /:id -> PUT /pedidos/:id)
tenantRoutes.put("/pedidos/:id", PedidoController.updateCompleta);

// Atualizar status do pedido (PATCH /:id -> PATCH /pedidos/:id)
tenantRoutes.patch("/pedidos/:id", PedidoController.updateParcial);

// Remover pedido (DELETE /:id -> DELETE /pedidos/:id)
tenantRoutes.delete("/pedidos/:id", PedidoController.remove);

// === ROTAS ESPECÍFICAS DO FOMEZAP ===
// Rota para criar pedido via formulário do site (facilita integração frontend)
tenantRoutes.post("/fazer-pedido", PedidoController.create);

// Rota para obter status de funcionamento
tenantRoutes.get("/status", (req, res) => {
  const agora = new Date();
  const horaAtual = agora.getHours() + ':' + agora.getMinutes().toString().padStart(2, '0');
  const diaAtual = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'][agora.getDay()];
  
  const { horarioFuncionamento } = req.tenant;
  const estaAberto = horarioFuncionamento.diasSemana.includes(diaAtual) &&
    horaAtual >= horarioFuncionamento.abertura &&
    horaAtual <= horarioFuncionamento.fechamento;
  
  res.json({
    aberto: estaAberto,
    horario: horarioFuncionamento,
    diaAtual,
    horaAtual
  });
});

// === ROTAS ADMINISTRATIVAS ===
// Estatísticas básicas
tenantRoutes.get("/admin/stats", async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    // Pedidos de hoje
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);
    
    const pedidosHoje = await PedidoController.contarPedidos({
      tenantId,
      createdAt: { $gte: hoje, $lt: amanha }
    });
    
    // Pedidos do mês
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const pedidosMes = await PedidoController.contarPedidos({
      tenantId,
      createdAt: { $gte: inicioMes }
    });
    
    // Faturamento do mês
    const faturamentoMes = await PedidoController.somarFaturamento({
      tenantId,
      createdAt: { $gte: inicioMes },
      status: { $in: ['pronto', 'saiu_entrega', 'entregue'] }
    });
    
    res.json({
      pedidosHoje,
      pedidosMes,
      faturamentoMes: faturamentoMes || 0,
      restaurante: req.tenant.nome
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar estatísticas' });
  }
});

export default tenantRoutes;