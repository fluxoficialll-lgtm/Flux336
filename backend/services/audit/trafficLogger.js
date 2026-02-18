
/**
 * FÁBRICA DE LOGGER DE TRÁFEGO - Visão Clara e Configurável do Fluxo de Dados
 * 
 * O logger transforma os logs técnicos em um formato JSON estruturado.
 * Esta versão usa uma fábrica para criar um logger configurável, permitindo
 * que o nível de log seja controlado por variáveis de ambiente.
 */

// Níveis de severidade dos logs. Um nível mais baixo inclui todos os níveis acima dele.
const severities = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

/**
 * Cria e retorna uma instância do logger configurada com um nível de log específico.
 * @param {object} options - Opções de configuração para o logger.
 * @param {string} options.level - O nível mínimo de log a ser registrado (e.g., 'info', 'debug').
 */
export const createLogger = ({ level = 'info' }) => {
    const configuredSeverity = severities[level.toLowerCase()] ?? severities.info;

    // Função central que formata e exibe o log como JSON, respeitando o nível.
    const log = (logLevel, direction, details) => {
        const logSeverity = severities[logLevel];
        // Só registra a mensagem se a severidade dela for igual ou maior que a configurada.
        if (logSeverity >= configuredSeverity) {
            const logEntry = {
                timestamp: new Date().toISOString(),
                level: logLevel,
                direction, // 'inbound', 'outbound', 'system'
                ...details
            };
            // Converte para JSON e imprime no console.
            console.log(JSON.stringify(logEntry));
        }
    };

    // Retorna o objeto logger com todos os seus métodos.
    return {
        logInbound: (req) => {
            const { method, path, headers, ip } = req;
            const traceId = req.traceId;

            if (path === '/' || path === '/api/ping') return;

            log('info', 'inbound', {
                message: `Requisição recebida: ${method} ${path}`,
                trace_id: traceId,
                details: {
                    source_ip: ip,
                    method,
                    path,
                    origin: headers['origin'],
                    user_agent: headers['user-agent'],
                    content_length: headers['content-length'] || 0
                }
            });
        },

        logOutbound: (req, res, duration) => {
            const { method, path } = req;
            const { statusCode } = res;
            const traceId = req.traceId;

            // Ignora rotas de health check ou irrelevantes
            if (path === '/' || path === '/api/ping') return;

            // Determina o nível do log com base no status code
            const isSuccess = statusCode < 400;
            const logLevel = isSuccess ? 'info' : 'error';

            // Constrói o caminho da rota se existir (ex: /users/:id)
            const routePath = req.route ? req.baseUrl + req.route.path : 'N/A';

            const message = isSuccess 
                ? `Resposta enviada: ${statusCode} ${method} ${path}`
                : `Falha ao processar: ${statusCode} ${method} ${path}`;

            log(logLevel, 'outbound', {
                message,
                trace_id: traceId,
                details: {
                    method,
                    path,
                    route: routePath, // << AQUI ESTÁ A INFORMAÇÃO QUE FALTAVA
                    status_code: statusCode,
                    duration_ms: duration,
                }
            });
        },

        logError: (error, req, message = 'Erro inesperado no sistema') => {
            const traceId = req?.traceId || 'no-trace-in-error';
            const routePath = req && req.route ? req.baseUrl + req.route.path : 'N/A';
            
            log('error', 'system', {
                message,
                trace_id: traceId,
                error: {
                    message: error.message,
                    stack: error.stack?.split('\n').map(line => line.trim()),
                },
                request_context: req ? { 
                    method: req.method, 
                    path: req.path, 
                    route: routePath // << E AQUI TAMBÉM
                } : undefined
            });
        },

        logSystem: (logLevel, message, details) => {
            log(logLevel, 'system', {
                message,
                ...details
            });
        },
        
        log, // Exporta a função base para usos específicos se necessário.
    };
};
