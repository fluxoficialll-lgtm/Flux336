
import express from 'express';
import { handleGoogleAuth } from '../services/googleAuthService.js';
import { passwordAuthService } from '../services/passwordAuthService.js';

const router = express.Router();

// A verificação de traceId e o log de tráfego agora são feitos
// pelo middleware global em `backend/routes.js`.

// Rota para autenticação com Google
router.post('/google', handleGoogleAuth);

// Rotas para autenticação com email e senha
router.post('/login', passwordAuthService.login);
router.post('/register', passwordAuthService.register);

export { router as authRoutes };
