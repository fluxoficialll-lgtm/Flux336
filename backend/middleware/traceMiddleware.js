
import crypto from 'crypto';

/**
 * Middleware de Rastreamento (Trace)
 * 
 * Garante que toda requisição tenha um identificador único de rastreamento (traceId).
 * Isso é essencial para seguir o fluxo de uma operação do início ao fim,
 * conectando logs do frontend, backend, serviços e banco de dados.
 */
export const traceMiddleware = (req, res, next) => {
    // 1. Verifica se um traceId já foi enviado pelo cliente (ex: frontend).
    // O cabeçalho 'x-flux-trace-id' é nosso padrão para propagação entre sistemas.
    const incomingTrace = req.headers['x-flux-trace-id'];

    // 2. Garante a existência do traceId:
    //    - Se o cliente enviou um, nós o usamos para manter a continuidade do rastreio.
    //    - Se não, geramos um novo UUID. Isso garante que o backend SEMPRE tenha um trace.
    const traceId = incomingTrace || crypto.randomUUID();

    // 3. Injeta o traceId no objeto `req` para que ele fique disponível
    //    em todas as camadas subsequentes (rotas, serviços, repositórios).
    req.traceId = traceId;

    // 4. Devolve o traceId no cabeçalho da resposta. Isso permite que o cliente
    //    (ou quem fez a requisição) também possa correlacionar a resposta ao seu pedido inicial.
    res.setHeader('x-flux-trace-id', traceId);

    // 5. Passa o controle para o próximo middleware ou rota na cadeia do Express.
    next();
};
