
import express from 'express';
import { validateAdmin } from '../middleware.js';
// CORREÇÃO: Importa a função default do dispatcher, que é o próprio manipulador.
import adminDispatcher from './admin/dispatcher.js';

const router = express.Router();

// Aplica o middleware de validação a todas as rotas de admin.
router.use(validateAdmin);

// CORREÇÃO: Rota única que captura todos os comandos e os envia ao dispatcher.
// O dispatcher cuidará da lógica de encontrar e executar o comando correto.
router.all('/execute/:method/:category/:action', adminDispatcher);

export default router;
