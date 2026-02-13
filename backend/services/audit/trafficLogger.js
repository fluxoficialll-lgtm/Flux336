
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
    // Imprime o objeto JSON completo no console.
    // Ferramentas como Loki/Grafana vão ler esta linha.
    console.log(JSON.stringify(logEntry));
};

export const trafficLogger = {
    logInbound: (req) => {
        const { method, path, headers, ip } = req;
        const traceId = headers['x-flux-trace-id'] || 'no-trace';
        const isHealthCheck = (path === '/' || path === '/api/ping') && (method === 'GET' || method === 'HEAD');

        if (isHealthCheck) {
            // Ocultamos os health checks por padrão para não poluir os logs principais,
            // mas eles podem ser ativados para depuração mudando o 'level' para 'info'.
            log('debug', 'system', {
                message: 'Batimento cardíaco do sistema (Health Check).',
                details: { method, path, traceId }
            });
            return;
        }

        log('info', 'inbound', {
            message: `Requisição recebida: ${method} ${path}`,
            source_ip: ip,
            trace_id: traceId,
            details: {
                method,
                path,
                size_bytes: headers['content-length'] || 0
            }
        });
    },

    logOutbound: (req, res, duration) => {
        const { method, path, headers } = req;
        const { statusCode } = res;
        const traceId = headers['x-flux-trace-id'] || 'no-trace';

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

    logCors: (req) => {
        log('info', 'system', {
            message: 'Requisição de pré-verificação (CORS Preflight) recebida.',
            details: {
                origin: req.headers.origin || 'unknown'
            }
        });
    }
};
