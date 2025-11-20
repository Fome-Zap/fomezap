import express from 'express';
import AuthController from '../Controllers/AuthController.js';
import { verificarToken } from '../Middlewares/auth.js';

const router = express.Router();

// Rotas públicas (sem autenticação)
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/recuperar-senha', AuthController.recuperarSenha);
router.post('/resetar-senha/:token', AuthController.resetarSenha);

// Rotas protegidas (requerem autenticação)
router.get('/me', verificarToken, AuthController.me);
router.post('/alterar-senha', verificarToken, AuthController.alterarSenha);
router.post('/alterar-email', verificarToken, AuthController.alterarEmail);

export default router;
