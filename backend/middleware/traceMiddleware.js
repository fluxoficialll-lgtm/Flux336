
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware para garantir que toda requisição tenha um ID de rastreamento único.
 * Este ID (traceId) é essencial para correlacionar logs e rastrear o fluxo completo de uma operação.
 */
export const traceMiddleware = (req, res, next) => {
    // Se o header já existir (vindo de um serviço externo ou do cliente), use-o.
    // Caso contrário, gere um novo UUID.
    const traceId = req.headers['x-flux-trace-id'] || uuidv4();
    
    // Garante que o header esteja definido para a resposta e para os próximos middlewares.
    req.headers['x-flux-trace-id'] = traceId;
    res.setHeader('x-flux-trace-id', traceId);

    // Adiciona o traceId diretamente ao objeto `req` para fácil acesso nos loggers e serviços.
    req.traceId = traceId;

    next();
};
