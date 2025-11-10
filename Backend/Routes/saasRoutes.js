// Routes/saasRoutes.js
import { Router } from "express";
import TenantController from "../Controllers/TenantController.js";

const routes = Router();

// Middleware global para extrair e validar tenant
routes.use(TenantController.extractTenant);
routes.use(TenantController.validateTenant);

// Rotas públicas (cardápio)
routes.get("/config", TenantController.getConfig);

// Rotas de pedidos
routes.post("/pedidos", TenantController.createPedido);
routes.get("/pedidos/:id", TenantController.getPedido);

// Rotas administrativas (requer autenticação)
routes.use("/admin", authenticateAdmin); // Middleware de auth
routes.get("/admin/pedidos", TenantController.getPedidos);
routes.patch("/admin/pedidos/:id/status", TenantController.updateStatusPedido);
routes.get("/admin/estatisticas", TenantController.getEstatisticas);

// Middleware de autenticação simples (melhorar depois)
function authenticateAdmin(req, res, next) {
  const { authorization } = req.headers;
  
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }
  
  const token = authorization.replace('Bearer ', '');
  
  // Por enquanto, usar um token simples por tenant
  // TODO: Implementar JWT adequado
  if (token !== `admin_${req.tenantId}_2024`) {
    return res.status(401).json({ error: 'Token inválido' });
  }
  
  next();
}

export default routes;