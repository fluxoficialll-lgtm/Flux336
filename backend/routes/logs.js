
import express from 'express';

const router = express.Router();

/**
 * Formata e exibe um evento de log vindo do frontend.
 * @param {object} logData - O objeto de log enviado pelo cliente.
 */
const logFrontendEvent = (logData) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        level: logData.level || 'info', // 'info' como padrão se não for especificado
        direction: 'frontend', // Identifica a origem do log
        message: logData.message || 'Log do frontend sem mensagem específica.',
        ...logData 
    };
    // Imprime o objeto de log formatado em JSON para ser capturado pelo sistema de logging
    console.log(JSON.stringify(logEntry));
};

/**
 * Endpoint para ingestão de logs do cliente (frontend).
 * Rota: POST /api/logs/ingest
 * Recebe um corpo JSON com os dados de log e o registra no sistema.
 */
router.post('/ingest', (req, res) => {
    try {
        const logData = req.body;

        if (!logData || Object.keys(logData).length === 0) {
            logFrontendEvent({ 
                level: 'warn', 
                message: 'Recebida requisição de log vazia do frontend.', 
                details: { remote_ip: req.ip } 
            });
            return res.status(400).send({ status: 'Requisição inválida' });
        }
        
        // Registra o evento do frontend usando nossa função padronizada
        logFrontendEvent(logData);

        // Responde imediatamente com '202 Accepted'.
        // Isso informa ao cliente que o log foi recebido com sucesso, sem fazê-lo esperar.
        res.status(202).send({ status: 'Aceito' });

    } catch (error) {
        // Log de erro interno se a ingestão falhar
        console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'error',
            direction: 'system',
            message: 'Falha crítica no coletor de logs ao processar um evento do frontend.',
            error: {
                message: error.message,
            }
        }));
        res.status(500).send({ status: 'Erro Interno do Servidor' });
    }
});

export default router;
