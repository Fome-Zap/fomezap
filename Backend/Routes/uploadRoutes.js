// Routes/uploadRoutes.js - Rotas de upload
import { Router } from "express";
import upload from "../middleware/upload.js";
import UploadController from "../Controllers/UploadController.js";

const router = Router();

// Upload de imagem de produto
router.post(
  "/upload/:tenantId/produtos", 
  upload.single('imagem'), 
  UploadController.uploadProduto
);

// Upload de logo
router.post(
  "/upload/:tenantId/logo", 
  upload.single('logo'), 
  UploadController.uploadLogo
);

// Upload de imagem de categoria
router.post(
  "/upload/:tenantId/categorias", 
  upload.single('imagem'), 
  UploadController.uploadCategoria
);

// Deletar arquivo
router.delete(
  "/upload/delete", 
  UploadController.deletarArquivo
);

export default router;
