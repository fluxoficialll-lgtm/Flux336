
/**
 * LOGGER DE TRÁFEGO - Visão Clara do Fluxo de Dados
 * 
 * Este logger aprimorado transforma os logs técnicos em um formato JSON estruturado,
 * que é mais fácil de ler e perfeito para ser enviado a um painel de monitoramento.
 */

// Função central que formata e exibe o log como JSON.
const log = (level, direction, details) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        level, // 'info', 'warn', 'error'
        direction, // 'inbound', 'outbound', 'system'
        ...details
    };
    // Converte o objeto de log em uma string JSON e imprime no console.
    // Ideal para sistemas de logging centralizado (Splunk, ELK, Datadog).
    console.log(JSON.stringify(logEntry));
};

/**
 * O objeto trafficLogger encapsula os métodos de logging para manter a consistência.
 * Ele utiliza o `traceId` injetado pelo `traceMiddleware`.
 */
export const trafficLogger = {
    logInbound: (req) => {
        const { method, path, headers, ip } = req;
        // O traceId é garantido pelo middleware que deve ser executado antes.
        const traceId = req.traceId;

        const isHealthCheck = (path === '/' || path === '/api/ping');
        if (isHealthCheck) {
            // Ocultamos os health checks por padrão para não poluir os logs.
            return;
        }

        log('info', 'inbound', {
            message: `Requisição recebida: ${method} ${path}`,
            trace_id: traceId,
            details: {
                source_ip: ip,
                method,
                path,
                // Log de headers essenciais e seguros, evitando tokens e cookies.
                origin: headers['origin'],
                user_agent: headers['user-agent'],
                content_length: headers['content-length'] || 0
            }
        });
    },

    logOutbound: (req, res, duration) => {
        const { method, path } = req;
        const { statusCode } = res;
        // O traceId é garantido pelo middleware.
        const traceId = req.traceId;

        if ((path === '/' || path === '/api/ping')) return; // Silencia pings

        const isSuccess = statusCode < 400;
        const level = isSuccess ? 'info' : 'error';
        const message = isSuccess 
            ? `Resposta enviada com sucesso: ${statusCode} ${method} ${path}`
            : `Falha ao processar a requisição: ${statusCode} ${method} ${path}`;

        log(level, 'outbound', {
            message,
            trace_id: traceId,
            details: {
                method,
                path,
                status_code: statusCode,
                duration_ms: duration,
            }
        });
    },

    logError: (error, req, message = 'Erro inesperado no sistema') => {
        // Garante o traceId mesmo em erros onde o middleware possa ter falhado.
        const traceId = req.traceId || 'no-trace-in-error';
        log('error', 'system', {
            message,
            trace_id: traceId,
            error: {
                message: error.message,
                stack: error.stack,
            },
            request_context: {
                method: req.method,
                path: req.path
            }
        });
    },

    // Logger genérico para eventos internos do sistema (services, repos, etc.)
    logSystem: (level, message, details) => {
        log(level, 'system', {
            message,
            ...details
        });
    },
    
    // Exporta a função base para usos específicos se necessário.
    log
};
