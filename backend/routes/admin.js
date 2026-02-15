
import express from 'express';
import { validateAdmin } from '../middleware.js';
import { adminDispatcher } from './admin/dispatcher.js';

const router = express.Router();

// Aplica o middleware de validação a todas as rotas de admin.
router.use(validateAdmin);

// CORREÇÃO: A rota foi ajustada para /:category/:action para corresponder à URL
// que o frontend está chamando (ex: /system/config) e resolver o erro 404.
router.all('/execute/:category/:action', adminDispatcher);

export default router;
