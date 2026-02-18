
import express from 'express';
import { logger } from '../config.js';

const router = express.Router();

/**
 * Rota para receber e registrar eventos de log originados no frontend.
 * 
 * Esta rota permite que a aplicação frontend envie dados de log estruturados
 * para o backend, que então os utiliza para criar um registro de log do sistema.
 * Isso é crucial para obter uma visibilidade completa do comportamento do usuário
 * e para depurar problemas que ocorrem no lado do cliente.
 */
router.post('/', (req, res) => {
    // Extrai as informações de log do corpo da requisição.
    const { level = 'info', message, details } = req.body;
    const traceId = req.traceId; // O traceId é injetado pelo nosso middleware principal.

    // Validação básica para garantir que a mensagem de log foi fornecida.
    if (!message) {
        return res.status(400).json({ error: 'A propriedade \'message\' é obrigatória para o log.' });
    }

    // Utiliza o logger do sistema para registrar o evento do frontend.
    // Adicionamos um contexto para identificar facilmente a origem do log.
    logger.logSystem(level, message, {
        traceId,
        source: 'frontend',
        details: details || {},
    });

    // Retorna uma resposta de sucesso para o cliente.
    res.status(202).json({ status: 'log received' });
});

export { router as clientLogsRoutes };
